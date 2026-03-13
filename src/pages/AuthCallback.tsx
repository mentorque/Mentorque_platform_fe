import { useEffect, useState } from 'react'
import { setWildcardAuth } from '@/lib/wildcardAuth'

/**
 * Page reached after backend redirect from wildcard login.
 * Reads #token= and #email= from hash, stores them, then redirects to /dashboard.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')

    if (!token) {
      setStatus('error')
      setMessage('Missing token in URL. Use backend wildcard login with ?redirect=1')
      return
    }

    setWildcardAuth(token, email || '', name ?? undefined)
    setStatus('done')
    setMessage('Logged in. Redirecting to dashboard...')
    window.location.replace('/dashboard')
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center max-w-md">
          <p className="text-red-400">{message}</p>
          <a href="/signin" className="mt-4 inline-block text-blue-400 hover:underline">
            Go to sign in
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p>{message}</p>
    </div>
  )
}
