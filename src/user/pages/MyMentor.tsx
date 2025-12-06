import { useState, useEffect } from 'react'
import Navbar from '@/shared/components/Navbar'
import Protected from '@/shared/components/Protected'
import UserProgress from '@/user/components/UserProgress'
import { UserCircle, Clock, Briefcase, Video, ExternalLink } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Mentor {
  id: string
  name: string
  email: string
  picture: string | null
  company: string | null
  role: string | null
  expertise: string | null
  background: string | null
  availability: string | null
}

interface ScheduledCall {
  callNumber: number
  scheduledAt: string
  googleMeetLink: string | null
}

// Helper function to get preset description for each call (user perspective)
const getCallDescription = (callNumber: number, mentorName: string | null) => {
  const mentorDisplayName = mentorName || 'your mentor'
  
  const descriptions: Record<number, string> = {
    1: `You've finished your orientation and resume rebuilding, so this call with ${mentorDisplayName} will be around reviewing your rebuilt resume and establishing your career path.`,
    2: `You've finished your resume rebuild and portfolio, so this call with ${mentorDisplayName} will be around reviewing your portfolio and strategizing next steps.`,
    3: `You've completed your tech distribution, so this call with ${mentorDisplayName} will be around discussing your technical stack and preparing for technical interviews.`,
    4: `You've applied to jobs and completed interview preparation, so this call with ${mentorDisplayName} will be around reviewing your application strategy and interview experiences.`,
    5: `You've completed your final review, so this call with ${mentorDisplayName} will be a comprehensive wrap-up and celebration of your progress.`,
  }
  
  return descriptions[callNumber] || `This is your call ${callNumber} with ${mentorDisplayName}.`
}

export default function MyMentor() {
  const [assignedMentor, setAssignedMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([])

  // Static list of mentor images from /mentors folder
  const mentorImages = [
    '/mentors/Frame 2121453442.png',
    '/mentors/Frame 2121453443.png',
    '/mentors/Frame 2121453444.png',
    '/mentors/Frame 2121453445.png',
    '/mentors/Frame 2121453446.png',
    '/mentors/Frame 2121453447.png',
    '/mentors/Frame 2121453448.png',
    '/mentors/Frame 2121453449.png',
    '/mentors/Frame 2121453450.png',
    '/mentors/Frame 2121453451.png',
    '/mentors/Frame 2121453452.png',
    '/mentors/Frame 2121453453.png',
  ]

  useEffect(() => {
    // Wait for auth state to be ready before loading data
    // Protected component ensures user is authenticated, but we need to wait for auth.currentUser
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('✅ Auth ready, user authenticated:', user.email)
        await loadData(user)
      } else {
        console.log('⚠️ No user authenticated - Protected should have redirected')
        setLoading(false)
        setError('Not authenticated. Please sign in.')
      }
    })

    return () => unsubscribe()
  }, [])

  const loadData = async (user?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentUser = user || auth.currentUser
      if (!currentUser) {
        console.error('❌ No authenticated user found')
        setError('Not authenticated. Please sign in.')
        setLoading(false)
        return
      }

      console.log('🔐 Getting Firebase token for user:', currentUser.email)
      const token = await currentUser.getIdToken()
      console.log('✅ Token obtained, length:', token.length)

      // Load user status to get scheduled calls
      try {
        const statusRes = await fetch(`${API_URL}/api/users/me/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          const status = statusData.userStatus
          const calls: ScheduledCall[] = []
          
          // Check each call (1-5)
          for (let i = 1; i <= 5; i++) {
            const scheduledAtField = `${
              i === 1 ? 'first' : i === 2 ? 'second' : i === 3 ? 'third' : i === 4 ? 'fourth' : 'fifth'
            }MentorCallScheduledAt`
            const googleMeetField = `${
              i === 1 ? 'first' : i === 2 ? 'second' : i === 3 ? 'third' : i === 4 ? 'fourth' : 'fifth'
            }MentorCallGoogleMeetLink`
            const completedAtField = `${
              i === 1 ? 'first' : i === 2 ? 'second' : i === 3 ? 'third' : i === 4 ? 'fourth' : 'fifth'
            }MentorCallCompletedAt`
            
            if (status[scheduledAtField] && !status[completedAtField]) {
              calls.push({
                callNumber: i,
                scheduledAt: status[scheduledAtField],
                googleMeetLink: status[googleMeetField],
              })
            }
          }
          
          // Sort by scheduled date
          calls.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          setScheduledCalls(calls)
        }
      } catch (err) {
        console.error('Error loading scheduled calls:', err)
      }

      // Load assigned mentor first
      let mentor: Mentor | null = null
      try {
        console.log('🔍 Loading assigned mentor...')
        const mentorRes = await fetch(`${API_URL}/api/users/me/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

        if (mentorRes.ok) {
          const mentorData = await mentorRes.json()
          mentor = mentorData.mentor
          console.log('✅ Assigned mentor loaded:', mentor?.name)
          setAssignedMentor(mentor)
        } else if (mentorRes.status === 404) {
          console.log('⚠️ No mentor assigned to this user')
          setAssignedMentor(null)
      } else if (mentorRes.status === 401) {
        console.error('❌ Authentication failed - token invalid or expired')
        setError('Authentication failed. Please sign out and sign in again.')
          setLoading(false)
          return
      } else {
        const errorData = await mentorRes.json().catch(() => ({}))
        console.error('❌ Failed to load assigned mentor:', mentorRes.status, errorData)
        // Don't throw here, just log - user might not have a mentor assigned
        }
      } catch (err: any) {
        console.error('❌ Error loading assigned mentor:', err)
        // Don't set error here, just log it - user might not have a mentor assigned
      }
    } catch (err: any) {
      console.error('❌ Error loading data:', err)
      setError(err.message || 'Failed to load mentor information')
    } finally {
      setLoading(false)
    }
  }

  // Get mentor image URL for assigned mentor - Cloudinary or fallback
  const getAssignedMentorImage = (mentor: Mentor) => {
    // If mentor has a picture URL (from Cloudinary), use it
    if (mentor.picture && mentor.picture.startsWith('http')) {
      return mentor.picture
    }
    // Fallback to first mentor image
    return '/mentors/Frame 2121453442.png'
  }

  if (loading) {
    return (
      <Protected>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Protected>
    )
  }

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Navbar />

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">

            {/* Error Message */}
            {error && (
              <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Assigned Mentor Card */}
            {assignedMentor ? (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                  Your Assigned Mentor
                </h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Mentor Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-700 border-4 border-gray-200 dark:border-gray-600 shadow-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={getAssignedMentorImage(assignedMentor)}
                          alt={assignedMentor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/mentors/Frame 2121453442.png'
                          }}
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{assignedMentor.name}</h2>
                        {assignedMentor.role && assignedMentor.company && (
                          <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
                            {assignedMentor.role} at {assignedMentor.company}
                          </p>
                      )}
                        {assignedMentor.expertise && (
                          <p className="text-blue-600 dark:text-blue-400 text-base font-medium">{assignedMentor.expertise}</p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Mentor Details */}
                <div className="p-8 space-y-6">
                    {assignedMentor.background && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          Professional Background
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {assignedMentor.background}
                      </p>
                    </div>
                  )}

                    {assignedMentor.availability && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          Availability
                        </h3>
                      </div>
                        <p className="text-gray-600 dark:text-gray-300">{assignedMentor.availability}</p>
                    </div>
                  )}

                  </div>
                        </div>
                      </div>
            ) : (
              <div className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Mentor Assigned
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You don't have a mentor assigned yet. An admin will assign one to you soon.
                </p>
              </div>
            )}

            {/* Scheduled Calls - Sticky and Prominent */}
            {scheduledCalls.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                  Your Upcoming Mentor Calls
                </h2>
                <div className="space-y-4">
                  {scheduledCalls.map((call) => {
                    const isUpcoming = new Date(call.scheduledAt) > new Date()
                    return (
                      <div
                        key={call.callNumber}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl border border-blue-500 p-6 sticky top-4 z-10"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Video className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-white">
                                Mentor Call {call.callNumber} Scheduled
                              </h3>
                              {isUpcoming && (
                                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            <p className="text-blue-100 flex items-center gap-2 mb-3 text-lg">
                              <Clock className="w-5 h-5" />
                              {new Date(call.scheduledAt).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-blue-50 text-sm leading-relaxed mb-4">
                              {getCallDescription(call.callNumber, assignedMentor?.name || null)}
                            </p>
                            {call.googleMeetLink && (
                              <a
                                href={call.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                              >
                                <ExternalLink className="w-5 h-5" />
                                Join Google Meet
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* User Progress - Shows Next Available Call */}
            <div className="mb-12">
              <UserProgress scheduledCalls={scheduledCalls} />
            </div>

            {/* Other Mentors Section - Static Images */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12 text-center">
                Other Mentors at Mentorque
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                {mentorImages.map((imagePath, index) => (
                  <div
                    key={index}
                    className="group relative bg-white dark:bg-gradient-to-br dark:from-white/98 dark:via-gray-50/95 dark:to-white/98 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-200/30"
                  >
                    <div className="aspect-[3/4] flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white dark:from-white/98 dark:via-gray-50/98 dark:to-white/98">
                      <img
                        src={imagePath}
                        alt={`Mentor ${index + 1}`}
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/mentors/Frame 2121453442.png' // Fallback
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Protected>
  )
}
