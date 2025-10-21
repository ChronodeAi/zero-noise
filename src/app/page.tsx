'use client'

import { useState } from 'react'
import UploadZone from '@/components/UploadZone'

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number }>>([])

  const handleFilesSelected = async (files: File[]) => {
    // TODO: Implement actual upload logic in Story 4
    // For now, just simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Store file metadata
    const fileData = files.map((file) => ({
      name: file.name,
      size: file.size,
    }))
    
    setUploadedFiles((prev) => [...prev, ...fileData])
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
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="text-green-600">
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
