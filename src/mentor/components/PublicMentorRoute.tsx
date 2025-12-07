import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface PublicMentorRouteProps {
  children: React.ReactNode
}

/**
 * Public route component for mentor login
 * Redirects to /mentor/dashboard if already authenticated
 */
export default function PublicMentorRoute({ children }: PublicMentorRouteProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
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
        // Already authenticated, redirect to dashboard
        const data = await res.json()
        const mentorInfo = data.adminMentor
        localStorage.setItem('mentorInfo', JSON.stringify(mentorInfo))
        navigate('/mentor/dashboard', { replace: true })
      } else {
        // Not authenticated, show login page
        setIsChecking(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsChecking(false)
    }
  }

  if (isChecking) {
    // Still checking authentication
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

