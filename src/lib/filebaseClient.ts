/**
 * Filebase IPFS Client
 * Uploads files to IPFS via Filebase RPC API
 */

import FormData from 'form-data'
import axios from 'axios'

const RPC_ENDPOINT = process.env.FILEBASE_IPFS_RPC_ENDPOINT || 'https://rpc.filebase.io'
const RPC_KEY = process.env.FILEBASE_IPFS_RPC_KEY

if (!RPC_KEY) {
  console.error('⚠️  FILEBASE_IPFS_RPC_KEY not set')
}

export interface FilebaseUploadResult {
  success: boolean
  cid?: string
  name?: string
  size?: number
  error?: string
  duration?: number
}

/**
 * Upload file to Filebase IPFS via RPC API
 */
export async function uploadToFilebase(
  buffer: Buffer,
  filename: string
): Promise<FilebaseUploadResult> {
  const startTime = Date.now()

  try {
    if (!RPC_KEY) {
      throw new Error('Filebase API key not configured')
    }

    // Create form data
    const form = new FormData()
    form.append('file', buffer, filename)

    // Upload to Filebase IPFS RPC
    const response = await axios.post(
      `${RPC_ENDPOINT}/api/v0/add`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${RPC_KEY}`,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        timeout: 30000, // 30s timeout
      }
    )

    const duration = Date.now() - startTime
    const cid = response.data.Hash
    const size = parseInt(response.data.Size) || buffer.length

    return {
      success: true,
      cid,
      name: response.data.Name || filename,
      size,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        duration,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      duration,
    }
  }
}

/**
 * Upload multiple files to Filebase IPFS
 */
export async function uploadMultipleToFilebase(
  files: Array<{ buffer: Buffer; filename: string }>
): Promise<FilebaseUploadResult[]> {
  return Promise.all(
    files.map(({ buffer, filename }) => uploadToFilebase(buffer, filename))
  )
}

/**
 * Get Filebase gateway URL for CID
 */
export function getFilebaseGatewayUrl(cid: string): string {
  // Using Filebase dedicated gateway (from spike validation)
  return `https://ipfs.filebase.io/ipfs/${cid}`
}

/**
 * Get public IPFS gateway URLs for fallback
 */
export function getPublicGatewayUrls(cid: string): string[] {
  return [
    `https://ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    getFilebaseGatewayUrl(cid), // Filebase as fallback
  ]
}

/**
 * Health check - verify Filebase API is accessible
 */
export async function checkFilebaseHealth(): Promise<boolean> {
  try {
    if (!RPC_KEY) return false

    const response = await axios.post(
      `${RPC_ENDPOINT}/api/v0/version`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${RPC_KEY}`,
        },
        timeout: 5000,
      }
    )

    return response.status === 200
  } catch {
    return false
  }
}
