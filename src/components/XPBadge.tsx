'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getLevelInfo } from '@/lib/xp'

export default function XPBadge() {
  const { data: session } = useSession()
  
  if (!session?.user) return null

  const xp = (session.user as any).xp || 0
  const levelInfo = getLevelInfo(xp)

  return (
    <Link
      href="/profile"
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full hover:from-blue-100 hover:to-purple-100 transition-colors border border-blue-200"
    >
      <span className="text-2xl">{levelInfo.icon}</span>
      <div className="text-left">
        <p className="text-xs font-medium text-gray-600">{levelInfo.name}</p>
        <p className="text-sm font-bold text-blue-600">{xp} XP</p>
      </div>
    </Link>
  )
}
