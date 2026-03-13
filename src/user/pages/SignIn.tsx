import { useState, useEffect } from "react"
import { signInWithGoogle } from "@/lib/auth"
import { auth } from "@/lib/firebase"
import { getWildcardToken } from "@/lib/wildcardAuth"

export default function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        window.location.href = "/dashboard"
        return
      }
      if (getWildcardToken()) window.location.href = "/dashboard"
    })
    return () => unsub()
  }, [])

  async function handleGoogle() {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGoogle()
      window.location.href = "/dashboard"
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-black">
      <div className="w-full relative max-w-7xl overflow-hidden flex flex-col md:flex-row shadow-xl">
        <div className="w-full h-full z-[2] absolute bg-gradient-to-t from-transparent to-black"></div>
        <div className="flex absolute z-[2] overflow-hidden backdrop-blur-2xl">
          <div className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
          <div className="h-[40rem] z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
        </div>
        <div className="w-[15rem] h-[15rem] bg-blue-500 absolute z-[1] rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-[1] rounded-full bottom-0"></div>
        <div className="w-[8rem] h-[5rem] bg-white absolute z-[1] rounded-full bottom-0"></div>

        <div className="bg-black text-white p-10 md:p-16 md:w-1/2 relative rounded-bl-3xl overflow-hidden">
          <h1 className="text-3xl md:text-4xl font-medium leading-tight z-10 tracking-tight relative">
            Everything you need to land interviews faster.
          </h1>
          <p className="text-gray-400 mt-6 text-lg z-10 relative">
            Mock interviews, resume review, progress tracking—all in one place.
          </p>
        </div>

        <div className="p-10 md:p-16 md:w-1/2 flex flex-col bg-secondary z-[99] text-secondary-foreground">
          <div className="flex flex-col items-left mb-10">
            <div className="mb-6">
              <img
                src="/mentorque-logo.png"
                alt="Mentorque Logo"
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-4xl font-medium mb-3 tracking-tight">
              Get started
            </h2>
            <p className="text-left opacity-80 text-lg">
              Welcome to Mentorque. Continue with Google—no password needed.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3.5 bg-white text-gray-800 font-semibold py-4 px-6 rounded-xl border border-gray-200/80 shadow-md hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-400/80 focus:ring-offset-2 transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              {isLoading ? (
                <div className="w-7 h-7 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin shrink-0" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200/80 group-hover:ring-blue-100">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </span>
              )}
              <span className="relative tracking-tight">{isLoading ? "Getting started..." : "Get started with Google"}</span>
            </button>

            {error && (
              <p id="google-error" className="text-red-500 text-xs mt-1" role="alert">
                {error}
              </p>
            )}

            <div className="text-center text-base">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-blue-500 font-medium underline hover:text-blue-600"
              >
                Sign up here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
