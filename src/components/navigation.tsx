'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { getLevelFromXP } from '@/lib/xp'

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
            <div className="flex items-center gap-6">
              <Link 
                href="/leaderboard" 
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                🏆 Leaderboard
              </Link>
              {session.user.isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Level & XP Badge */}
            <Link
              href={`/u/${session.user.id}`}
              className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200 hover:border-blue-300 transition-colors"
              title={`${getLevelFromXP(session.user.xp).name} - ${session.user.xp} XP`}
            >
              <span className="text-xl">{getLevelFromXP(session.user.xp).icon}</span>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 leading-none">{getLevelFromXP(session.user.xp).name}</span>
                <span className="text-blue-600 font-semibold text-sm leading-none">
                  {session.user.xp} XP
                </span>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Link
                href={`/u/${session.user.id}`}
                className="text-right hidden sm:block hover:opacity-80 transition-opacity"
              >
                <p className="text-sm font-medium text-gray-900">
                  {session.user.email}
                </p>
                {session.user.isAdmin && (
                  <span className="text-xs text-blue-600 font-medium">Admin</span>
                )}
              </Link>

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
