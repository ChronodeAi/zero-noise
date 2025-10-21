const pdfParse = require('pdf-parse')

/**
 * Extract text content from file buffer based on MIME type
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  try {
    // PDF files
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer)
      return data.text
    }
    
    // Plain text files
    if (
      mimeType === 'text/plain' ||
      mimeType === 'text/csv' ||
      mimeType === 'text/markdown' ||
      mimeType === 'application/json'
    ) {
      return buffer.toString('utf-8')
    }
    
    // HTML files
    if (mimeType === 'text/html') {
      const html = buffer.toString('utf-8')
      // Basic HTML tag stripping
      return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    }
    
    // For other file types, return null (not extractable yet)
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
 * Clean and normalize extracted text for embedding
 */
export function cleanTextForEmbedding(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim()
    .substring(0, 100000) // Limit to 100k chars (~25k tokens)
}
