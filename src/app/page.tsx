'use client'

import { useState } from 'react'
import UploadZone from '@/components/UploadZone'

interface UploadedFile {
  name: string
  size: number
  cid?: string
  gatewayUrl?: string
}

interface UploadedLink {
  url: string
  title?: string
  siteName?: string
  linkType: string
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadedLinks, setUploadedLinks] = useState<UploadedLink[]>([])
  const [urls, setUrls] = useState('')
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFilesSelected = async (files: File[]) => {
    // Story 3: Call /api/upload with server-side validation + URLs
    const formData = new FormData()
    files.forEach((file) => formData.append('file', file))
    
    // Add URLs if present
    if (urls.trim()) {
      formData.append('urls', urls)
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    // Store successful file uploads
    const successfulUploads = data.results
      .filter((r: any) => r.success)
      .map((r: any) => ({
        name: r.filename,
        size: r.size,
        cid: r.cid,
        gatewayUrl: r.gatewayUrl,
      }))

    setUploadedFiles((prev) => [...prev, ...successfulUploads])
    
    // Store scraped URLs
    if (data.urls && data.urls.length > 0) {
      setUploadedLinks(data.urls)
    }
    
    // Store collection ID if present
    if (data.collectionId) {
      setCollectionId(data.collectionId)
    }
    
    // Clear URL input
    setUrls('')
  }

  const copyCollectionUrl = async () => {
    if (!collectionId) return
    const url = `${window.location.origin}/c/${collectionId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">Zero Noise</h1>
          <p className="text-xl text-gray-600 mb-2">
            Decentralized P2P file sharing on IPFS
          </p>
          <p className="text-sm text-gray-500">
            Sprint 1: Upload Component ✅
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-8">
          <UploadZone onFilesSelected={handleFilesSelected} />
        </div>

        {/* URL Input */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">🔗 Or Add URLs</h2>
          <p className="text-sm text-gray-600 mb-4">
            Paste YouTube, article, or social media URLs (one per line)
          </p>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://youtube.com/watch?v=...
https://medium.com/article/...
https://twitter.com/user/status/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-2">
            URLs will be saved alongside your files in the collection
          </p>
        </div>

        {/* Collection URL */}
        {collectionId && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-3">📦 Shareable Collection URL</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/c/${collectionId}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={copyCollectionUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy URL
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Share this URL with anyone to let them view and download your uploaded files
            </p>
          </div>
        )}

        {/* Uploaded Links List */}
        {uploadedLinks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Saved URLs</h2>
            <div className="space-y-2">
              {uploadedLinks.map((link, index) => (
                <div
                  key={index}
                  className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {link.linkType === 'video' && (
                        <span className="text-2xl">🎥</span>
                      )}
                      {link.linkType === 'article' && (
                        <span className="text-2xl">📄</span>
                      )}
                      {link.linkType === 'social' && (
                        <span className="text-2xl">💬</span>
                      )}
                      {link.linkType === 'generic' && (
                        <span className="text-2xl">🔗</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">
                        {link.title || 'Untitled'}
                      </h3>
                      {link.siteName && (
                        <p className="text-sm text-gray-500 mb-2">{link.siteName}</p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Uploaded Files</h2>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.cid && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 font-mono">
                          CID: {file.cid.substring(0, 20)}...
                        </p>
                        {file.gatewayUrl && (
                          <a
                            href={file.gatewayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View on IPFS Gateway →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-green-600 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
