/**
 * Helper function to get admin auth headers
 * Tries token from localStorage first, then relies on cookie
 */
export function getAdminAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Try to get token from localStorage (fallback for cross-origin)
  const token = localStorage.getItem('adminToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Helper function for authenticated admin API calls
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAdminAuthHeaders(),
    ...(options.headers || {}),
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Always include cookies
  })
}

