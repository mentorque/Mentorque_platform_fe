import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface PublicAdminRouteProps {
  children: React.ReactNode
}

/**
 * Public route component for admin login
 * Redirects to /admin/dashboard if already authenticated
 */
export default function PublicAdminRoute({ children }: PublicAdminRouteProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/me`, {
        credentials: 'include',
      })

      if (res.ok) {
        // Already authenticated, redirect to dashboard
        const data = await res.json()
        const adminInfo = data.adminMentor
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
        navigate('/admin/dashboard', { replace: true })
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

