'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => Promise<void>
  maxFileSize?: number // in bytes
  allowedTypes?: string[] // MIME types
}

export default function UploadZone({
  onFilesSelected,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'video/mp4',
    'text/plain',
  ],
}: UploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => {
          const errorCode = file.errors[0]?.code
          if (errorCode === 'file-too-large') {
            return `${file.file.name}: File too large (max ${maxFileSize / 1024 / 1024}MB)`
          }
          if (errorCode === 'file-invalid-type') {
            return `${file.file.name}: Invalid file type`
          }
          return `${file.file.name}: Upload failed`
        })
        setError(errors.join(', '))
        return
      }

      if (acceptedFiles.length === 0) {
        setError('No files selected')
        return
      }

      setUploading(true)
      try {
        await onFilesSelected(acceptedFiles)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [onFilesSelected, maxFileSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: true,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <div className="space-y-4">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          {/* Text */}
          {uploading ? (
            <div>
              <p className="text-lg font-medium text-gray-700">Uploading...</p>
              <div className="mt-2 w-full max-w-xs mx-auto h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-blue-600">Drop files here</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop files here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select files
              </p>
            </div>
          )}

          {/* File info */}
          {!uploading && (
            <p className="text-xs text-gray-400">
              Supported: PDF, Images, Videos, Text • Max {maxFileSize / 1024 / 1024}MB per file
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
