/**
 * File Validation Utilities
 * Provides client-side validation for file uploads
 */

// Allowed MIME types
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

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number]

// Max file size (100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024

// Magic bytes signatures for file type detection
const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG header
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG Exif
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], // ftyp (alternative)
  ],
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate file MIME type
 */
export function validateMimeType(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Supported types: PDF, Images, Videos, Text, CSV`,
    }
  }
  return { valid: true }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }
  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is empty`,
    }
  }
  return { valid: true }
}

/**
 * Read first N bytes of a file
 */
async function readFileHeader(file: File, bytes: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const blob = file.slice(0, bytes)

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)
      resolve(Array.from(uint8Array))
    }

    reader.onerror = () => reject(new Error('Failed to read file header'))
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * Check if file header matches expected magic bytes
 */
function matchesMagicBytes(header: number[], signature: number[]): boolean {
  if (header.length < signature.length) return false
  
  return signature.every((byte, index) => header[index] === byte)
}

/**
 * Validate file using magic bytes (file signature)
 */
export async function validateMagicBytes(file: File): Promise<ValidationResult> {
  // Skip validation for text files and CSV (no reliable magic bytes)
  if (
    file.type === 'text/plain' ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel'
  ) {
    return { valid: true }
  }

  const signatures = MAGIC_BYTES[file.type]
  if (!signatures) {
    // No magic bytes defined for this type, skip validation
    return { valid: true }
  }

  try {
    // Read first 16 bytes (enough for most file signatures)
    const header = await readFileHeader(file, 16)

    // Check if header matches any of the signatures
    const matches = signatures.some(signature => matchesMagicBytes(header, signature))

    if (!matches) {
      return {
        valid: false,
        error: `File "${file.name}" appears to be corrupted or has incorrect extension. The file content doesn't match the declared type.`,
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Comprehensive file validation
 * Runs all validation checks in sequence
 */
export async function validateFile(file: File): Promise<ValidationResult> {
  // 1. Check MIME type
  const mimeResult = validateMimeType(file)
  if (!mimeResult.valid) return mimeResult

  // 2. Check file size
  const sizeResult = validateFileSize(file)
  if (!sizeResult.valid) return sizeResult

  // 3. Check magic bytes (async)
  const magicResult = await validateMagicBytes(file)
  if (!magicResult.valid) return magicResult

  return { valid: true }
}

/**
 * Validate multiple files
 * Returns array of results with file names
 */
export async function validateFiles(
  files: File[]
): Promise<Array<{ file: File; result: ValidationResult }>> {
  const results = await Promise.all(
    files.map(async (file) => ({
      file,
      result: await validateFile(file),
    }))
  )
  return results
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Check if file extension matches MIME type
 */
export function validateExtension(file: File): ValidationResult {
  const extension = getFileExtension(file.name)
  const expectedExtensions: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'video/mp4': ['mp4'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
    'application/vnd.ms-excel': ['csv', 'xls'],
  }

  const allowed = expectedExtensions[file.type]
  if (allowed && !allowed.includes(extension)) {
    return {
      valid: false,
      error: `File extension ".${extension}" doesn't match MIME type "${file.type}". Expected: ${allowed.join(', ')}`,
    }
  }

  return { valid: true }
}
