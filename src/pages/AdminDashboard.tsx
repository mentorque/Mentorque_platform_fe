import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Briefcase, UserCheck } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'
import { StatsCardSkeleton, UserCardSkeleton } from '@/components/ui/Skeleton'
import AdminNavbar from '@/components/AdminNavbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface User {
  id: string
  email: string
  fullName: string | null
  goalPerDay: number
  createdAt: string
  mentorId: string | null
  mentor?: {
    id: string
    name: string
    email: string
  }
  AppliedJob?: Array<{
    id: string
    title: string
    company: string | null
    status: string
    appliedDate: string
  }>
}

interface Mentor {
  id: string
  email: string
  name: string
  picture: string | null
  expertise: string | null
  background: string | null
  availability: string | null
  _count: {
    users: number
  }
}

interface AdminStats {
  totalUsers: number
  totalMentors: number
  totalAppliedJobs: number
}


export default function AdminDashboard() {
  const navigate = useNavigate()
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'mentors'>('users')

  // Pagination state
  const [usersPage, setUsersPage] = useState(1)
  const [usersPagination, setUsersPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    limit: 10,
  })

  const [mentorsPage, setMentorsPage] = useState(1)
  const [mentorsPagination, setMentorsPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    limit: 10,
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    if (adminInfo) {
      loadUsers(usersPage)
      if (adminInfo.isAdmin) {
        loadMentors(mentorsPage)
      }
    }
  }, [usersPage, mentorsPage, adminInfo])

  const checkAuthAndLoadData = async () => {
    try {
      const meRes = await fetch(`${API_URL}/api/admin/me`, {
        credentials: 'include',
      })

      if (!meRes.ok) {
        navigate('/admin', { replace: true })
        return
      }

      const meData = await meRes.json()
      const parsedAdminInfo = meData.adminMentor
      setAdminInfo(parsedAdminInfo)
      localStorage.setItem('adminInfo', JSON.stringify(parsedAdminInfo))

      // Load stats and initial data
      await Promise.all([loadStats(parsedAdminInfo), loadUsers(1, parsedAdminInfo)])
      
      if (parsedAdminInfo.isAdmin) {
        await loadMentors(1, parsedAdminInfo)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      navigate('/admin')
    } finally {
      setLoading(false)
      setLoadingStats(false)
    }
  }

  const loadStats = async (adminInfoOverride?: any) => {
    const currentAdminInfo = adminInfoOverride || adminInfo
    if (!currentAdminInfo?.isAdmin) {
      setLoadingStats(false)
      return
    }

    try {
      setLoadingStats(true)
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        credentials: 'include',
      })

      if (res.ok) {
        const statsData = await res.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadUsers = async (page: number = 1, adminInfoOverride?: any) => {
    const currentAdminInfo = adminInfoOverride || adminInfo
    if (!currentAdminInfo) return

    try {
      setLoading(true)
      const endpoint = currentAdminInfo.isAdmin
        ? `/api/admin/all-users?page=${page}&limit=10`
        : `/api/admin/mentor/users?page=${page}&limit=10`

      const res = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        if (data.pagination) {
          setUsersPagination({
            totalCount: data.pagination.totalCount || 0,
            totalPages: data.pagination.totalPages || 0,
            limit: data.pagination.limit || 10,
          })
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMentors = async (page: number = 1, adminInfoOverride?: any) => {
    const currentAdminInfo = adminInfoOverride || adminInfo
    if (!currentAdminInfo?.isAdmin) return

    try {
      const res = await fetch(`${API_URL}/api/admin/mentors?page=${page}&limit=10`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setMentors(data.mentors || [])
        if (data.pagination) {
          setMentorsPagination({
            totalCount: data.pagination.totalCount || 0,
            totalPages: data.pagination.totalPages || 0,
            limit: data.pagination.limit || 10,
          })
        }
      }
    } catch (error) {
      console.error('Error loading mentors:', error)
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

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`)
  }

  if (loading && !adminInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!adminInfo) return null

  const breadcrumbs =
    activeTab === 'users'
      ? [{ label: 'Dashboard' }, { label: 'Users' }]
      : [{ label: 'Dashboard' }, { label: 'Mentors' }]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <AdminNavbar
        adminName={adminInfo.name}
        onLogout={handleLogout}
        breadcrumbs={adminInfo.isAdmin ? breadcrumbs : [{ label: 'Dashboard' }]}
        isAdmin={adminInfo.isAdmin}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loadingStats ? (
            <>
              <StatsCardSkeleton />
              {adminInfo.isAdmin && <StatsCardSkeleton />}
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.totalUsers ?? users.length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {adminInfo.isAdmin && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Mentors</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stats?.totalMentors ?? mentors.length}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.totalAppliedJobs ??
                        users.reduce((sum, user) => sum + (user.AppliedJob?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        {adminInfo.isAdmin && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'mentors'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Mentors
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'users' || !adminInfo.isAdmin ? (
          <UsersList
            users={users}
            loading={loading}
            onViewUser={handleViewUser}
            currentPage={usersPage}
            totalPages={usersPagination.totalPages}
            totalItems={usersPagination.totalCount}
            onPageChange={setUsersPage}
            itemsPerPage={usersPagination.limit}
          />
        ) : (
          <MentorsList
            mentors={mentors}
            loading={loading}
            currentPage={mentorsPage}
            totalPages={mentorsPagination.totalPages}
            totalItems={mentorsPagination.totalCount}
            onPageChange={setMentorsPage}
            itemsPerPage={mentorsPagination.limit}
          />
        )}
      </div>
    </div>
  )
}

// Users List Component
function UsersList({
  users,
  loading,
  onViewUser,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
}: {
  users: User[]
  loading: boolean
  onViewUser: (id: string) => void
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  itemsPerPage: number
}) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + users.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Users</h2>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No users found</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => onViewUser(user.id)}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {user.fullName || user.email}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      {user.mentor && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Mentor: {user.mentor.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Mentors List Component
function MentorsList({
  mentors,
  loading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage,
}: {
  mentors: Mentor[]
  loading: boolean
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  itemsPerPage: number
}) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + mentors.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Mentors</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">
                  No mentors found
                </p>
              ) : (
                mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {mentor.picture ? (
                        <img
                          src={mentor.picture}
                          alt={mentor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                          ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'][
                            mentor.name.charCodeAt(0) % 8
                          ]
                        }`}>
                          {mentor.name.split(' ').length >= 2 
                            ? mentor.name.split(' ')[0][0].toUpperCase() + mentor.name.split(' ').slice(-1)[0][0].toUpperCase()
                            : mentor.name.substring(0, 2).toUpperCase()
                          }
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{mentor.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.email}</p>
                      </div>
                    </div>
                    {mentor.expertise && (
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                        {mentor.expertise}
                      </p>
                    )}
                    {mentor.background && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {mentor.background}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mentor._count.users} user{mentor._count.users !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}


















