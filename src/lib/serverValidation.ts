/**
 * Server-Side File Validation
 * Validates uploaded files on the server before IPFS upload
 */

import { Buffer } from 'buffer'

// Allowed MIME types (must match client-side)
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'video/mp4',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
] as const

// Max file size (100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024

// Magic bytes signatures for server-side validation
const MAGIC_BYTES: Record<string, Buffer[]> = {
  'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])], // PNG
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), // JPEG JFIF
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]), // JPEG Exif
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE2]), // JPEG
  ],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
  ],
  'video/mp4': [
    Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]), // ftyp
    Buffer.from([0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70]), // ftyp alt
  ],
}

export interface ServerValidationResult {
  valid: boolean
  error?: string
  errorCode?: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'EMPTY_FILE' | 'MAGIC_BYTES_MISMATCH' | 'VALIDATION_ERROR'
}

/**
 * Validate file MIME type
 */
export function validateMimeType(mimeType: string): ServerValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed`,
      errorCode: 'INVALID_TYPE',
    }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, filename: string): ServerValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${filename}" exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      errorCode: 'FILE_TOO_LARGE',
    }
  }
  if (size === 0) {
    return {
      valid: false,
      error: `File "${filename}" is empty`,
      errorCode: 'EMPTY_FILE',
    }
  }
  return { valid: true }
}

/**
 * Validate magic bytes from Buffer
 */
export function validateMagicBytes(
  buffer: Buffer,
  mimeType: string,
  filename: string
): ServerValidationResult {
  // Skip validation for text files (no reliable magic bytes)
  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/csv' ||
    mimeType === 'application/vnd.ms-excel'
  ) {
    return { valid: true }
  }

  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) {
    // No magic bytes defined, skip validation
    return { valid: true }
  }

  // Check if buffer matches any signature
  const matches = signatures.some((signature) => {
    if (buffer.length < signature.length) return false
    return buffer.subarray(0, signature.length).equals(signature)
  })

  if (!matches) {
    return {
      valid: false,
      error: `File "${filename}" content doesn't match declared type "${mimeType}"`,
      errorCode: 'MAGIC_BYTES_MISMATCH',
    }
  }

  return { valid: true }
}

/**
 * Comprehensive server-side file validation
 */
export function validateUploadedFile(
  buffer: Buffer,
  mimeType: string,
  filename: string
): ServerValidationResult {
  // 1. Validate MIME type
  const mimeResult = validateMimeType(mimeType)
  if (!mimeResult.valid) return mimeResult

  // 2. Validate file size
  const sizeResult = validateFileSize(buffer.length, filename)
  if (!sizeResult.valid) return sizeResult

  // 3. Validate magic bytes
  const magicResult = validateMagicBytes(buffer, mimeType, filename)
  if (!magicResult.valid) return magicResult

  return { valid: true }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255) // Limit length
}
