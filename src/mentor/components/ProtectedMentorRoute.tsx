import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ProtectedMentorRouteProps {
  children: React.ReactNode
}

/**
 * Protected route component for mentor routes
 * Redirects to /mentor if not authenticated
 */
export default function ProtectedMentorRoute({ children }: ProtectedMentorRouteProps) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | 'unverified' | 'isAdmin' | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Get token from localStorage for Authorization header
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
        const mentorInfo = data.adminMentor
        localStorage.setItem('mentorInfo', JSON.stringify(mentorInfo))
        
        // Check if user is an admin (not a mentor)
        if (mentorInfo.isAdmin) {
          setIsAuthenticated('isAdmin')
          return
        }
        
        // Check if mentor is verified
        if (!mentorInfo.verifiedByAdmin) {
          setIsAuthenticated('unverified')
          return
        }
        
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        navigate('/mentor', { replace: true })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      navigate('/mentor', { replace: true })
    }
  }

  if (isAuthenticated === null) {
    // Still checking authentication
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  if (isAuthenticated === 'isAdmin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            You are an Admin
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You're logged in as an administrator. Please use the Admin Dashboard instead of the Mentor Dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                localStorage.removeItem('mentorToken')
                localStorage.removeItem('mentorInfo')
                navigate('/mentor', { replace: true })
              }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => {
                // Clear mentor tokens and redirect to admin
                localStorage.removeItem('mentorToken')
                localStorage.removeItem('mentorInfo')
                navigate('/admin/dashboard', { replace: true })
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated === 'unverified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Admin Approval Needed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your mentor account is pending admin approval. Please contact the administrator and come back once you've been approved.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={async () => {
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
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('mentorToken')
                localStorage.removeItem('mentorInfo')
                navigate('/mentor', { replace: true })
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

