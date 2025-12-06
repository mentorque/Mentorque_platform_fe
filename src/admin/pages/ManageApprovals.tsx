import { useState, useEffect } from 'react'
import { Check, ShieldCheck, User, UserCheck, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface UnverifiedUser {
  id: string
  email: string
  fullName: string | null
  createdAt: string
}

interface UnverifiedMentor {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function ManageApprovals() {
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([])
  const [unverifiedMentors, setUnverifiedMentors] = useState<UnverifiedMentor[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'user' | 'mentor'
    id: string
    name: string
  } | null>(null)

  useEffect(() => {
    loadPendingApprovals()
  }, [])

  const loadPendingApprovals = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/admin/approvals`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUnverifiedUsers(data.unverifiedUsers || [])
        setUnverifiedMentors(data.unverifiedMentors || [])
      } else {
        throw new Error('Failed to load pending approvals')
      }
    } catch (error) {
      console.error('Error loading approvals:', error)
      toast.error('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = (type: 'user' | 'mentor', id: string, name: string) => {
    setConfirmModal({ type, id, name })
  }

  const confirmVerify = async () => {
    if (!confirmModal) return

    try {
      setVerifying(confirmModal.id)
      const endpoint =
        confirmModal.type === 'user'
          ? `${API_URL}/api/admin/approvals/users/${confirmModal.id}`
          : `${API_URL}/api/admin/approvals/mentors/${confirmModal.id}`

      const res = await fetch(endpoint, {
        method: 'PATCH',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success(
          `${confirmModal.type === 'user' ? 'User' : 'Mentor'} verified successfully`
        )
        setConfirmModal(null)
        await loadPendingApprovals()
      } else {
        throw new Error('Failed to verify')
      }
    } catch (error) {
      console.error('Error verifying:', error)
      toast.error('Failed to verify. Please try again.')
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const totalPending = unverifiedUsers.length + unverifiedMentors.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Manage Approvals
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve new users and mentors
            </p>
          </div>
          {totalPending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200 font-semibold">
                {totalPending} Pending
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Unverified Users */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Unverified Users ({unverifiedUsers.length})
          </h3>
        </div>

        {unverifiedUsers.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">All users are verified</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unverifiedUsers.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {user.fullName || 'No name'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleVerify('user', user.id, user.fullName || user.email)}
                  disabled={verifying === user.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying === user.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify User</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unverified Mentors */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Unverified Mentors ({unverifiedMentors.length})
          </h3>
        </div>

        {unverifiedMentors.length === 0 ? (
          <div className="text-center py-12">
            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">All mentors are verified</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unverifiedMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{mentor.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Joined: {new Date(mentor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleVerify('mentor', mentor.id, mentor.name)}
                  disabled={verifying === mentor.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying === mentor.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify Mentor</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Confirm Verification
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to verify{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {confirmModal.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVerify}
                disabled={verifying === confirmModal.id}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying === confirmModal.id ? 'Verifying...' : 'Confirm Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

