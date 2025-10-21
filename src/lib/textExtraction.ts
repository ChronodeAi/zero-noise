/**
 * Extract text content from file buffer based on MIME type
 * Only extracts first 2000 chars for search preview
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  try {
    // Skip extraction for binary files (images, videos, etc.)
    // Only index text-based files
    
    // Plain text files (CSV, TXT, MD, JSON)
    if (
      mimeType === 'text/plain' ||
      mimeType === 'text/csv' ||
      mimeType === 'text/markdown' ||
      mimeType === 'application/json'
    ) {
      // For text files, just grab first 2000 chars
      return buffer.toString('utf-8').substring(0, 2000)
    }
    
    // PDF files - extract first page worth of text
    if (mimeType === 'application/pdf') {
      // Dynamic import for CommonJS module
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer, { max: 1 }) // Just first page
      return data.text.substring(0, 2000)
    }
    
    // HTML files
    if (mimeType === 'text/html') {
      const html = buffer.toString('utf-8')
      // Basic HTML tag stripping, first 2000 chars
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000)
    }
    
    // For other file types (images, videos, etc.), don't extract
    // Search will work on filename only
    return null
  } catch (error) {
    console.error('Text extraction error:', error)
    return null
  }
}

/**
 * Check if file type supports text extraction
 */
export function isTextExtractable(mimeType: string): boolean {
  const extractable = [
    'application/pdf',
    'text/plain',
    'text/csv',
    'text/markdown',
    'text/html',
    'application/json',
  ]
  
  return extractable.includes(mimeType)
}

/**
 * Clean and normalize extracted text for search indexing
 * Keep it minimal - just enough for search, not full content
 */
export function cleanTextForEmbedding(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim()
    .substring(0, 2000) // Limit to first 2000 chars (~500 words) - just a preview
}
