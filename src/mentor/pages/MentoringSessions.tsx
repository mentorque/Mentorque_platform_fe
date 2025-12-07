import { useState, useEffect } from 'react'
import { Video, User, ExternalLink, Calendar, Pencil, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ScheduledSession {
  id: string
  userId: string
  userEmail: string
  userName: string | null
  callNumber: number
  scheduledAt: string
  googleMeetLink: string | null
  completedAt: string | null
}

// Helper function to get preset description for each call
const getCallDescription = (callNumber: number, userName: string | null, userEmail: string) => {
  const displayName = userName || userEmail.split('@')[0]
  
  const descriptions: Record<number, string> = {
    1: `${displayName} has finished their orientation and resume rebuilding, so this call with you will be around reviewing the rebuilt resume and establishing their career path.`,
    2: `${displayName} has finished their resume rebuild and portfolio, so this call with you will be around reviewing their portfolio and strategizing next steps.`,
    3: `${displayName} has completed their tech distribution, so this call with you will be around discussing their technical stack and preparing for technical interviews.`,
    4: `${displayName} has applied to jobs and completed interview preparation, so this call with you will be around reviewing their application strategy and interview experiences.`,
    5: `${displayName} has completed their final review, so this call with you will be a comprehensive wrap-up and celebration of their progress.`,
  }
  
  return descriptions[callNumber] || `This is call ${callNumber} with ${displayName}.`
}

export default function MentoringSessions() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null)
  const [deletingSession, setDeletingSession] = useState<ScheduledSession | null>(null)
  const [editForm, setEditForm] = useState({
    googleMeetLink: '',
    scheduledAt: '',
    scheduledTime: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    checkAdminAndLoadData()
  }, [])

  const checkAdminAndLoadData = async () => {
    try {
      // Check if user is admin
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const meRes = await fetch(`${API_URL}/api/mentor/me`, {
        credentials: 'include',
        headers,
      })

      if (meRes.ok) {
        const meData = await meRes.json()
        setIsAdmin(meData.adminMentor?.isAdmin || false)
      }

      await loadSessions()
    } catch (error) {
      console.error('Error checking admin status:', error)
      await loadSessions()
    }
  }

  const loadSessions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/mentoring-sessions`, {
        credentials: 'include',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        console.log('✅ Loaded mentoring sessions:', data)
        setSessions(data.sessions || [])
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Failed to load sessions:', res.status, errorData)
      }
    } catch (error) {
      console.error('❌ Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (session: ScheduledSession) => {
    const scheduledDate = new Date(session.scheduledAt)
    const dateStr = scheduledDate.toISOString().split('T')[0]
    const timeStr = scheduledDate.toTimeString().slice(0, 5) // HH:mm format
    
    setEditingSession(session)
    setEditForm({
      googleMeetLink: session.googleMeetLink || '',
      scheduledAt: dateStr,
      scheduledTime: timeStr,
    })
  }

  const handleUpdate = async () => {
    if (!editingSession || !editForm.googleMeetLink || !editForm.scheduledAt || !editForm.scheduledTime) {
      toast.error('Please fill in all fields')
      return
    }

    setIsUpdating(true)
    try {
      const scheduledDateTime = new Date(`${editForm.scheduledAt}T${editForm.scheduledTime}`)
      
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/users/${editingSession.userId}/update-call`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          callNumber: editingSession.callNumber,
          googleMeetLink: editForm.googleMeetLink,
          scheduledAt: scheduledDateTime.toISOString(),
        }),
      })

      if (res.ok) {
        toast.success(`Mentor call ${editingSession.callNumber} updated successfully!`)
        setEditingSession(null)
        setEditForm({
          googleMeetLink: '',
          scheduledAt: '',
          scheduledTime: '',
        })
        await loadSessions()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to update call')
      }
    } catch (error: any) {
      console.error('Error updating call:', error)
      toast.error('Failed to update call')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingSession) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/mentoring-sessions/${deletingSession.userId}/${deletingSession.callNumber}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      })

      if (res.ok) {
        toast.success(`Mentor call ${deletingSession.callNumber} deleted successfully!`)
        setDeletingSession(null)
        await loadSessions()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to delete call')
      }
    } catch (error: any) {
      console.error('Error deleting call:', error)
      toast.error('Failed to delete call')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Mentoring Sessions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all scheduled mentor calls
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Scheduled Sessions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no scheduled mentoring sessions at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl border border-blue-500 p-6"
            >
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-white">
                        Mentor Call {session.callNumber}
                      </h3>
                      <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                        Scheduled
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                          title="Edit session"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletingSession(session)}
                          className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-blue-100">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {session.userName || session.userEmail}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(session.scheduledAt).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-blue-50 text-sm leading-relaxed mb-4">
                    {getCallDescription(session.callNumber, session.userName, session.userEmail)}
                  </p>
                  {session.googleMeetLink && (
                    <a
                      href={session.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join Google Meet
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Pencil className="w-6 h-6 text-blue-600" />
                  Edit Mentoring Session
                </h2>
                <button
                  onClick={() => {
                    setEditingSession(null)
                    setEditForm({
                      googleMeetLink: '',
                      scheduledAt: '',
                      scheduledTime: '',
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Meet Link
                  </label>
                  <input
                    type="url"
                    value={editForm.googleMeetLink}
                    onChange={(e) => setEditForm({ ...editForm, googleMeetLink: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={editForm.scheduledAt}
                      onChange={(e) => setEditForm({ ...editForm, scheduledAt: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={editForm.scheduledTime}
                      onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingSession(null)
                      setEditForm({
                        googleMeetLink: '',
                        scheduledAt: '',
                        scheduledTime: '',
                      })
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-600" />
                  Delete Session
                </h2>
                <button
                  onClick={() => setDeletingSession(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete Mentor Call {deletingSession.callNumber} scheduled for{' '}
                <strong>{deletingSession.userName || deletingSession.userEmail}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
                <button
                  onClick={() => setDeletingSession(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
