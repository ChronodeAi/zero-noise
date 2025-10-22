import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getLevelInfo } from '@/lib/xp'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      xp: true,
      isAdmin: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          files: true,
          links: true,
          collections: true,
        }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const levelInfo = getLevelInfo(user.xp)

  // Get recent uploads
  const recentFiles = await prisma.file.findMany({
    where: { uploadedBy: user.id },
    orderBy: { uploadedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      filename: true,
      mimeType: true,
      size: true,
      uploadedAt: true,
      collectionId: true,
    }
  })

  const recentLinks = await prisma.link.findMany({
    where: { uploadedBy: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      url: true,
      linkType: true,
      createdAt: true,
      collectionId: true,
    }
  })

  const recentActivity = [
    ...recentFiles.map(f => ({
      ...f,
      type: 'file' as const,
      displayName: f.filename,
      createdAt: f.uploadedAt,
    })),
    ...recentLinks.map(l => ({
      ...l,
      type: 'link' as const,
      displayName: l.title || l.url,
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          ← Back to Home
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {user.name || user.email?.split('@')[0] || 'User'}
                </h1>
                {user.isAdmin && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Level & XP */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{levelInfo.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{levelInfo.name}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{user.xp}</p>
                <p className="text-sm text-gray-600">XP</p>
              </div>
            </div>
            
            {/* Progress bar */}
            {levelInfo.maxXP !== Infinity && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>{levelInfo.progressPercentage.toFixed(1)}% to next level</span>
                  <span>{levelInfo.xpToNextLevel} XP needed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${levelInfo.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-3xl font-bold text-blue-600">{user._count.files}</p>
              <p className="text-gray-600">Files Uploaded</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-3xl font-bold text-purple-600">{user._count.links}</p>
              <p className="text-gray-600">Links Saved</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-3xl font-bold text-green-600">{user._count.collections}</p>
              <p className="text-gray-600">Collections</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activity yet. Upload some files to get started!</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/c/${item.collectionId}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {item.type === 'file' ? '📄' : '🔗'}
                        </span>
                        <h3 className="font-medium truncate">{item.displayName}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 flex-shrink-0">
                          {item.type === 'file' ? 'File' : 'Link'}
                        </span>
                      </div>
                      {item.type === 'file' && 'size' in item && (
                        <p className="text-sm text-gray-500">
                          {'mimeType' in item && item.mimeType} • {((item.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Member Since */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          {user.lastLoginAt && (
            <p>Last active {new Date(user.lastLoginAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  )
}
