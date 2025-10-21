'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

function VerifyClaimContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, update } = useSession()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function claimInvite() {
      const inviteCode = searchParams.get('inviteCode')
      
      if (!inviteCode) {
        setStatus('error')
        setErrorMessage('No invite code provided')
        return
      }

      if (!session?.user?.email) {
        // Wait for session
        return
      }

      try {
        const response = await fetch('/api/invites/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: inviteCode.toUpperCase().trim() })
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          // Refresh session to get updated whitelist status
          await update()
          // Redirect to homepage after 2 seconds
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 2000)
        } else {
          setStatus('error')
          setErrorMessage(data.error || 'Failed to claim invite code')
        }
      } catch (error) {
        console.error('Claim error:', error)
        setStatus('error')
        setErrorMessage('An error occurred while claiming your invite code')
      }
    }

    claimInvite()
  }, [searchParams, session, router, update])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Claiming your invite code...</h1>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Zero Noise!</h1>
          <p className="text-gray-600">Your invite code has been claimed successfully</p>
          <p className="text-sm text-gray-500">Redirecting you to the app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Claim Failed</h1>
        <p className="text-gray-600">{errorMessage}</p>
        <button
          onClick={() => router.push('/auth/claim')}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export default function VerifyClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <VerifyClaimContent />
    </Suspense>
  )
}
