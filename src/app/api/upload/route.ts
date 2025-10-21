import { NextRequest, NextResponse } from 'next/server'
import { validateUploadedFile, sanitizeFilename } from '@/lib/serverValidation'
import { uploadToFilebase, getFilebaseGatewayUrl, getPublicGatewayUrls } from '@/lib/filebaseClient'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { scrapeUrls } from '@/lib/urlScraper'
import { extractTextFromFile, cleanTextForEmbedding } from '@/lib/textExtraction'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/upload
 * Upload files with server-side validation and Filebase IPFS upload
 * 
 * Story 3: Server-side validation ✅
 * Story 4: Filebase IPFS integration ✅
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    const urlsString = formData.get('urls') as string | null
    
    // Parse URLs if provided
    const urls: string[] = urlsString ? urlsString.split('\n').filter(Boolean).map(u => u.trim()) : []

    if ((!files || files.length === 0) && urls.length === 0) {
      return NextResponse.json(
        { error: 'No files or URLs provided' },
        { status: 400 }
      )
    }

    // Generate collection ID for this upload session
    const collectionId = randomUUID()

    // Validate and process each file
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          // Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Server-side validation
          const validation = validateUploadedFile(
            buffer,
            file.type,
            file.name
          )

          if (!validation.valid) {
            return {
              filename: file.name,
              success: false,
              error: validation.error,
              errorCode: validation.errorCode,
            }
          }

          // Sanitize filename
          const safeFilename = sanitizeFilename(file.name)

          // Story 4: Upload to Filebase IPFS
          const uploadResult = await uploadToFilebase(buffer, safeFilename)

          if (!uploadResult.success) {
            return {
              filename: file.name,
              success: false,
              error: `Filebase upload failed: ${uploadResult.error}`,
              errorCode: 'UPLOAD_FAILED',
            }
          }

          // Extract text content for search indexing
          let textContent: string | null = null
          try {
            const extracted = await extractTextFromFile(buffer, file.type)
            if (extracted) {
              textContent = cleanTextForEmbedding(extracted)
            }
          } catch (error) {
            console.error('Text extraction failed:', error)
            // Non-critical, continue without text content
          }

          // Success! File uploaded to IPFS
          return {
            filename: file.name,
            sanitizedFilename: safeFilename,
            success: true,
            size: buffer.length,
            type: file.type,
            cid: uploadResult.cid!,
            duration: uploadResult.duration,
            gatewayUrl: getFilebaseGatewayUrl(uploadResult.cid!),
            fallbackUrls: getPublicGatewayUrls(uploadResult.cid!),
            message: 'Successfully uploaded to Filebase IPFS',
            collectionId, // Include collection ID in response
            textContent, // Include extracted text
          }
        } catch (error) {
          return {
            filename: file.name,
            success: false,
            error: error instanceof Error ? error.message : 'Processing failed',
            errorCode: 'VALIDATION_ERROR',
          }
        }
      })
    )

    // Check if any files failed
    const failures = results.filter((r) => !r.success)
    const successes = results.filter((r) => r.success)

    if (failures.length > 0 && successes.length === 0) {
      // All files failed
      return NextResponse.json(
        {
          error: 'All files failed validation',
          results,
        },
        { status: 400 }
      )
    }

    // Scrape URL metadata if URLs provided
    let urlMetadata: any[] = []
    if (urls.length > 0) {
      try {
        urlMetadata = await scrapeUrls(urls)
      } catch (error) {
        console.error('URL scraping error:', error)
      }
    }

    // Story 2: Save metadata to database
    if (successes.length > 0 || urlMetadata.length > 0) {
      try {
        // Check for existing CIDs to avoid unique constraint violations
        const existingFiles = await prisma.file.findMany({
          where: {
            cid: {
              in: successes.map(f => f.cid!).filter(Boolean)
            }
          },
          select: { cid: true }
        })

        const existingCids = new Set(existingFiles.map(f => f.cid))
        
        // Filter out files with duplicate CIDs
        const newFiles = successes.filter(file => 
          file.cid && !existingCids.has(file.cid)
        )

        // Create collection with files and links
        await prisma.collection.create({
          data: {
            id: collectionId,
            files: {
              create: newFiles
                .filter((file) => file.cid && file.size && file.type)
                .map((file) => ({
                  cid: file.cid!,
                  filename: file.sanitizedFilename || file.filename,
                  size: file.size!,
                  mimeType: file.type!,
                  textContent: file.textContent,
                  indexed: !!file.textContent,
                  indexedAt: file.textContent ? new Date() : null,
                })),
            },
            links: {
              create: urlMetadata.map((meta) => ({
                url: meta.url,
                title: meta.title,
                description: meta.description,
                imageUrl: meta.imageUrl,
                siteName: meta.siteName,
                linkType: meta.linkType,
              })),
            },
          },
        })
        
        // Log duplicates if any
        if (existingCids.size > 0) {
          console.log(`Skipped ${existingCids.size} duplicate file(s) (already in database)`)
        }
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Don't fail the upload if DB save fails, just log it
        // Files are already in IPFS
      }
    }

    // Return results (partial or full success)
    return NextResponse.json(
      {
        success: true,
        message: `${successes.length} file(s) and ${urlMetadata.length} URL(s) processed successfully`,
        collectionId,
        results,
        urls: urlMetadata,
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload
 * API health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Upload API ready',
    maxFileSize: '100MB',
    allowedTypes: ['PDF', 'Images', 'Videos', 'Text', 'CSV'],
  })
}
