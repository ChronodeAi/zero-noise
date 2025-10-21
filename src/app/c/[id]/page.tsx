'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getFilebaseGatewayUrl, getPublicGatewayUrls } from '@/lib/filebaseClient'

interface FileMetadata {
  id: string
  cid: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string
}

interface Collection {
  id: string
  createdAt: string
  fileCount: number
  files: FileMetadata[]
}

export default function CollectionPage() {
  const params = useParams()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/collection/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch collection')
        }

        setCollection(data.collection)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-2">Collection Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This collection does not exist or has been deleted.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </a>
          <h1 className="text-4xl font-bold mb-2">📦 File Collection</h1>
          <p className="text-gray-600">
            {collection.fileCount} file{collection.fileCount !== 1 ? 's' : ''} • Created {new Date(collection.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Files Grid */}
        <div className="space-y-3">
          {collection.files.map((file) => {
            const gatewayUrl = getFilebaseGatewayUrl(file.cid)
            const fallbackUrls = getPublicGatewayUrls(file.cid)

            return (
              <div
                key={file.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 truncate">{file.filename}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Type: {file.mimeType}</p>
                      <p className="font-mono text-xs text-gray-400">
                        CID: {file.cid.substring(0, 30)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a
                      href={gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm whitespace-nowrap"
                    >
                      📥 Download
                    </a>
                    <a
                      href={gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm whitespace-nowrap"
                    >
                      👁️ View
                    </a>
                  </div>
                </div>

                {/* Fallback Gateways */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Alternative IPFS Gateways
                    </summary>
                    <div className="mt-2 space-y-1">
                      {fallbackUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-600 hover:text-blue-800 underline truncate"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            )
          })}
        </div>

        {/* Collection Info */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">About IPFS Collections</h2>
          <p className="text-sm text-gray-600">
            These files are stored on IPFS (InterPlanetary File System), a decentralized storage network. 
            They are permanently accessible via their Content ID (CID) and can be retrieved from multiple gateways worldwide.
          </p>
        </div>
      </div>
    </main>
  )
}
