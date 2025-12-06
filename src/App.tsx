import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'

// User pages
import SignIn from '@/user/pages/SignIn'
import SignUp from '@/user/pages/SignUp'
import Dashboard from '@/user/pages/Dashboard'
import Progress from '@/user/pages/Progress'
import ResumeReview from '@/user/pages/ResumeReview'
import ResumeRebuild from '@/user/pages/ResumeRebuild'
import PortfolioTemplates from '@/user/pages/PortfolioTemplates'
import AIAssistant from '@/user/pages/AIAssistant'
import MockInterview from '@/user/pages/MockInterview'
import CheatSheetPrep from '@/user/pages/CheatSheetPrep'
import APIKeys from '@/user/pages/APIKeys'
import AppliedJobs from '@/user/pages/AppliedJobs'
import MyMentor from '@/user/pages/MyMentor'

// Admin pages
import AdminLogin from '@/admin/pages/AdminLogin'
import AdminSignup from '@/admin/pages/AdminSignup'
import AdminDashboard from '@/admin/pages/AdminDashboard'
import AdminUserDetail from '@/admin/pages/AdminUserDetail'

// Route guards
import ProtectedAdminRoute from '@/admin/components/ProtectedAdminRoute'
import PublicAdminRoute from '@/admin/components/PublicAdminRoute'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Admin Routes - Must come before catch-all */}
          <Route
            path="/admin"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />
          <Route
            path="/admin/signup"
            element={
              <PublicAdminRoute>
                <AdminSignup />
              </PublicAdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedAdminRoute>
                <AdminUserDetail />
              </ProtectedAdminRoute>
            }
          />

          {/* Mentor Routes - Duplicate of admin routes */}
          <Route
            path="/mentor"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />
          <Route
            path="/mentor/signup"
            element={
              <PublicAdminRoute>
                <AdminSignup />
              </PublicAdminRoute>
            }
          />
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/mentor/users/:id"
            element={
              <ProtectedAdminRoute>
                <AdminUserDetail />
              </ProtectedAdminRoute>
            }
          />

          {/* User Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/resume-review" element={<ResumeReview />} />
          <Route path="/api-keys" element={<APIKeys />} />
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route path="/resume-rebuild" element={<ResumeRebuild />} />
          <Route path="/portfolio-templates" element={<PortfolioTemplates />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/cheat-sheet-prep" element={<CheatSheetPrep />} />
          <Route path="/mock-interviews" element={<MockInterview />} />
          <Route path="/my-mentor" element={<MyMentor />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
