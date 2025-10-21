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

interface SearchResult {
  id: string
  cid: string
  filename: string
  size: number
  mimeType: string
  collectionId: string
  rank: number
  snippet: string
  resultType: 'file' | 'link'
}

export default function Home() {
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadedLinks, setUploadedLinks] = useState<UploadedLink[]>([])
  const [urls, setUrls] = useState('')
  const [collectionId, setCollectionId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSaveUrls = async () => {
    if (!urls.trim()) return

    const formData = new FormData()
    formData.append('urls', urls)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Save failed')
      }

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
    } catch (error) {
      console.error('Save URLs failed:', error)
      alert('Failed to save URLs: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleFilesAdded = (files: File[]) => {
    // Add files to staging area
    setStagedFiles((prev) => [...prev, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveFiles = async () => {
    if (stagedFiles.length === 0 && !urls.trim()) return

    setUploading(true)
    try {
      // Story 3: Call /api/upload with server-side validation + URLs
      const formData = new FormData()
      stagedFiles.forEach((file) => formData.append('file', file))
      
      // Add URLs if present
      if (urls.trim()) {
        formData.append('urls', urls)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      // Check content type before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

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
      
      // Clear staged files and URLs
      setStagedFiles([])
      setUrls('')
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      })

      const data = await response.json()
      if (response.ok) {
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
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
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your files... (e.g., 'contract', 'presentation', 'invoice')"
                className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-300 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {searching ? '...' : '🔍 Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">🔍 Search Results ({searchResults.length})</h2>
            <div className="space-y-3">
              {searchResults.map((result) => (
                <a
                  key={result.id}
                  href={`/c/${result.collectionId}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{result.filename}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                          {result.resultType === 'link' ? '🔗 URL' : '📄 File'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {result.mimeType}{result.size > 0 && ` • ${(result.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                      {result.snippet && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {result.snippet}...
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-gray-500">Relevance</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {(result.rank * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {searchQuery && !searching && searchResults.length === 0 && (
          <div className="mb-8 text-center text-gray-500 py-8">
            <p className="text-lg">No results found for "{searchQuery}"</p>
            <p className="text-sm mt-2">Try different keywords or upload some files first</p>
          </div>
        )}

        {/* Upload Zone */}
        <div className="mb-8">
          <UploadZone onFilesAdded={handleFilesAdded} />
        </div>

        {/* Staged Files */}
        {stagedFiles.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">📋 Staged Files ({stagedFiles.length})</h2>
            <div className="space-y-2 mb-4">
              {stagedFiles.map((file, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveFiles}
              disabled={uploading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
            >
              {uploading ? '⏳ Uploading to IPFS...' : '💾 Save Files to IPFS'}
            </button>
          </div>
        )}

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
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">
              {stagedFiles.length > 0 
                ? 'URLs will be saved with staged files in same collection'
                : 'URLs will be saved in a new collection'}
            </p>
            <button
              onClick={stagedFiles.length > 0 ? handleSaveFiles : handleSaveUrls}
              disabled={!urls.trim() || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? '⏳ Saving...' : '💾 Save URLs'}
            </button>
          </div>
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
