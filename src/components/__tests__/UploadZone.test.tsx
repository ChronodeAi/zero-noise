import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadZone from '../UploadZone'

// Mock file validation module
vi.mock('@/lib/fileValidation', () => ({
  validateFiles: vi.fn(async (files: File[]) => {
    return files.map((file) => ({
      file,
      result: { valid: true },
    }))
  }),
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'video/mp4',
  ],
  MAX_FILE_SIZE: 100 * 1024 * 1024,
}))

describe('UploadZone', () => {
  const mockOnFilesAdded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload zone with default text', () => {
    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument()
    expect(screen.getByText(/or click to select files/i)).toBeInTheDocument()
  })

  it('displays supported file types and max size', () => {
    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    expect(screen.getByText(/supported: pdf, images, videos, text, csv/i)).toBeInTheDocument()
    expect(screen.getByText(/max 100mb per file/i)).toBeInTheDocument()
  })

  it('shows custom max file size when provided', () => {
    const customMaxSize = 50 * 1024 * 1024 // 50MB
    render(<UploadZone onFilesAdded={mockOnFilesAdded} maxFileSize={customMaxSize} />)

    expect(screen.getByText(/max 50mb per file/i)).toBeInTheDocument()
  })

  it('shows validating state during file processing', async () => {
    const { validateFiles } = await import('@/lib/fileValidation')

    // Make validation async and slow
    vi.mocked(validateFiles).mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([{ file: new File([''], 'test.pdf'), result: { valid: true } }])
        }, 100)
      })
    )

    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    if (input) {
      await userEvent.upload(input, file)

      // Should show validating state
      await waitFor(() => {
        expect(screen.getByText(/validating/i)).toBeInTheDocument()
      })
    }
  })

  it('calls onFilesAdded with valid files', async () => {
    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalledWith([file])
      })
    }
  })

  it('shows error for validation failures', async () => {
    const { validateFiles } = await import('@/lib/fileValidation')

    // Mock validation failure for an accepted file type
    vi.mocked(validateFiles).mockResolvedValue([
      {
        file: new File([''], 'corrupted.pdf'),
        result: { valid: false, error: 'File corrupted or magic bytes mismatch' },
      },
    ])

    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')
    const file = new File(['invalid content'], 'corrupted.pdf', { type: 'application/pdf' })

    if (input) {
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/corrupted\.pdf.*file corrupted/i)).toBeInTheDocument()
      }, { timeout: 2000 })

      // Should not call onFilesAdded for invalid files
      expect(mockOnFilesAdded).not.toHaveBeenCalled()
    }
  })

  it('handles multiple valid files', async () => {
    const { validateFiles } = await import('@/lib/fileValidation')

    // Mock validation success for multiple files
    vi.mocked(validateFiles).mockImplementation(async (files: File[]) => {
      return files.map((file) => ({
        file,
        result: { valid: true },
      }))
    })

    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')
    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.png', { type: 'image/png' }),
    ]

    if (input) {
      await userEvent.upload(input, files)

      await waitFor(() => {
        expect(mockOnFilesAdded).toHaveBeenCalled()
        // Check that it was called with an array of 2 files
        const callArgs = mockOnFilesAdded.mock.calls[0][0]
        expect(callArgs).toHaveLength(2)
      }, { timeout: 2000 })
    }
  })

  it('disables input during validation', async () => {
    const { validateFiles } = await import('@/lib/fileValidation')

    // Make validation slow
    vi.mocked(validateFiles).mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([{ file: new File([''], 'test.pdf'), result: { valid: true } }])
        }, 100)
      })
    )

    render(<UploadZone onFilesAdded={mockOnFilesAdded} />)

    const input = screen.getByRole('presentation').querySelector('input[type="file"]')
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    if (input) {
      await userEvent.upload(input, file)

      // Input should be disabled during validation
      await waitFor(() => {
        expect(input).toBeDisabled()
      })
    }
  })
})
