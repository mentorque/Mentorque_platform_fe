import { Routes, Route } from 'react-router-dom'
import MentorLogin from '../pages/MentorLogin'
import MentorSignup from '../pages/MentorSignup'
import MentorDashboard from '../pages/MentorDashboard'
import MentorUserDetail from '../pages/MentorUserDetail'
import ProtectedMentorRoute from '../components/ProtectedMentorRoute'
import PublicMentorRoute from '../components/PublicMentorRoute'

export default function MentorRoutes() {
  return (
    <Routes>
      <Route
        path="/mentor"
        element={
          <PublicMentorRoute>
            <MentorLogin />
          </PublicMentorRoute>
        }
      />
      <Route
        path="/mentor/signup"
        element={
          <PublicMentorRoute>
            <MentorSignup />
          </PublicMentorRoute>
        }
      />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedMentorRoute>
            <MentorDashboard />
          </ProtectedMentorRoute>
        }
      />
      <Route
        path="/mentor/users/:id"
        element={
          <ProtectedMentorRoute>
            <MentorUserDetail />
          </ProtectedMentorRoute>
        }
      />
    </Routes>
  )
}

