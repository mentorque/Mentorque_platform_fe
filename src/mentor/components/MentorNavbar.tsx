import { useState, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, UserCircle, ChevronRight, X } from 'lucide-react'
import MentorProfile from './MentorProfile'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface MentorNavbarProps {
  mentorName: string
  onLogout: () => void
  breadcrumbs?: BreadcrumbItem[]
  mentorInfo?: any
  onProfileUpdate?: () => void
}

export interface MentorNavbarRef {
  openProfileModal: () => void
}

const MentorNavbar = forwardRef<MentorNavbarRef, MentorNavbarProps>(({ mentorName, onLogout, breadcrumbs, mentorInfo, onProfileUpdate }, ref) => {
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null)

  useImperativeHandle(ref, () => ({
    openProfileModal: () => setShowProfileModal(true)
  }))

  return (
    <>
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate('/mentor/dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/mentorque-logo.png"
                alt="Mentorque Logo"
                className="h-8 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Mentor Dashboard
              </span>
            </button>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-4">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4" />}
                    {crumb.path ? (
                      <button
                        onClick={() => navigate(crumb.path!)}
                        className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side - User info and Logout */}
          <div className="flex items-center gap-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
              <UserCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{mentorName}</span>
              </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && mentorInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <MentorProfile
                adminInfo={mentorInfo}
                onUpdate={() => {
                  if (onProfileUpdate) onProfileUpdate()
                  setShowProfileModal(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
})

MentorNavbar.displayName = 'MentorNavbar'

export default MentorNavbar

