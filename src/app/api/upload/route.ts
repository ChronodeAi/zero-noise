import { NextRequest, NextResponse } from 'next/server'
import { validateUploadedFile, sanitizeFilename } from '@/lib/serverValidation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/upload
 * Upload files with server-side validation
 * 
 * Story 3: Validation only (no IPFS upload yet)
 * Story 4: Will add Filebase IPFS integration
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

          // TODO Story 4: Upload to Filebase IPFS here
          // For now, just return success with mock CID
          const mockCID = `Qm${Buffer.from(file.name).toString('base64').substring(0, 44)}`

          return {
            filename: file.name,
            sanitizedFilename: safeFilename,
            success: true,
            size: buffer.length,
            type: file.type,
            cid: mockCID, // Mock CID for Story 3
            message: 'Validation passed (Story 3 - not uploaded to IPFS yet)',
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
