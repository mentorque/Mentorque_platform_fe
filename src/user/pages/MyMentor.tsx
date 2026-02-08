import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/shared/components/Navbar'
import Protected from '@/shared/components/Protected'
import UserProgress from '@/user/components/UserProgress'
import { UserCircle, Clock, Briefcase, Video, ExternalLink, FileText } from 'lucide-react'
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

interface CallNotes {
  callNumber: number
  title: string
  notes: string
  updatedAt: string | null
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

const getDefaultCallNotes = (): CallNotes[] => ([
  {
    callNumber: 1,
    title: 'Resume Finalisation, Preparation Tips and Job Application Strategy',
    notes: '',
    updatedAt: null,
  },
  {
    callNumber: 2,
    title: 'Progress Review and Strategy Adjustment',
    notes: '',
    updatedAt: null,
  },
  {
    callNumber: 3,
    title: 'Mock Interview',
    notes: '',
    updatedAt: null,
  },
  {
    callNumber: 4,
    title: 'Mock Interview',
    notes: '',
    updatedAt: null,
  },
])

export default function MyMentor() {
  const [assignedMentor, setAssignedMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([])
  const [mentorNotes, setMentorNotes] = useState<CallNotes[]>(getDefaultCallNotes())
  const visibleMentorNotes = useMemo(
    () => mentorNotes.filter((note) => note.notes.trim().length > 0),
    [mentorNotes]
  )

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
      await loadMentorNotes(token)

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

  const loadMentorNotes = async (token?: string) => {
    if (!token) {
      setMentorNotes(getDefaultCallNotes())
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/users/me/mentor-session-notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setMentorNotes(data.calls?.length ? data.calls : getDefaultCallNotes())
      } else {
        setMentorNotes(getDefaultCallNotes())
      }
    } catch (error) {
      console.error('Error loading mentor notes:', error)
      setMentorNotes(getDefaultCallNotes())
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Generate consistent color from name
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (loading) {
    return (
      <Protected>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-700 border-t-blue-500"></div>
        </div>
      </Protected>
    )
  }

  return (
    <Protected>
      <div className="min-h-screen bg-black">
        <Navbar />

        <section className="py-6 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Assigned Mentor Card */}
            {assignedMentor ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Your Assigned Mentor
                </h2>
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-800">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                        {assignedMentor.picture ? (
                          <img
                            src={assignedMentor.picture}
                            alt={assignedMentor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${getColorFromName(assignedMentor.name)} text-white text-2xl font-bold`}>
                            {getInitials(assignedMentor.name)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-bold text-white mb-1">{assignedMentor.name}</h3>
                        {assignedMentor.role && assignedMentor.company && (
                          <p className="text-gray-400 text-sm mb-1">
                            {assignedMentor.role} at {assignedMentor.company}
                          </p>
                        )}
                        {assignedMentor.expertise && (
                          <p className="text-blue-400 text-sm font-medium">{assignedMentor.expertise}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {assignedMentor.background && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">
                            Professional Background
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {assignedMentor.background}
                        </p>
                      </div>
                    )}

                    {assignedMentor.availability && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">
                            Availability
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm">{assignedMentor.availability}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-gray-900 rounded-lg border border-gray-800 p-6 text-center">
                <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCircle className="w-7 h-7 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  No Mentor Assigned
                </h3>
                <p className="text-gray-400 text-sm">
                  You don&apos;t have a mentor assigned yet. An admin will assign one to you soon.
                </p>
              </div>
            )}

            {/* Scheduled Calls */}
            {scheduledCalls.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">
                  Your Upcoming Mentor Calls
                </h2>
                <div className="space-y-3">
                  {scheduledCalls.map((call) => {
                    const isUpcoming = new Date(call.scheduledAt) > new Date()
                    return (
                      <div
                        key={call.callNumber}
                        className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center shrink-0">
                            <Video className="w-6 h-6 text-blue-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-lg font-bold text-white">
                                Mentor Call {call.callNumber}
                              </h3>
                              {isUpcoming && (
                                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded text-xs font-medium">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm flex items-center gap-1.5 mb-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              {new Date(call.scheduledAt).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-gray-400 text-xs leading-relaxed mb-3">
                              {getCallDescription(call.callNumber, assignedMentor?.name || null)}
                            </p>
                            {call.googleMeetLink && (
                              <a
                                href={call.googleMeetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
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

            {/* Mentor Notes */}
            {visibleMentorNotes.length > 0 && (
              <div className="mb-6 space-y-2">
                <h2 className="text-lg font-semibold text-white">
                  Notes from Your Mentor
                </h2>
                <div className="grid gap-2">
                  {visibleMentorNotes.map((note) => (
                    <div
                      key={note.callNumber}
                      className="bg-gray-900 rounded-lg border border-gray-800 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs uppercase font-semibold text-gray-500">
                          Call {note.callNumber}
                        </p>
                        {note.updatedAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-white font-semibold mb-0.5">
                        {note.title}
                      </p>
                      <p className="text-gray-400 text-sm whitespace-pre-line">
                        {note.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Progress */}
            <div className="mb-6">
              <UserProgress scheduledCalls={scheduledCalls} />
            </div>

            {/* Meet Our Mentors Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Meet Our Expert Mentors
              </h2>
              <p className="text-gray-400 text-sm mb-4 max-w-xl">
                Industry professionals from top companies helping you succeed.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
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
                ].map((src, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-colors">
                    <img
                      src={src}
                      alt="Mentor"
                      className="w-full h-full object-contain p-1.5"
                    />
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
