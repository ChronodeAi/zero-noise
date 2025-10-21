import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('OPENAI_API_KEY not set - semantic search will not work')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

/**
 * Generate embedding for text using OpenAI API
 * Model: text-embedding-3-small (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }
  
  // Truncate to ~8000 tokens (OpenAI limit)
  const truncated = text.substring(0, 32000)
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: truncated,
  })
  
  return response.data[0].embedding
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(
    texts.map((text) => generateEmbedding(text))
  )
  return results
}
