import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserCircle, Check, Save, X, Calendar, Video, FileText, Target, ShieldCheck, Shield, Lock } from 'lucide-react'
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
  const [jobsLoading, setJobsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showMentorSelector, setShowMentorSelector] = useState(false)
  const [userStatus, setUserStatus] = useState<any>(null)
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
        loadUserStatus()
      }
    }
  }, [user?.id, jobsPage, activeTab])

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
      const res = await fetch(`${API_URL}/api/admin/users/${id}/jobs?page=${page}&limit=10`, {
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

  const loadUserStatus = async () => {
    if (!id) return
    
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUserStatus(data.userStatus)
      }
    } catch (error) {
      console.error('Error loading user status:', error)
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
        // Reload userStatus and eligible calls to reflect the new schedule
        await loadUserStatus()
        await loadEligibleCalls()
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
        
        // Set the first eligible call as default if available and current selection is not in the list
        if (calls.length > 0) {
          if (!calls.includes(scheduleForm.callNumber)) {
            setScheduleForm(prev => ({ ...prev, callNumber: calls[0] }))
          }
        }
        
        if (calls.length === 0) {
          toast.error('No eligible calls available for this user')
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

  // Calculate stats from all jobs (we'll need to fetch total count separately for stats)
  // For now, we'll use the paginated jobs for stats display
  const totalJobsCount = jobsPagination.totalCount || jobs.length

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
                        onClick={async () => {
                          // Load eligible calls before opening modal
                          await loadEligibleCalls()
                          // Open modal after loading (even if no eligible calls, to show message)
                          setShowScheduleForm(true)
                        }}
                        disabled={loadingEligibleCalls}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {loadingEligibleCalls ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            <span>Schedule Call</span>
                          </>
                        )}
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
          <div className="mb-6">
            <AdminUserStatus userId={user.id} isAdmin={isAdmin} />
          </div>
        ) : (
          <>
            {/* Job Stats Component - Using current jobs for display */}
        <JobStats jobs={jobs} goalPerDay={user.goalPerDay || 3} />

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
                      value={scheduleForm.callNumber}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, callNumber: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
      </div>
    </div>
  )
}

