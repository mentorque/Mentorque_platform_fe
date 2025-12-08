import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserCircle, Check, Save, X, Calendar, Video, Target, FileText, List, Trash2 } from 'lucide-react'
import JobStats from '@/shared/components/JobStats'
import MentorNavbar from '@/mentor/components/MentorNavbar'
import Pagination from '@/shared/ui/Pagination'
import toast from 'react-hot-toast'
import {
  UserHeaderSkeleton,
  JobStatsSkeleton,
  JobsListSkeleton,
} from '@/shared/ui/Skeleton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const apiPrefix = '/api/mentor'

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

export default function MentorUserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [jobs, setJobs] = useState<AppliedJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [jobsStats, setJobsStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
  const [activeTab, setActiveTab] = useState<'calls' | 'jobs'>('calls')
  const [eligibleCalls, setEligibleCalls] = useState<number[]>([])
  const [loadingEligibleCalls, setLoadingEligibleCalls] = useState(false)
  const [timeFilter, setTimeFilter] = useState<'all' | '30days' | '7days'>('all')
  const [statsJobs, setStatsJobs] = useState<AppliedJob[]>([])
  
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

  // Mentor session notes state
  const [sessionNotes, setSessionNotes] = useState<any[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [editingCallNumber, setEditingCallNumber] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (user?.id) {
      if (activeTab === 'jobs') {
        loadJobs(jobsPage)
      }
      if (activeTab === 'calls') {
        loadSessionNotes()
        loadScheduledSessions()
      }
    }
  }, [user?.id, activeTab])

  useEffect(() => {
    if (user?.id && activeTab === 'jobs') {
      setStatsJobs([])
      refreshJobAnalytics()
    }
  }, [user?.id, activeTab, timeFilter])

  // Reload jobs when page or filter changes
  useEffect(() => {
    if (user?.id && activeTab === 'jobs') {
      loadJobs(jobsPage)
    }
  }, [jobsPage, timeFilter])

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (user?.id && activeTab === 'jobs' && timeFilter !== 'all' && jobsPage !== 1) {
      setJobsPage(1)
    }
  }, [timeFilter])

  // Reload eligible calls when modal opens
  useEffect(() => {
    if (showScheduleForm && user?.id) {
      loadEligibleCalls()
    }
  }, [showScheduleForm, user?.id])

  // Helper function to get auth headers
  const getMentorHeaders = (includeContentType = false): HeadersInit => {
    const token = localStorage.getItem('mentorToken')
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (includeContentType) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  const loadData = async () => {
    try {
      setLoading(true)
      // Clear jobs when loading new user to prevent showing stale data
      setJobs([])
      setStatsJobs([])
      setJobsPagination({
        totalCount: 0,
        totalPages: 0,
        limit: 10,
      })

      // Get mentor info
      const mentorInfoStr = localStorage.getItem('mentorInfo')
      const parsedMentorInfo = mentorInfoStr ? JSON.parse(mentorInfoStr) : null
      setAdminInfo(parsedMentorInfo)

      const [userRes] = await Promise.all([
        fetch(`${API_URL}/api/mentor/users/${id}`, {
          credentials: 'include',
          headers: getMentorHeaders(),
        }),
      ])

      if (!userRes.ok) {
        throw new Error('Failed to fetch user')
      }

      const userData = await userRes.json()
      setUser(userData.user)
      setSelectedMentorId(userData.user.mentorId || null)
    } catch (error) {
      console.error('Error loading user data:', error)
      navigate('/mentor/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const loadMentors = async () => {
    if (mentors.length > 0) return

    try {
      const res = await fetch(`${API_URL}/api/mentor/mentors`, {
        credentials: 'include',
        headers: getMentorHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        setMentors(data.mentors || [])
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Failed to load mentors:', res.status, errorData)
      }
    } catch (error) {
      console.error('Error loading mentors:', error)
    }
  }

  useEffect(() => {
    if (showMentorSelector && mentors.length === 0) {
      loadMentors()
    }
  }, [showMentorSelector, mentors.length])

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
      const query = new URLSearchParams({ timeFilter })
      const res = await fetch(`${API_URL}/api/mentor/users/${id}/jobs/stats?${query.toString()}`, {
        credentials: 'include',
        headers: getMentorHeaders(),
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
      const res = await fetch(`${API_URL}/api/mentor/users/${id}/jobs?${params.toString()}`,
        {
          credentials: 'include',
          headers: getMentorHeaders(),
        }
      )

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

  const loadJobs = async (page: number) => {
    if (!id) {
      console.warn('⚠️ No user ID provided for loading jobs')
      return
    }
    
    try {
      setJobsLoading(true)
      console.log('🔄 Loading jobs for user:', id, 'page:', page, 'filter:', timeFilter)
      const pageSize = 10
      const qs = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        timeFilter,
        forStats: 'false',
      })
      const url = `${API_URL}/api/mentor/users/${id}/jobs?${qs.toString()}`
      const res = await fetch(url, {
        credentials: 'include',
        headers: getMentorHeaders(),
      })

      console.log('📡 Jobs response status:', res.status, res.ok)

      if (res.ok) {
        const data = await res.json()
        console.log('✅ Loaded jobs data:', data)
        console.log('📊 Jobs count:', data.jobs?.length || 0)
        console.log('📄 Pagination:', data.pagination)
        console.log('👤 Loading jobs for user ID:', id)
        console.log('📋 Sample job:', data.jobs?.[0])
        
        // Verify jobs belong to the correct user
        if (data.jobs && data.jobs.length > 0) {
          const firstJob = data.jobs[0]
          console.log('🔍 First job details:', {
            id: firstJob.id,
            title: firstJob.title,
            company: firstJob.company,
            appliedDate: firstJob.appliedDate
          })
        }
        
        setJobs(data.jobs || [])
        setJobsPagination({
          totalCount: data.pagination?.totalCount || 0,
          totalPages: data.pagination?.totalPages || 0,
          limit: data.pagination?.limit || 10,
        })
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Failed to load jobs:', res.status, errorData)
        toast.error(errorData.message || 'Failed to load applied jobs')
        setJobs([])
        setJobsPagination({
          totalCount: 0,
          totalPages: 0,
          limit: 10,
        })
      }
    } catch (error) {
      console.error('❌ Error loading jobs:', error)
      toast.error('Failed to load applied jobs')
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }

  const loadSessionNotes = async () => {
    if (!id) {
      console.warn('⚠️ No user ID provided for loading session notes')
      return
    }
    
    try {
      setLoadingNotes(true)
      console.log('🔄 Loading session notes for user:', id)
      const res = await fetch(`${API_URL}/api/mentor-session-notes/${id}`, {
        credentials: 'include',
        headers: getMentorHeaders(),
      })

      if (res.ok) {
        const data = await res.json()
        console.log('✅ Loaded session notes:', data)
        setSessionNotes(data.calls || [])
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Failed to load session notes:', res.status, errorData)
        // Set default calls if API fails
        setSessionNotes([
          { callNumber: 1, title: 'Resume Finalisation, Preparation Tips and Job Application Strategy', notes: '', updatedAt: null },
          { callNumber: 2, title: 'Progress Review and Strategy Adjustment', notes: '', updatedAt: null },
          { callNumber: 3, title: 'Mock Interview', notes: '', updatedAt: null },
          { callNumber: 4, title: 'Mock Interview', notes: '', updatedAt: null },
        ])
      }
    } catch (error) {
      console.error('❌ Error loading session notes:', error)
      // Set default calls on error
      setSessionNotes([
        { callNumber: 1, title: 'Resume Finalisation, Preparation Tips and Job Application Strategy', notes: '', updatedAt: null },
        { callNumber: 2, title: 'Progress Review and Strategy Adjustment', notes: '', updatedAt: null },
        { callNumber: 3, title: 'Mock Interview', notes: '', updatedAt: null },
        { callNumber: 4, title: 'Mock Interview', notes: '', updatedAt: null },
      ])
    } finally {
      setLoadingNotes(false)
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const textarea = e.target
    const cursorPosition = textarea.selectionStart
    
    // Convert "- " to "➤ " when typed
    let newValue = value
    if (value.includes('- ')) {
      // Replace "- " with "➤ " but preserve cursor position
      const lines = value.split('\n')
      let newLines = lines.map(line => {
        // Only replace if it's at the start of the line or after whitespace
        if (line.trim().startsWith('- ')) {
          return line.replace(/^(\s*)- /, '$1➤ ')
        }
        return line
      })
      newValue = newLines.join('\n')
      
      // Adjust cursor position if replacement happened
      if (newValue !== value) {
        const diff = (newValue.match(/➤/g) || []).length - (value.match(/➤/g) || []).length
        const newCursorPosition = cursorPosition + diff
        setNoteText(newValue)
        setTimeout(() => {
          if (notesTextareaRef.current) {
            notesTextareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
          }
        }, 0)
        return
      }
    }
    
    setNoteText(newValue)
  }

  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.target as HTMLTextAreaElement
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = noteText.substring(0, cursorPosition)
      const currentLine = textBeforeCursor.split('\n').pop() || ''
      
      // Check if current line starts with ➤
      if (currentLine.trim().startsWith('➤')) {
        e.preventDefault()
        
        // Get indentation from current line
        const match = currentLine.match(/^(\s*)/)
        const indent = match ? match[1] : ''
        
        // Insert new line with ➤ and same indentation
        const textAfterCursor = noteText.substring(cursorPosition)
        const newText = textBeforeCursor + '\n' + indent + '➤ ' + textAfterCursor
        const newCursorPosition = cursorPosition + indent.length + '➤ '.length + 1
        
        setNoteText(newText)
        setTimeout(() => {
          if (notesTextareaRef.current) {
            notesTextareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
          }
        }, 0)
      }
    }
  }

  const saveSessionNote = async (callNumber: number, notes: string) => {
    if (!id) return
    
    try {
      setSavingNote(true)
      const res = await fetch(`${API_URL}/api/mentor-session-notes/${id}/${callNumber}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...getMentorHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      if (res.ok) {
        toast.success('Session notes saved successfully')
        await loadSessionNotes()
        setEditingCallNumber(null)
        setNoteText('')
        setNotesModalOpen(false)
      } else {
        toast.error('Failed to save session notes')
      }
    } catch (error) {
      console.error('Error saving session notes:', error)
      toast.error('Failed to save session notes')
    } finally {
      setSavingNote(false)
    }
  }

  const handleScheduleCall = async () => {
    if (!user || !scheduleForm.googleMeetLink || !scheduleForm.scheduledAt || !scheduleForm.scheduledTime) {
      toast.error('Please fill in all fields')
      return
    }

    setIsScheduling(true)
    try {
      const scheduledDateTime = new Date(`${scheduleForm.scheduledAt}T${scheduleForm.scheduledTime}`)
      
      const res = await fetch(`${API_URL}/api/mentor/users/${user.id}/schedule-call`, {
        method: 'POST',
        headers: getMentorHeaders(true),
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
        // Reload eligible calls and scheduled sessions to reflect the new schedule
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
        headers: getMentorHeaders(),
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
    if (!user) return

    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/mentor/users/${user.id}/mentor`, {
        method: 'PATCH',
        headers: getMentorHeaders(true),
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
        headers: getMentorHeaders(),
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
    if (!deleteSessionModal) return

    try {
      setIsDeletingSession(true)
      const res = await fetch(
        `${API_URL}${apiPrefix}/mentoring-sessions/${deleteSessionModal.userId}/${deleteSessionModal.callNumber}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: getMentorHeaders(),
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


  const handleLogout = async () => {
    try {
      // Clear token from localStorage on logout
      localStorage.removeItem('adminToken')
      
      await fetch(`${API_URL}/api/mentor/logout`, {
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
        { label: 'Dashboard', path: '/mentor/dashboard' },
        { label: 'Users', path: '/mentor/dashboard' },
        { label: user.fullName || user.email },
      ]
    : [{ label: 'Dashboard', path: '/mentor/dashboard' }, { label: 'Users', path: '/mentor/dashboard' }]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {adminInfo && (
          <MentorNavbar
            mentorName={adminInfo.name}
            onLogout={handleLogout}
            breadcrumbs={breadcrumbs}
            mentorInfo={adminInfo}
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
          <MentorNavbar
            mentorName={adminInfo.name}
            onLogout={handleLogout}
            breadcrumbs={breadcrumbs}
            mentorInfo={adminInfo}
          />
        )}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">User not found</p>
            <button
              onClick={() => navigate('/mentor/dashboard')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Get total count from stats or pagination
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
        <MentorNavbar
          mentorName={adminInfo.name}
          onLogout={handleLogout}
          breadcrumbs={breadcrumbs}
          mentorInfo={adminInfo}
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.fullName || user.email}
                </h1>
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
            {adminInfo?.isAdmin && (
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
        {/* Show/Hide Mentor Selector based on user.mentorId */}
        {showMentorSelector && (
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
            onClick={() => setActiveTab('calls')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'calls'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Video className="w-4 h-4" />
            Mentoring Calls
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
        {activeTab === 'calls' ? (
          <>
            {/* Mentoring Calls Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Mentoring Calls
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
              Here you can keep track of all the mentoring calls with the candidate.
              </p>

              {loadingNotes ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {(sessionNotes.length > 0 ? sessionNotes : [
                    { callNumber: 1, title: 'Resume Finalisation, Preparation Tips and Job Application Strategy', notes: '', updatedAt: null },
                    { callNumber: 2, title: 'Progress Review and Strategy Adjustment', notes: '', updatedAt: null },
                    { callNumber: 3, title: 'Mock Interview', notes: '', updatedAt: null },
                    { callNumber: 4, title: 'Mock Interview', notes: '', updatedAt: null },
                  ]).map((call) => {
                    // Find if this call is scheduled
                    const scheduledSession = scheduledSessions.find(s => s.callNumber === call.callNumber)
                    const isScheduled = !!scheduledSession
                    const isCompleted = scheduledSession?.completedAt
                    const isPast = scheduledSession?.isPast || isCompleted

                    return (
                    <div
                      key={call.callNumber}
                        className={`border rounded-xl p-6 hover:shadow-md transition-shadow ${
                          isScheduled 
                            ? isPast 
                              ? 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
                              : 'border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              isScheduled
                                ? isPast
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-blue-600 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                            {call.callNumber}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">
                              Mentor Call - {call.callNumber}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {call.title}
                            </p>
                          </div>
                        </div>
                          {isScheduled && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isCompleted
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : isPast
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {isCompleted ? 'Completed' : isPast ? 'Past' : 'Scheduled'}
                            </span>
                          )}
                      </div>

                        {/* Scheduled Information */}
                        {isScheduled && scheduledSession && (
                          <div className="mb-4 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium">
                                {new Date(scheduledSession.scheduledAt).toLocaleString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {scheduledSession.googleMeetLink && (
                              <a
                                href={scheduledSession.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        )}

                      <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isCompleted ? 'Session Summary:' : isScheduled ? 'Preparation Notes:' : 'Session Notes:'}
                          </label>
                          <div>
                            {call.notes ? (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {call.notes}
                                </p>
                                {call.updatedAt && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Last updated: {new Date(call.updatedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-sm">
                                  {isCompleted 
                                    ? "No summary added yet. Add notes about what was discussed in this call."
                                    : isScheduled 
                                    ? "No preparation notes yet. Add what the candidate should prepare or discuss."
                                    : "No notes yet. Add what the candidate needs to do or prepare for this call."}
                              </p>
                            )}
                            <button
                              onClick={() => {
                                setEditingCallNumber(call.callNumber)
                                setNoteText(call.notes || '')
                                setNotesModalOpen(true)
                              }}
                              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                            >
                              <FileText className="w-4 h-4" />
                              {call.notes ? 'Edit Notes' : 'Add Notes'}
                            </button>
                          </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Scheduled Mentoring Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Scheduled Sessions
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
                  No sessions scheduled yet. Admin will coordinate and schedule the call. You will also get the meeting link over here
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
            <button
                            onClick={() => setDeleteSessionModal({ userId: session.userId, callNumber: session.callNumber })}
                            className={`text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ${
                              isPast ? 'opacity-50' : ''
                            }`}
                            title="Delete session"
                          >
                            <Trash2 className={`${isPast ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>
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
                No jobs found {timeFilter !== 'all' ? `in the selected time period` : ''}
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
        {showScheduleForm && (
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

        {/* Notes Editing Modal */}
        {notesModalOpen && editingCallNumber && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    {(() => {
                      const scheduledSession = scheduledSessions.find(s => s.callNumber === editingCallNumber)
                      const isCompleted = scheduledSession?.completedAt
                      const isScheduled = !!scheduledSession
                      return isCompleted ? 'Session Summary' : isScheduled ? 'Preparation Notes' : 'Session Notes'
                    })()}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Mentor Call - {editingCallNumber}
                  </p>
                </div>
                  <button
                    onClick={() => {
                    setNotesModalOpen(false)
                    setEditingCallNumber(null)
                    setNoteText('')
                    }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

              {/* Formatting Hints */}
              <div className="px-6 pt-4 pb-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <List className="w-3 h-3" />
                    <span>Type "- " to create ➤ bullet points</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Press Enter after ➤ to continue bullet list</span>
                  </div>
                </div>
                  </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <textarea
                  ref={notesTextareaRef}
                  value={noteText}
                  onChange={handleNotesChange}
                  onKeyDown={handleNotesKeyDown}
                  className="w-full min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed resize-none"
                  placeholder={
                    (() => {
                      const scheduledSession = scheduledSessions.find(s => s.callNumber === editingCallNumber)
                      const isCompleted = scheduledSession?.completedAt
                      const isScheduled = !!scheduledSession
                      return isCompleted 
                        ? "Add what was discussed in this call, key takeaways, action items...\n\nExample:\n➤ Discussed resume improvements\n➤ Reviewed job application strategy\n➤ Action items: Update LinkedIn profile" 
                        : isScheduled 
                        ? "Add what the candidate should prepare or discuss in this call...\n\nExample:\n➤ Review portfolio projects\n➤ Prepare questions about company culture\n➤ Bring updated resume" 
                        : "Add notes about what the candidate needs to do or prepare for this call...\n\nExample:\n➤ Complete resume finalization\n➤ Research target companies\n➤ Prepare application materials"
                    })()
                  }
                  autoFocus
                    />
                  </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                    setNotesModalOpen(false)
                    setEditingCallNumber(null)
                    setNoteText('')
                      }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  <button
                  onClick={() => saveSessionNote(editingCallNumber, noteText)}
                  disabled={savingNote}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                  <Save className="w-4 h-4" />
                  {savingNote ? 'Saving...' : 'Save Notes'}
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

