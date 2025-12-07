import { useNavigate } from 'react-router-dom'
import { LogOut, UserCircle, ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface AdminNavbarProps {
  adminName: string
  onLogout: () => void
  breadcrumbs?: BreadcrumbItem[]
  isAdmin?: boolean
}

export default function AdminNavbar({ adminName, onLogout, breadcrumbs, isAdmin = true }: AdminNavbarProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/mentorque-logo.png"
                alt="Mentorque Logo"
                className="h-8 w-auto"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isAdmin ? 'Admin Dashboard' : 'Mentor Dashboard'}
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
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{adminName}</span>
            </div>
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
  )
}

