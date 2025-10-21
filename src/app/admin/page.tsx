'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { useRouter } from 'next/navigation'

interface InviteCode {
  id: string
  code: string
  createdAt: string
  expiresAt: string
  claimedBy: string | null
  claimedAt: string | null
  users: Array<{ email: string; createdAt: string }>
}

interface User {
  id: string
  email: string
  name: string | null
  xp: number
  isWhitelisted: boolean
  isAdmin: boolean
  lastLoginAt: string | null
  createdAt: string
  _count: {
    files: number
    links: number
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'invites' | 'users'>('invites')
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session && !session.user.isAdmin) {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isAdmin) {
      if (activeTab === 'invites') {
        fetchInviteCodes()
      } else {
        fetchUsers()
      }
    }
  }, [session, activeTab])

  async function fetchInviteCodes() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/invites')
      const data = await response.json()
      setInviteCodes(data.inviteCodes || [])
    } catch (error) {
      console.error('Failed to fetch invite codes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateInviteCode() {
    setGenerating(true)
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 7 })
      })

      if (response.ok) {
        await fetchInviteCodes()
      }
    } catch (error) {
      console.error('Failed to generate invite code:', error)
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  async function toggleWhitelist(userId: string, currentStatus: boolean) {
    setUpdatingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWhitelisted: !currentStatus })
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to toggle whitelist:', error)
    } finally {
      setUpdatingUser(null)
    }
  }

  async function deleteUser(userId: string, userEmail: string) {
    if (!confirm(`Are you sure you want to permanently delete ${userEmail}? This cannot be undone.`)) {
      return
    }

    setDeletingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    } finally {
      setDeletingUser(null)
    }
  }

  function getStatus(invite: InviteCode) {
    if (invite.claimedBy || invite.users.length > 0) {
      return { label: 'Used', color: 'text-gray-500 bg-gray-100' }
    }
    if (new Date() > new Date(invite.expiresAt)) {
      return { label: 'Expired', color: 'text-red-600 bg-red-50' }
    }
    return { label: 'Active', color: 'text-green-600 bg-green-50' }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-white rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Panel</h1>
            
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('invites')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'invites'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Invite Codes
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Users
              </button>
            </div>
          </div>

          {activeTab === 'invites' && (
            <div className="mb-4 flex justify-end">
            
              <button
                onClick={generateInviteCode}
                disabled={generating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {generating ? 'Generating...' : '+ Generate Invite Code'}
              </button>
            </div>
          )}

          {activeTab === 'invites' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Used By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inviteCodes.map((invite) => {
                    const status = getStatus(invite)
                    return (
                      <tr key={invite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-mono font-semibold text-gray-900">
                            {invite.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invite.users[0]?.email || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status.label === 'Active' && (
                            <button
                              onClick={() => copyToClipboard(invite.code)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {copied === invite.code ? '✓ Copied!' : 'Copy'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {inviteCodes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No invite codes yet. Generate one to get started!
                </div>
              )}
            </div>
          </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-900">{user.email}</div>
                            {user.isAdmin && <span className="text-xs text-blue-600">Admin</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.xp}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user._count.files + user._count.links}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isWhitelisted ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'
                          }`}>
                            {user.isWhitelisted ? 'Whitelisted' : 'Not Whitelisted'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleWhitelist(user.id, user.isWhitelisted)}
                              disabled={updatingUser === user.id || deletingUser === user.id}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                            >
                              {updatingUser === user.id ? 'Updating...' : user.isWhitelisted ? 'Unwhitelist' : 'Whitelist'}
                            </button>
                            {session.user.id !== user.id && (
                              <button
                                onClick={() => deleteUser(user.id, user.email)}
                                disabled={deletingUser === user.id || updatingUser === user.id}
                                className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                              >
                                {deletingUser === user.id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No users yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
