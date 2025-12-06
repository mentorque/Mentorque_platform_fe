import { useEffect, useState } from "react"
import { listenToAuth } from "@/lib/auth"

export default function Protected({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stop = listenToAuth((u) => {
      if (u) {
        console.log("✅ Auth state changed: User authenticated", u.email);
      setUser(u)
      setReady(true)
      } else {
        console.log("❌ Auth state changed: No user found, redirecting to sign-in");
        setUser(null)
        setReady(true)
        // Small delay to avoid race conditions
        setTimeout(() => {
        window.location.href = "/signin"
        }, 100)
        return
      }
    })
    return stop
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}


