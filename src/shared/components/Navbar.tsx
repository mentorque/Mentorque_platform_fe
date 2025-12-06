import { logOut } from "@/lib/auth"
import ThemeToggle from "./ThemeToggle"
import { useState } from "react"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleWhatsAppCallBack = () => {
    const number = "918486242054"; // no '+' for wa.me
    const msg = "Hi Team, I want to schedule a call back.";
    const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <header className="sticky top-0 z-40 w-full pt-4">
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Glass container */}
        <div className="w-full rounded-2xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none">
          <div className="flex items-center justify-between px-6 py-4 min-h-[4rem]">
            {/* Logo and Brand */}
            <a href="/" className="flex items-center gap-3 font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-white/40 dark:bg-gray-800/60 backdrop-blur-sm border border-white/50 dark:border-gray-600/50 flex items-center justify-center shadow-lg">
                <img 
                  src="/mentorque-logo.png" 
                  alt="Mentorque Logo" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <span className="text-xl">Mentorque</span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-gray-800 dark:text-gray-200 font-medium">
              <a className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 drop-shadow-sm" href="/">Home</a>
              <a className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 drop-shadow-sm" href="/progress">Progress</a>
              <a className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 drop-shadow-sm" href="/applied-jobs">Applied Jobs</a>
              <a className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 drop-shadow-sm" href="/my-mentor">My Mentor</a>
              <a className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 drop-shadow-sm" href="/api-keys">API Keys</a>
            </nav>

            {/* Desktop CTA Button and Controls */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={handleWhatsAppCallBack}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Request a Call Back
              </button>
              
              <ThemeToggle />
              
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={() => logOut().then(() => (window.location.href = "/signin"))}
              >
                Sign out
              </button>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 text-gray-800 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
            <div className="border-t border-white/20 dark:border-gray-700/20 mt-4 pt-4 pb-4">
              <nav className="flex flex-col gap-4 px-6">
                {/* Navigation Links */}
                <div className="flex flex-col gap-2">
                  <a 
                    className="text-gray-800 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/20 text-base" 
                    href="/"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </a>
                  <a 
                    className="text-gray-800 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/20 text-base" 
                    href="/progress"
                    onClick={closeMobileMenu}
                  >
                    Progress
                  </a>
                  <a 
                    className="text-gray-800 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/20 text-base" 
                    href="/applied-jobs"
                    onClick={closeMobileMenu}
                  >
                    Applied Jobs
                  </a>
                  <a 
                    className="text-gray-800 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/20 text-base" 
                    href="/my-mentor"
                    onClick={closeMobileMenu}
                  >
                    My Mentor
                  </a>
                  <a 
                    className="text-gray-800 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/20 text-base" 
                    href="/api-keys"
                    onClick={closeMobileMenu}
                  >
                    API Keys
                  </a>
                </div>

                {/* Mobile Action Buttons - Matching Desktop Layout */}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
                  <button 
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                    onClick={() => {
                      closeMobileMenu();
                      handleWhatsAppCallBack();
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Request a Call Back
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                      onClick={() => logOut().then(() => (window.location.href = "/signin"))}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


