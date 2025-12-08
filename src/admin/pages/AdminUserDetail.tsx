import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserCircle, Check, Save, X, Calendar, Video, FileText, Target, ShieldCheck, Shield, Lock, Trash2 } from 'lucide-react'
import JobStats from '@/shared/components/JobStats'
import AdminNavbar from '@/admin/components/AdminNavbar'
import AdminUserStatus from '@/admin/components/AdminUserStatus'
import Pagination from '@/shared/ui/Pagination'
import toast from 'react-hot-toast'
import { useMentorRoute } from '@/admin/hooks/useMentorRoute'
import {
  UserHeaderSkeleton,
  JobStatsSkeleton,
  JobsListSkeleton,
} from '@/shared/ui/Skeleton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface AppliedJob {
  id: string
  title: string
  company?: string
  location?: string
  url: string
  status: string
  appliedDate: string
  createdAt: string
}

interface Mentor {
  id: string
  email: string
  name: string
  picture: string | null
  company: string | null
  role: string | null
  expertise: string | null
  background: string | null
  availability: string | null
  verifiedByAdmin: boolean
}

interface User {
  id: string
  email: string
  fullName: string | null
  goalPerDay: number
  verifiedByAdmin: boolean
  createdAt: string
  mentorId: string | null
  mentor?: {
    id: string
    name: string
    email: string
    picture?: string | null
  }
  Progress?: {
    id: string
    weeks: any
  }
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { apiPrefix } = useMentorRoute()
  const [user, setUser] = useState<User | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [jobs, setJobs] = useState<AppliedJob[]>([])
  const [statsJobs, setStatsJobs] = useState<AppliedJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showMentorSelector, setShowMentorSelector] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    callNumber: 1,
    googleMeetLink: '',
    scheduledAt: '',
    scheduledTime: '',
  })
  const [isScheduling, setIsScheduling] = useState(false)
  const [activeTab, setActiveTab] = useState<'progress' | 'jobs'>('progress')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [isTogglingVerification, setIsTogglingVerification] = useState(false)
  const [eligibleCalls, setEligibleCalls] = useState<number[]>([])
  const [loadingEligibleCalls, setLoadingEligibleCalls] = useState(false)
  const [timeFilter, setTimeFilter] = useState<'all' | '30days' | '7days'>('all')
  const [jobsStats, setJobsStats] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Scheduled sessions state
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [deleteSessionModal, setDeleteSessionModal] = useState<{ userId: string; callNumber: number } | null>(null)
  const [isDeletingSession, setIsDeletingSession] = useState(false)
  
  // Pagination state for jobs
  const [jobsPage, setJobsPage] = useState(1)
  const [jobsPagination, setJobsPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    limit: 10,
  })

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (user?.id) {
      if (activeTab === 'jobs') {
        loadJobs(jobsPage)
      }
      if (activeTab === 'progress') {
        loadScheduledSessions()
      }
    }
  }, [user?.id, jobsPage, activeTab])

  useEffect(() => {
    if (user?.id && activeTab === 'jobs') {
      setJobsPage(1)
      loadJobs(1)
    }
  }, [timeFilter])

  useEffect(() => {
    if (user?.id && activeTab === 'jobs') {
      setStatsJobs([])
      refreshJobAnalytics()
    }
  }, [user?.id, activeTab, timeFilter])

  // Reload eligible calls when modal opens
  useEffect(() => {
    if (showScheduleForm && user?.id) {
      loadEligibleCalls()
    }
  }, [showScheduleForm, user?.id])

  const loadData = async () => {
    try {
      setLoading(true)

      // Check if admin
      const adminInfoStr = localStorage.getItem('adminInfo')
      const parsedAdminInfo = adminInfoStr ? JSON.parse(adminInfoStr) : null
      setAdminInfo(parsedAdminInfo)
      setIsAdmin(parsedAdminInfo?.isAdmin || false)

      const promises = [
        fetch(`${API_URL}/api/admin/users/${id}`, {
          credentials: 'include',
        }),
      ]

      if (parsedAdminInfo?.isAdmin) {
        // Fetch all mentors for selector (no pagination limit)
        promises.push(
          fetch(`${API_URL}/api/admin/mentors?page=1&limit=1000`, {
            credentials: 'include',
          })
        )
      }

      const [userRes, mentorsRes] = await Promise.all(promises)

      if (!userRes.ok) {
        throw new Error('Failed to fetch user')
      }

      const userData = await userRes.json()
      setUser(userData.user)
      setSelectedMentorId(userData.user.mentorId || null)

      if (mentorsRes && mentorsRes.ok) {
        const mentorsData = await mentorsRes.json()
        setMentors(mentorsData.mentors || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      navigate('/admin/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const loadJobs = async (page: number) => {
    if (!id) return
    
    try {
      setJobsLoading(true)
      const pageSize = 10
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        timeFilter,
        forStats: 'false',
      })
      const res = await fetch(`${API_URL}/api/admin/users/${id}/jobs?${params.toString()}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setJobs(data.jobs || [])
        setJobsPagination({
          totalCount: data.pagination.totalCount,
          totalPages: data.pagination.totalPages,
          limit: data.pagination.limit,
        })
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setJobsLoading(false)
    }
  }

  const determineStatsFetchLimit = (stats?: any) => {
    const baseLimit = timeFilter === 'all' ? 200 : 1000
    const totalCount = stats?.total ?? stats?.filteredTotal ?? 0
    if (!totalCount || totalCount <= baseLimit) {
      return baseLimit
    }
    return Math.min(totalCount, 10000)
  }

  const refreshJobAnalytics = async () => {
    if (!user?.id) return
    setStatsLoading(true)
    try {
      const stats = await loadJobsStats()
      const limit = determineStatsFetchLimit(stats)
      await loadJobsForStats(limit)
    } catch (error) {
      console.error('Error refreshing job analytics:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadJobsStats = async () => {
    if (!id) return null

    try {
      const params = new URLSearchParams({ timeFilter })
      const res = await fetch(`${API_URL}/api/admin/users/${id}/jobs/stats?${params.toString()}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setJobsStats(data.stats)
        return data.stats
      }
    } catch (error) {
      console.error('Error loading jobs stats:', error)
    }
    return null
  }

  const loadJobsForStats = async (desiredLimit?: number) => {
    if (!id) return

    try {
      const baseLimit = timeFilter === 'all' ? 200 : 1000
      const limit = Math.min(Math.max(desiredLimit ?? baseLimit, baseLimit), 10000)
      const params = new URLSearchParams({
        page: '1',
        limit: limit.toString(),
        timeFilter,
        forStats: 'true',
      })
      const res = await fetch(`${API_URL}/api/admin/users/${id}/jobs?${params.toString()}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setStatsJobs(data.jobs || [])
      } else {
        setStatsJobs([])
      }
    } catch (error) {
      console.error('Error loading stats jobs:', error)
      setStatsJobs([])
    }
  }

  const handleScheduleCall = async () => {
    if (!isAdmin || !user || !scheduleForm.googleMeetLink || !scheduleForm.scheduledAt || !scheduleForm.scheduledTime) {
      toast.error('Please fill in all fields')
      return
    }

    setIsScheduling(true)
    try {
      const scheduledDateTime = new Date(`${scheduleForm.scheduledAt}T${scheduleForm.scheduledTime}`)
      
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/schedule-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          callNumber: scheduleForm.callNumber,
          googleMeetLink: scheduleForm.googleMeetLink,
          scheduledAt: scheduledDateTime.toISOString(),
        }),
      })

      if (res.ok) {
        toast.success(`Mentor call ${scheduleForm.callNumber} scheduled successfully!`)
        setShowScheduleForm(false)
        setScheduleForm({
          callNumber: 1,
          googleMeetLink: '',
          scheduledAt: '',
          scheduledTime: '',
        })
        await loadEligibleCalls()
        await loadScheduledSessions()
        // Trigger a reload of AdminUserStatus
        window.dispatchEvent(new CustomEvent('userStatusUpdated'))
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to schedule call')
      }
    } catch (error: any) {
      console.error('Error scheduling call:', error)
      toast.error('Failed to schedule call')
    } finally {
      setIsScheduling(false)
    }
  }

  const loadEligibleCalls = async () => {
    if (!id) {
      console.warn('⚠️ No user ID provided for loading eligible calls')
      return
    }
    
    try {
      setLoadingEligibleCalls(true)
      console.log('🔄 Loading eligible calls for user:', id, 'using API:', `${API_URL}${apiPrefix}/users/${id}/eligible-calls`)
      
      const res = await fetch(`${API_URL}${apiPrefix}/users/${id}/eligible-calls`, {
        credentials: 'include',
      })

      console.log('📡 Eligible calls response status:', res.status, res.ok)

      if (res.ok) {
        const data = await res.json()
        const calls = data.eligibleCalls || []
        console.log('✅ Loaded eligible calls:', calls)
        setEligibleCalls(calls)
        
        // Always set the first eligible call as default when calls are loaded
        if (calls.length > 0) {
          // Reset to first eligible call if current selection is not in the list
          if (!calls.includes(scheduleForm.callNumber)) {
            setScheduleForm(prev => ({ ...prev, callNumber: calls[0] }))
          }
        } else {
          // Reset to 1 if no eligible calls
          setScheduleForm(prev => ({ ...prev, callNumber: 1 }))
        }
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Failed to load eligible calls:', res.status, errorData)
        toast.error(errorData.message || 'Failed to load eligible calls')
        setEligibleCalls([])
      }
    } catch (error: any) {
      console.error('❌ Error loading eligible calls:', error)
      toast.error('Error loading eligible calls: ' + (error.message || 'Unknown error'))
      setEligibleCalls([])
    } finally {
      setLoadingEligibleCalls(false)
    }
  }

  const handleAssignMentor = async () => {
    if (!isAdmin || !user) return

    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/mentor`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mentorId: selectedMentorId }),
      })

      if (res.ok) {
        toast.success('Mentor assigned successfully!')
        await loadData()
        setShowMentorSelector(false)
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to assign mentor')
      }
    } catch (error: any) {
      console.error('Error assigning mentor:', error)
      toast.error(error.message || 'Failed to assign mentor')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelSelection = () => {
    setSelectedMentorId(user?.mentorId || null)
    setShowMentorSelector(false)
  }

  const loadScheduledSessions = async () => {
    if (!user?.id) return
    
    try {
      setLoadingSessions(true)
      const res = await fetch(`${API_URL}${apiPrefix}/users/${user.id}/scheduled-calls`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setScheduledSessions(data.sessions || [])
      } else {
        console.error('Failed to load scheduled sessions')
        setScheduledSessions([])
      }
    } catch (error) {
      console.error('Error loading scheduled sessions:', error)
      setScheduledSessions([])
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!deleteSessionModal || !isAdmin) return

    try {
      setIsDeletingSession(true)
      const res = await fetch(
        `${API_URL}${apiPrefix}/mentoring-sessions/${deleteSessionModal.userId}/${deleteSessionModal.callNumber}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      if (res.ok) {
        toast.success('Session deleted successfully')
        setDeleteSessionModal(null)
        await loadScheduledSessions()
        await loadEligibleCalls()
        // Trigger a reload of AdminUserStatus
        window.dispatchEvent(new Event('userStatusUpdated'))
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to delete session')
      }
    } catch (error: any) {
      console.error('Error deleting session:', error)
      toast.error(error.message || 'Failed to delete session')
    } finally {
      setIsDeletingSession(false)
    }
  }


  const handleToggleVerification = async () => {
    if (!isAdmin || !user || !password) {
      toast.error('Please enter your password')
      return
    }

    setIsTogglingVerification(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/toggle-verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: password,
          verifiedByAdmin: !user.verifiedByAdmin,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setUser({ ...user, verifiedByAdmin: data.user.verifiedByAdmin })
        toast.success(data.message || 'Verification status updated successfully')
        setShowPasswordModal(false)
        setPassword('')
        await loadData() // Reload user data
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to update verification status')
      }
    } catch (error: any) {
      console.error('Error toggling verification:', error)
      toast.error('Failed to update verification status')
    } finally {
      setIsTogglingVerification(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Clear token from localStorage on logout
      localStorage.removeItem('adminToken')
      
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('adminInfo')
      navigate('/admin')
    }
  }

  const handleDeleteUser = async () => {
    if (!isAdmin || !user) return

    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}${apiPrefix}/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('User deleted successfully')
        setShowDeleteModal(false)
        navigate('/admin/dashboard')
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to delete user')
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const breadcrumbs = user
    ? [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Users', path: '/admin/dashboard' },
        { label: user.fullName || user.email },
      ]
    : [{ label: 'Dashboard', path: '/admin/dashboard' }, { label: 'Users', path: '/admin/dashboard' }]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {adminInfo && (
          <AdminNavbar
            adminName={adminInfo.name}
            onLogout={handleLogout}
            breadcrumbs={breadcrumbs}
            isAdmin={adminInfo.isAdmin}
          />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserHeaderSkeleton />
          <div className="mt-6">
            <JobStatsSkeleton />
          </div>
          <div className="mt-6">
            <JobsListSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {adminInfo && (
          <AdminNavbar
            adminName={adminInfo.name}
            onLogout={handleLogout}
            breadcrumbs={breadcrumbs}
            isAdmin={adminInfo.isAdmin}
          />
        )}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">User not found</p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getTotalJobsCount = () => {
    if (!jobsStats) {
      return jobsPagination.totalCount || jobs.length || 0
    }

    if (timeFilter === '7days') {
      return jobsStats.filteredTotal ?? jobsStats.last7Days ?? jobsStats.total ?? 0
    }
    if (timeFilter === '30days') {
      return jobsStats.filteredTotal ?? jobsStats.last30Days ?? jobsStats.total ?? 0
    }
    return jobsStats.total ?? jobsStats.filteredTotal ?? 0
  }

  const totalJobsCount = getTotalJobsCount()
  const jobsForStats = statsJobs.length > 0 ? statsJobs : statsLoading ? [] : jobs

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {adminInfo && (
        <AdminNavbar
          adminName={adminInfo.name}
          onLogout={handleLogout}
          breadcrumbs={breadcrumbs}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* User Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.fullName || user.email}
                </h1>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={user.verifiedByAdmin ? 'Verified - Click to revoke' : 'Not verified - Click to verify'}
                      >
                        {user.verifiedByAdmin ? (
                          <ShieldCheck className="w-6 h-6 text-green-500" />
                        ) : (
                          <Shield className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-6 h-6 text-red-500" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                {user.mentor && (
                  <div className="flex items-center gap-2 mt-1">
                    {user.mentor.picture ? (
                      <img
                        src={user.mentor.picture}
                        alt={user.mentor.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {user.mentor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                    Mentor: {user.mentor.name}
                  </p>
                  </div>
                )}
              </div>
            </div>
            {isAdmin && (
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                  {!showMentorSelector ? (
                    <>
                      <button
                        onClick={() => {
                          // Open modal - eligible calls will be loaded via useEffect
                          setShowScheduleForm(true)
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>Schedule Call</span>
                      </button>
                      <button
                        onClick={() => setShowMentorSelector(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {user.mentor ? (
                          <>
                            <span>Change Mentor</span>
                          </>
                        ) : (
                          <>
                            <UserCircle className="w-4 h-4" />
                            <span>Assign Mentor</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelSelection}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignMentor}
                      disabled={isSaving || selectedMentorId === (user.mentorId || null)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mentor Selector */}
        {isAdmin && showMentorSelector && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Select a Mentor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {/* No Mentor Option */}
              <button
                onClick={() => setSelectedMentorId(null)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMentorId === null
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">No Mentor</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unassign mentor</p>
                  </div>
                  {selectedMentorId === null && (
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Mentor Options */}
              {mentors.map((mentor) => (
                <button
                  key={mentor.id}
                  onClick={() => setSelectedMentorId(mentor.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedMentorId === mentor.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {mentor.picture ? (
                      <img
                        src={mentor.picture}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-lg">
                          {mentor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {mentor.name}
                      </p>
                      {(mentor.role || mentor.company) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {mentor.role ? `${mentor.role}` : ''}
                          {mentor.role && mentor.company ? ' at ' : ''}
                          {mentor.company ? mentor.company : ''}
                        </p>
                      )}
                      {mentor.expertise && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-1">
                          {mentor.expertise}
                        </p>
                      )}
                    </div>
                    {selectedMentorId === mentor.id && (
                      <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            {mentors.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No mentors available
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Progress
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Target className="w-4 h-4" />
            Applied Jobs
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'progress' ? (
          <>
            <div className="mb-6">
              <AdminUserStatus userId={user.id} isAdmin={isAdmin} />
            </div>

            {/* Scheduled Mentoring Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Mentoring Sessions
                </h2>
                {scheduledSessions.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {scheduledSessions.length} session{scheduledSessions.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loadingSessions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : scheduledSessions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No sessions scheduled yet
                </p>
              ) : (
                <div className="space-y-3">
                  {scheduledSessions.map((session) => {
                    const isPast = session.isPast || session.completedAt
                    return (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                          isPast
                            ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 scale-95 opacity-75'
                            : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            isPast
                              ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {session.callNumber}
                          </div>
                          <div>
                            <p className={`font-semibold ${
                              isPast
                                ? 'text-gray-600 dark:text-gray-400 text-sm'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              Call {session.callNumber}
                              {session.completedAt && (
                                <span className="ml-2 text-xs bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                  Completed
                                </span>
                              )}
                            </p>
                            <p className={`flex items-center gap-2 mt-1 ${
                              isPast
                                ? 'text-gray-500 dark:text-gray-500 text-xs'
                                : 'text-gray-600 dark:text-gray-400 text-sm'
                            }`}>
                              <Calendar className={`${isPast ? 'w-3 h-3' : 'w-4 h-4'}`} />
                              {new Date(session.scheduledAt).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                            {session.googleMeetLink && (
                              <a
                                href={session.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1 mt-1 hover:underline ${
                                  isPast
                                    ? 'text-gray-500 dark:text-gray-500 text-xs'
                                    : 'text-blue-600 dark:text-blue-400 text-sm'
                                }`}
                              >
                                <Video className={`${isPast ? 'w-3 h-3' : 'w-4 h-4'}`} />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteSessionModal({ userId: session.userId, callNumber: session.callNumber })}
                            className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ${
                              isPast ? 'opacity-50' : ''
                            }`}
                            title="Delete session"
                          >
                            <Trash2 className={`${isPast ? 'w-4 h-4' : 'w-5 h-5'}`} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
        {/* Job Stats Component */}
        {statsLoading ? (
          <JobStatsSkeleton />
        ) : (
          <JobStats
            jobs={jobsForStats}
            goalPerDay={user.goalPerDay || 3}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
          />
        )}

            {/* Jobs List with Pagination */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Applied Jobs ({totalJobsCount})
          </h2>
              {jobsLoading ? (
                <JobsListSkeleton />
              ) : (
                <>
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No jobs applied yet
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{job.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.company} • {new Date(job.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Applied'
                        ? 'bg-blue-100 text-blue-800'
                        : job.status === 'Got Call Back'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'Received Offer'
                        ? 'bg-purple-100 text-purple-800'
                        : job.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))
            )}
              </div>
                  
                {/* Pagination */}
                {jobsPagination.totalPages > 1 && (
                    <Pagination
                      currentPage={jobsPage}
                      totalPages={jobsPagination.totalPages}
                      onPageChange={setJobsPage}
                      totalItems={jobsPagination.totalCount}
                      startIndex={(jobsPage - 1) * jobsPagination.limit}
                      endIndex={(jobsPage - 1) * jobsPagination.limit + jobs.length}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Schedule Call Modal */}
        {isAdmin && showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Video className="w-6 h-6 text-blue-600" />
                    Schedule Mentoring Session
                  </h2>
                  <button
                    onClick={() => {
                      setShowScheduleForm(false)
                      setScheduleForm({
                        callNumber: 1,
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
                      Call Number
                    </label>
                    <select
                      value={eligibleCalls.includes(scheduleForm.callNumber) ? scheduleForm.callNumber : (eligibleCalls.length > 0 ? eligibleCalls[0] : '')}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, callNumber: parseInt(e.target.value) })}
                      disabled={loadingEligibleCalls || eligibleCalls.length === 0}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingEligibleCalls ? (
                        <option value="">Loading eligible calls...</option>
                      ) : eligibleCalls.length > 0 ? (
                        eligibleCalls.map((callNum) => (
                          <option key={callNum} value={callNum}>
                            Call {callNum}
                          </option>
                        ))
                      ) : (
                        <option value="">No eligible calls available</option>
                      )}
                    </select>
                    {!loadingEligibleCalls && eligibleCalls.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        No calls available for scheduling. Complete required milestones or all unlocked calls may already have future sessions scheduled.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Google Meet Link
                    </label>
                    <input
                      type="url"
                      value={scheduleForm.googleMeetLink}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, googleMeetLink: e.target.value })}
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
                        value={scheduleForm.scheduledAt}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
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
                        value={scheduleForm.scheduledTime}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleScheduleCall}
                      disabled={isScheduling || eligibleCalls.length === 0 || loadingEligibleCalls}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isScheduling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Schedule
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowScheduleForm(false)
                        setScheduleForm({
                          callNumber: 1,
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

        {/* Delete User Confirmation Modal */}
        {isAdmin && showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    Delete User
                  </h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.fullName || user?.email}</span>? This will perform a soft delete and the user will be marked as deleted.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
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

        {/* Password Confirmation Modal for Verification Toggle */}
        {isAdmin && showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-blue-600" />
                    Confirm Password
                  </h2>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPassword('')
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {user?.verifiedByAdmin
                        ? 'Enter your password to revoke verification for this user.'
                        : 'Enter your password to verify this user.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your admin password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleToggleVerification()
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleToggleVerification}
                      disabled={isTogglingVerification || !password}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isTogglingVerification ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {user?.verifiedByAdmin ? 'Revoking...' : 'Verifying...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {user?.verifiedByAdmin ? 'Revoke Verification' : 'Verify User'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(false)
                        setPassword('')
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

        {/* Delete Session Confirmation Modal */}
        {deleteSessionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    Delete Session
                  </h2>
                  <button
                    onClick={() => setDeleteSessionModal(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete Call {deleteSessionModal.callNumber}? This will permanently remove the scheduled session data from the database.
                  </p>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleDeleteSession}
                      disabled={isDeletingSession}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isDeletingSession ? (
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
                      onClick={() => setDeleteSessionModal(null)}
                      disabled={isDeletingSession}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
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
      </div>
    </div>
  )
}

