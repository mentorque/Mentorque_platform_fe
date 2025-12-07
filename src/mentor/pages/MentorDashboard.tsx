import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, X, AlertCircle, UserCircle, Video } from 'lucide-react'
import { StatsCardSkeleton, UserCardSkeleton } from '@/shared/ui/Skeleton'
import MentorNavbar, { MentorNavbarRef } from '@/mentor/components/MentorNavbar'
import MentorProfile from '@/mentor/components/MentorProfile'
import MentoringSessions from '@/mentor/pages/MentoringSessions'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface User {
  id: string
  email: string
  fullName: string | null
  goalPerDay: number
  createdAt: string
  verifiedByAdmin: boolean
}

interface MentorStats {
  totalUsers: number
  totalAppliedJobs: number
}

export default function MentorDashboard() {
  const navigate = useNavigate()
  const navbarRef = useRef<MentorNavbarRef>(null)
  const [mentorInfo, setMentorInfo] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<MentorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'sessions'>('users')
  const [usersSearch, setUsersSearch] = useState('')

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!mentorInfo) return 0
    
    const fields = [
      mentorInfo.name,
      mentorInfo.picture,
      mentorInfo.company,
      mentorInfo.role,
      mentorInfo.expertise,
      mentorInfo.background,
      mentorInfo.availability,
    ]
    const filledFields = fields.filter((field) => field && field.trim().length > 0).length
    return Math.round((filledFields / fields.length) * 100)
  }, [mentorInfo])

  const isProfileComplete = profileCompletion === 100

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/me`, {
        credentials: 'include',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        setMentorInfo(data.adminMentor)
        localStorage.setItem('mentorInfo', JSON.stringify(data.adminMentor))
        
        await Promise.all([
          loadUsers(),
          loadStats()
        ])
      } else {
        navigate('/mentor', { replace: true })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      navigate('/mentor', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/mentor/users`, {
        credentials: 'include',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      const token = localStorage.getItem('mentorToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_URL}/api/mentor/stats`, {
        credentials: 'include',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem('mentorToken')
      
      await fetch(`${API_URL}/api/mentor/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('mentorInfo')
      navigate('/mentor', { replace: true })
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(usersSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <MentorNavbar
        ref={navbarRef}
        mentorName={mentorInfo?.name || mentorInfo?.email}
        onLogout={handleLogout}
        mentorInfo={mentorInfo}
        onProfileUpdate={checkAuthAndLoadData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        {!isProfileComplete && mentorInfo && (
          <div
            onClick={() => navbarRef.current?.openProfileModal()}
            className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Complete Your Profile
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Your profile is {profileCompletion}% complete. Click here to finish setting up your profile.
                </p>
              </div>
              <div className="flex-shrink-0">
                <UserCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {loadingStats ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      My Mentees
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Total Applications
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {stats?.totalAppliedJobs || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              My Mentees ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'sessions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Video className="w-4 h-4" />
              Mentoring Sessions
            </button>
          </div>
          <div>
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mentees..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    {usersSearch && (
                      <button
                        onClick={() => setUsersSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Users List */}
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                        No mentees found
                      </h3>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => navigate(`/mentor/users/${user.id}`)}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {user.fullName || 'No Name'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.verifiedByAdmin
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {user.verifiedByAdmin ? 'Verified' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <MentoringSessions />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

