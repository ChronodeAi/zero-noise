'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function Navigation() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Zero Noise
              </Link>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  if (!session) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Zero Noise
            </Link>
            <p className="text-sm text-gray-500 hidden sm:block">
              Decentralized P2P file sharing on IPFS
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
              <span className="text-blue-600 font-semibold text-sm">
                {session.user.xp} XP
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session.user.email}
                </p>
                {session.user.isAdmin && (
                  <span className="text-xs text-blue-600 font-medium">Admin</span>
                )}
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
