'use client'

import { useState } from 'react'
import UploadZone from '@/components/UploadZone'

interface UploadedFile {
  name: string
  size: number
  cid?: string
  gatewayUrl?: string
}

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleFilesSelected = async (files: File[]) => {
    // Story 3: Call /api/upload with server-side validation
    const formData = new FormData()
    files.forEach((file) => formData.append('file', file))

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    // Store successful uploads with CIDs and gateway URLs
    const successfulUploads = data.results
      .filter((r: any) => r.success)
      .map((r: any) => ({
        name: r.filename,
        size: r.size,
        cid: r.cid,
        gatewayUrl: r.gatewayUrl,
      }))

    setUploadedFiles((prev) => [...prev, ...successfulUploads])
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
