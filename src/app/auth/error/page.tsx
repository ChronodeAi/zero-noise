'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessages: Record<string, { title: string; description: string }> = {
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
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">{errorInfo.title}</h1>
          <p className="text-gray-600">{errorInfo.description}</p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
        
        {error === 'AccessDenied' && (
          <div className="text-sm text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Need access?</p>
            <p>Ask an existing user for an invite code or request whitelist approval from an admin.</p>
          </div>
        )}
      </div>
    </div>
  )
}
