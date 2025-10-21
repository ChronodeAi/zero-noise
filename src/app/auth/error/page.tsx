'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSession } from 'next-auth/react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, update } = useSession()
  const error = searchParams.get('error')
  const [inviteCode, setInviteCode] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  
  const handleClaimInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    
    setClaiming(true)
    setClaimError('')
    
    try {
      const response = await fetch('/api/invites/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase().trim() })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Refresh session to get updated whitelist status
        await update()
        // Redirect to homepage
        router.push('/')
        router.refresh()
      } else {
        setClaimError(data.error || 'Failed to claim invite code')
      }
    } catch (error) {
      console.error('Claim error:', error)
      setClaimError('An error occurred. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  const errorMessages: Record<string, { title: string; description: string }> = {
    'NotWhitelisted': {
      title: 'Whitelist Required',
      description: 'You need an invite code or admin approval to access Zero Noise.'
    },
    'AccessDenied': {
      title: 'Access Denied',
      description: 'Your account is not whitelisted. Please contact an admin for access.'
    },
    'Configuration': {
      title: 'Configuration Error',
      description: 'There was a problem with the server configuration.'
    },
    'Verification': {
      title: 'Verification Failed',
      description: 'The verification token has expired or has already been used.'
    },
    'Default': {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.'
    }
  }
  
  const errorInfo = errorMessages[error || 'Default'] || errorMessages['Default']
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">{errorInfo.title}</h1>
          <p className="text-gray-600">{errorInfo.description}</p>
        </div>
        
        {(error === 'NotWhitelisted' || error === 'AccessDenied') && session?.user?.email && (
          <form onSubmit={handleClaimInvite} className="space-y-3">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                Have an invite code?
              </label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase())
                  setClaimError('')
                }}
                placeholder="WELCOME-2025-XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              {claimError && (
                <p className="mt-1 text-sm text-red-600">{claimError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={claiming || !inviteCode.trim()}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {claiming ? 'Claiming...' : 'Claim Invite Code'}
            </button>
          </form>
        )}
        
        <div className="space-y-3">
          <Link
            href="/auth/claim"
            className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get an Invite Code
          </Link>
          <Link
            href="/auth/signin"
            className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
        
        {(error === 'NotWhitelisted' || error === 'AccessDenied') && (
          <div className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Need access?</p>
            <p>Get an invite code from an existing user or request admin approval.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
