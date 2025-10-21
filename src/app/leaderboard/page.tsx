import { prisma } from '@/lib/prisma'
import { getLevelFromXP } from '@/lib/xp'
import Link from 'next/link'

export default async function LeaderboardPage() {
  // Get top 100 users by XP
  const topUsers = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      xp: true,
      isAdmin: true,
      _count: {
        select: {
          uploadedFiles: true,
          uploadedLinks: true,
          createdCollections: true,
        }
      }
    }
  })

  // Calculate total stats
  const totalUsers = await prisma.user.count()
  const totalFiles = await prisma.file.count()
  const totalLinks = await prisma.link.count()
  const totalCollections = await prisma.collection.count()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          ← Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-xl text-gray-600">Top contributors to Zero Noise</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
            <p className="text-gray-600 text-sm">Total Users</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{totalFiles}</p>
            <p className="text-gray-600 text-sm">Files Uploaded</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{totalLinks}</p>
            <p className="text-gray-600 text-sm">Links Saved</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{totalCollections}</p>
            <p className="text-gray-600 text-sm">Collections</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">XP</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Files</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Links</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Collections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topUsers.map((user, index) => {
                  const level = getLevelFromXP(user.xp)
                  const rank = index + 1
                  const isTopThree = rank <= 3

                  return (
                    <tr 
                      key={user.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isTopThree ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {rank === 1 && <span className="text-2xl">🥇</span>}
                          {rank === 2 && <span className="text-2xl">🥈</span>}
                          {rank === 3 && <span className="text-2xl">🥉</span>}
                          <span className={`font-semibold ${isTopThree ? 'text-lg' : ''}`}>
                            #{rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/u/${user.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {user.name || user.email?.split('@')[0] || 'Anonymous'}
                            </p>
                            {user.isAdmin && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{level.icon}</span>
                          <span className="font-medium">{level.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-blue-600">{user.xp}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700">{user._count.uploadedFiles}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700">{user._count.uploadedLinks}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-700">{user._count.createdCollections}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* XP Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">How to Earn XP</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📄</div>
              <p className="font-semibold">File Upload</p>
              <p className="text-sm text-gray-600">+10 XP per file</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🔗</div>
              <p className="font-semibold">Link Save</p>
              <p className="text-sm text-gray-600">+5 XP per link</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">📦</div>
              <p className="font-semibold">Collection Create</p>
              <p className="text-sm text-gray-600">+15 XP per collection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
