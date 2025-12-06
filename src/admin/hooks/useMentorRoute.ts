import { useLocation } from 'react-router-dom'

/**
 * Hook to detect if we're on a mentor route and return the appropriate API prefix
 */
export function useMentorRoute() {
  const location = useLocation()
  const isMentorRoute = location.pathname.startsWith('/mentor')
  const apiPrefix = isMentorRoute ? '/api/mentor' : '/api/admin'
  const loginPath = isMentorRoute ? '/mentor' : '/admin'
  const dashboardPath = isMentorRoute ? '/mentor/dashboard' : '/admin/dashboard'
  
  return {
    isMentorRoute,
    apiPrefix,
    loginPath,
    dashboardPath,
  }
}

