import { NextRequest, NextResponse } from 'next/server'
import { validateUploadedFile, sanitizeFilename } from '@/lib/serverValidation'
import { uploadToFilebase, getFilebaseGatewayUrl, getPublicGatewayUrls } from '@/lib/filebaseClient'

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

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

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

    // Return results (partial or full success)
    return NextResponse.json({
      success: true,
      message: `${successes.length} file(s) validated successfully`,
      results,
    })
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
