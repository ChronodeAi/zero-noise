'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('nodemailer', { 
        email, 
        redirect: false,
        callbackUrl: '/' 
      })
      
      if (result?.error) {
        console.error('Sign-in error:', result.error)
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-gray-600 mb-4">
              A sign-in link has been sent to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Click the link in the email to sign in. The link expires in 24 hours.
            </p>
          </div>
          
          <button
            onClick={() => {
              setEmailSent(false)
              setEmail('')
            }}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Zero Noise</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>
        
        {error === 'AccessDenied' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Your email is not whitelisted. Please contact an admin for access.
            </p>
          </div>
        )}
        
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Sending magic link...' : 'Send magic link'}
          </button>
          
          <div className="text-center text-sm text-gray-500">
            <p>Access is invite-only</p>
            <p>Contact an admin for whitelist approval</p>
          </div>
        </form>
      </div>
    </div>
  )
}
