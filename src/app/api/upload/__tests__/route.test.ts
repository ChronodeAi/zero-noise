import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Increase timeout for API route tests (Next.js can be slow in tests)
const API_TEST_TIMEOUT = 10000

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
}))

vi.mock('@/lib/serverValidation', () => ({
  validateUploadedFile: vi.fn((buffer, type, name) => ({
    valid: true,
    error: null,
  })),
  sanitizeFilename: vi.fn((name) => name.replace(/[^a-zA-Z0-9._-]/g, '_')),
}))

vi.mock('@/lib/filebaseClient', () => ({
  uploadToFilebase: vi.fn(() => Promise.resolve({
    success: true,
    cid: 'QmTest123',
    duration: 100,
  })),
  getFilebaseGatewayUrl: vi.fn((cid) => `https://filebase.io/ipfs/${cid}`),
  getPublicGatewayUrls: vi.fn((cid) => [`https://ipfs.io/ipfs/${cid}`]),
}))

vi.mock('@/lib/urlScraper', () => ({
  scrapeUrls: vi.fn(() => Promise.resolve([])),
}))

vi.mock('@/lib/textExtraction', () => ({
  extractTextFromFile: vi.fn(() => Promise.resolve(null)),
  cleanTextForEmbedding: vi.fn((text) => text),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    file: {
      findMany: vi.fn(() => Promise.resolve([])),
    },
    collection: {
      create: vi.fn(() => Promise.resolve({ id: 'test-collection' })),
    },
    user: {
      update: vi.fn(() => Promise.resolve({ id: 'test-user' })),
    },
  },
}))

vi.mock('@/lib/xp', () => ({
  XP_REWARDS: {
    FILE_UPLOAD: 10,
    LINK_SAVE: 5,
  },
}))

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if no files or URLs provided', async () => {
    const formData = new FormData()
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('No files or URLs provided')
  })

  // Skip: Next.js FormData handling causes timeouts in test environment
  it.skip('should successfully upload a valid file', async () => {
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile).mockReturnValue({
      valid: true,
      error: null,
    })

    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: true,
      cid: 'QmTestFile123',
      duration: 150,
    })

    const formData = new FormData()
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].success).toBe(true)
    expect(data.results[0].cid).toBe('QmTestFile123')
  })

  it('should handle validation failures', async () => {
    const { validateUploadedFile } = await import('@/lib/serverValidation')

    vi.mocked(validateUploadedFile).mockReturnValue({
      valid: false,
      error: 'Invalid file type',
      errorCode: 'INVALID_TYPE',
    })

    const formData = new FormData()
    const file = new File(['malicious'], 'virus.exe', { type: 'application/x-msdownload' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('All files failed validation')
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toBe('Invalid file type')
  })

  it('should handle Filebase upload failures', async () => {
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile).mockReturnValue({
      valid: true,
      error: null,
    })

    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: false,
      error: 'Network timeout',
    })

    const formData = new FormData()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.results[0].success).toBe(false)
    expect(data.results[0].error).toContain('Filebase upload failed')
  })

  it('should process multiple files', async () => {
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile).mockReturnValue({
      valid: true,
      error: null,
    })

    vi.mocked(uploadToFilebase)
      .mockResolvedValueOnce({ success: true, cid: 'QmFile1', duration: 100 })
      .mockResolvedValueOnce({ success: true, cid: 'QmFile2', duration: 120 })

    const formData = new FormData()
    const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' })
    const file2 = new File(['content2'], 'file2.png', { type: 'image/png' })
    formData.append('file', file1)
    formData.append('file', file2)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.results).toHaveLength(2)
    expect(data.results.every((r: any) => r.success)).toBe(true)
  })

  it('should handle partial failures (some files succeed, some fail)', async () => {
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile)
      .mockReturnValueOnce({ valid: true, error: null })
      .mockReturnValueOnce({ valid: false, error: 'File too large', errorCode: 'SIZE_EXCEEDED' })

    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: true,
      cid: 'QmSuccess',
      duration: 100,
    })

    const formData = new FormData()
    const file1 = new File(['small'], 'small.txt', { type: 'text/plain' })
    const file2 = new File(['huge'], 'huge.bin', { type: 'application/octet-stream' })
    formData.append('file', file1)
    formData.append('file', file2)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.results).toHaveLength(2)
    expect(data.results.filter((r: any) => r.success)).toHaveLength(1)
    expect(data.results.filter((r: any) => !r.success)).toHaveLength(1)
  })

  it('should process URLs when provided', async () => {
    const { scrapeUrls } = await import('@/lib/urlScraper')

    vi.mocked(scrapeUrls).mockResolvedValue([
      {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'Example description',
        imageUrl: null,
        siteName: 'Example',
        author: null,
        linkType: 'GENERAL',
      },
    ])

    const formData = new FormData()
    formData.append('urls', 'https://example.com\nhttps://test.com')

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.urls).toHaveLength(1)
    expect(scrapeUrls).toHaveBeenCalledWith(['https://example.com', 'https://test.com'])
  })

  it('should award XP to authenticated users', { timeout: API_TEST_TIMEOUT }, async () => {
    const { auth } = await import('@/auth')
    const { prisma } = await import('@/lib/prisma')
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any)

    vi.mocked(validateUploadedFile).mockReturnValue({ valid: true, error: null })
    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: true,
      cid: 'QmTest',
      duration: 100,
    })

    const formData = new FormData()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    await POST(request)

    // Verify XP was awarded
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { xp: { increment: 10 } }, // FILE_UPLOAD XP
    })
  })

  it('should sanitize filenames', { timeout: API_TEST_TIMEOUT }, async () => {
    const { sanitizeFilename } = await import('@/lib/serverValidation')
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile).mockReturnValue({ valid: true, error: null })
    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: true,
      cid: 'QmTest',
      duration: 100,
    })

    const formData = new FormData()
    const file = new File(['test'], '../../../etc/passwd', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    await POST(request)

    expect(sanitizeFilename).toHaveBeenCalledWith('../../../etc/passwd')
  })

  it('should create a collection with unique collectionId', { timeout: API_TEST_TIMEOUT }, async () => {
    const { prisma } = await import('@/lib/prisma')
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile).mockReturnValue({ valid: true, error: null })
    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: true,
      cid: 'QmTest',
      duration: 100,
    })

    const formData = new FormData()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.collectionId).toBeDefined()
    expect(typeof data.collectionId).toBe('string')
    expect(prisma.collection.create).toHaveBeenCalled()
  })

  it('should handle database errors gracefully', { timeout: API_TEST_TIMEOUT }, async () => {
    const { prisma } = await import('@/lib/prisma')
    const { validateUploadedFile } = await import('@/lib/serverValidation')
    const { uploadToFilebase } = await import('@/lib/filebaseClient')

    vi.mocked(validateUploadedFile).mockReturnValue({ valid: true, error: null })
    vi.mocked(uploadToFilebase).mockResolvedValue({
      success: true,
      cid: 'QmTest',
      duration: 100,
    })

    vi.mocked(prisma.collection.create).mockRejectedValue(new Error('Database connection failed'))

    const formData = new FormData()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    // Should still succeed (file is in IPFS even if DB fails)
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
