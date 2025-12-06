import { useState, useEffect, useMemo, useCallback } from 'react'
import { Check, Flag, Rocket, FileText, Award, Zap, BookOpen, Target } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface UserStatus {
  id: string
  orientation: boolean
  resumeRebuilding: boolean
  eligibleForFirstMentorCall: boolean
  firstMentorCallCompletedAt: string | null
  resumeConfirmed: boolean
  portfolioBuildingAndConfirmed: boolean
  eligibleForSecondMentorCall: boolean
  secondMentorCallCompletedAt: string | null
  techDistributionAndExtension: boolean
  eligibleForThirdMentorCall: boolean
  thirdMentorCallCompletedAt: string | null
  cheatSheetBuiltOut: boolean
  hasAppliedEnoughJobs: boolean
  eligibleForFourthMentorCall: boolean
  fourthMentorCallCompletedAt: string | null
  finalReview: boolean
  eligibleForFifthMentorCall: boolean
  fifthMentorCallCompletedAt: string | null
}


interface ScheduledCall {
  callNumber: number
  scheduledAt: string
  googleMeetLink: string | null
}

interface UserProgressProps {
  scheduledCalls?: ScheduledCall[]
}

const MILESTONES = [
  { key: 'orientation', label: 'Orientation Complete', icon: Rocket },
  { key: 'resumeRebuilding', label: 'Resume Rebuilt', icon: FileText },
  { key: 'resumeConfirmed', label: 'Resume Confirmed', icon: Award },
  { key: 'portfolioBuildingAndConfirmed', label: 'Portfolio Ready', icon: Award },
  { key: 'techDistributionAndExtension', label: 'Tech Stack Defined', icon: Zap },
  { key: 'cheatSheetBuiltOut', label: 'Cheat Sheet Created', icon: BookOpen },
  { key: 'hasAppliedEnoughJobs', label: 'Jobs Applied', icon: Target },
] as const

export default function UserProgress({ scheduledCalls = [] }: UserProgressProps = {}) {
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true)
      const { auth } = await import('@/lib/firebase')
      const token = await auth.currentUser?.getIdToken()
      if (!token) return

      const res = await fetch(`${API_URL}/api/users/me/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setStatus(data.userStatus)
      }
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const scheduledCallNumbers = scheduledCalls.map(c => c.callNumber)

  const { currentMilestones, nextMentorCall, progressPercentage, isEligible, isBooked, isScheduled } = useMemo(() => {
    if (!status) return { currentMilestones: [], nextMentorCall: null, progressPercentage: 0, isEligible: false, isBooked: false, isScheduled: false }

    const calls = [
        {
          number: 1,
          label: 'First Mentor Call',
          eligible: status.eligibleForFirstMentorCall,
          completed: status.firstMentorCallCompletedAt,
          required: [
            { key: 'orientation', label: 'Orientation Complete', icon: Rocket },
            { key: 'resumeRebuilding', label: 'Resume Rebuilt', icon: FileText },
          ],
          getMessage: (milestones: any[]) => {
            const milestoneLabels = milestones.map(m => m.label).join(', ')
            return `Before you meet your mentor for your first mentor call, our team will ensure that these milestones are completed: ${milestoneLabels}. We're here to guide you through each step and ensure everything is in place for a productive mentoring session.`
          },
        },
        {
          number: 2,
          label: 'Second Mentor Call',
          eligible: status.eligibleForSecondMentorCall,
          completed: status.secondMentorCallCompletedAt,
          required: [
            { key: 'resumeConfirmed', label: 'Resume Confirmed', icon: Award },
            { key: 'portfolioBuildingAndConfirmed', label: 'Portfolio Ready', icon: Award },
          ],
          getMessage: (milestones: any[]) => {
            const milestoneLabels = milestones.map(m => m.label).join(', ')
            return `Before you meet your mentor for your second mentor call, our team will ensure that these milestones are completed: ${milestoneLabels}. We're here to guide you through each step and ensure everything is in place for a productive mentoring session.`
          },
        },
        {
          number: 3,
          label: 'Third Mentor Call',
          eligible: status.eligibleForThirdMentorCall,
          completed: status.thirdMentorCallCompletedAt,
          required: [
            { key: 'techDistributionAndExtension', label: 'Tech Stack Defined', icon: Zap },
          ],
          getMessage: (milestones: any[]) => {
            const milestoneLabels = milestones.map(m => m.label).join(', ')
            return `Before you meet your mentor for your third mentor call, our team will ensure that these milestones are completed: ${milestoneLabels}. We're here to guide you through each step and ensure everything is in place for a productive mentoring session.`
          },
        },
        {
          number: 4,
          label: 'Fourth Mentor Call',
          eligible: status.eligibleForFourthMentorCall,
          completed: status.fourthMentorCallCompletedAt,
          required: [
            { key: 'cheatSheetBuiltOut', label: 'Cheat Sheet Created', icon: BookOpen },
            { key: 'hasAppliedEnoughJobs', label: 'Jobs Applied', icon: Target },
          ],
          getMessage: (milestones: any[]) => {
            const milestoneLabels = milestones.map(m => m.label).join(', ')
            return `Before you meet your mentor for your fourth mentor call, our team will ensure that these milestones are completed: ${milestoneLabels}. We're here to guide you through each step and ensure everything is in place for a productive mentoring session.`
          },
        },
        {
          number: 5,
          label: 'Fifth Mentor Call',
          eligible: status.eligibleForFifthMentorCall,
          completed: status.fifthMentorCallCompletedAt,
          required: [],
          getMessage: () => "Congratulations! You've completed all the prerequisites. You're now ready for your final mentor call. Our team has ensured everything is in place for this milestone conversation about your career journey.",
        },
    ]

    let nextCall = null
    let isBooked = false
    let isScheduled = false

    // Find the next available call (not completed, not scheduled)
    for (const call of calls) {
      // Skip completed calls
      if (call.completed) {
        continue
      }

      // Skip scheduled calls - they're already shown above
      if (scheduledCallNumbers.includes(call.number)) {
        continue
      }

      // If eligible and no requirements, this is the next call
      if (call.eligible && call.required.length === 0) {
        nextCall = call
        break
      }

      // If eligible and all requirements met, this is the next call
      const allRequiredDone = call.required.every(r => status[r.key as keyof UserStatus])
      
      if (call.eligible && allRequiredDone) {
        nextCall = { ...call, requiredMilestones: [] }
        break
      }

      // If not eligible yet, show this as the next call to work towards
      if (!call.eligible && call.required.length > 0) {
        nextCall = {
          ...call,
          requiredMilestones: call.required,
          eligible: false,
        }
        break
      }
    }

    // If no next call found, default to first call
    if (!nextCall) {
      nextCall = calls.find(c => !c.completed && !scheduledCallNumbers.includes(c.number)) || calls[0]
    }

    // Check if the next call is scheduled
    isScheduled = scheduledCallNumbers.includes(nextCall?.number || 0)

    const isEligible = nextCall?.eligible && (nextCall as any).requiredMilestones?.length === 0
    isBooked = Boolean(nextCall?.completed)

    const requiredMilestones = (nextCall as any).requiredMilestones || nextCall?.required || []
    const currentMilestones = requiredMilestones.map((m: any) => ({
      id: m.key,
      label: m.label,
      icon: m.icon,
      completed: Boolean(status[m.key as keyof UserStatus]),
    }))

    // Generate dynamic message if getMessage function exists
    if (nextCall && typeof (nextCall as any).getMessage === 'function') {
      nextCall = {
        ...nextCall,
        dynamicMessage: (nextCall as any).getMessage(currentMilestones),
      }
    }

    const completedMilestones = MILESTONES.filter(m => status[m.key as keyof UserStatus]).length
    const progressPercentage = (completedMilestones / MILESTONES.length) * 100

    return {
      currentMilestones,
      nextMentorCall: nextCall,
      progressPercentage,
      isEligible,
      isBooked,
      isScheduled,
    }
  }, [status, scheduledCallNumbers])

  const handleBookCall = useCallback(async () => {
    if (!nextMentorCall || !isEligible || booking) return

    try {
      setBooking(true)
      const { auth } = await import('@/lib/firebase')
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        toast.error('Not authenticated')
        return
      }

      const res = await fetch(`${API_URL}/api/users/me/book-call`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callNumber: nextMentorCall.number }),
      })

      if (res.ok) {
        toast.success('Call booked successfully!')
        await loadStatus()
      } else {
        const error = await res.json()
        toast.error(error.message || 'Failed to book call')
      }
    } catch (error: any) {
      console.error('Error booking call:', error)
      toast.error(error.message || 'Failed to book call')
    } finally {
      setBooking(false)
    }
  }, [nextMentorCall, isEligible, booking, loadStatus])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  if (!status || !nextMentorCall) return null

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-indigo-200 dark:border-gray-700 p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
      
      <div className="relative z-10">

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`relative ${isBooked || isEligible ? 'animate-pulse' : ''}`}>
            <div className={`absolute inset-0 rounded-full ${
              isBooked || isEligible ? 'bg-green-400/30 animate-ping' : ''
            }`}></div>
            <Flag className={`relative w-8 h-8 ${isBooked ? 'text-green-500' : isEligible ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {scheduledCalls.length > 0 ? 'Next Available Call' : nextMentorCall.label}
          </h3>
          {isBooked && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">Completed!</span>
            </div>
          )}
          {isEligible && !isBooked && !isScheduled && (
            <span className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
              🎉 Ready!
            </span>
          )}
        </div>

        {scheduledCalls.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 shadow-xl border-2 border-blue-400 transform hover:scale-[1.02] transition-transform">
            <p className="text-sm text-white leading-relaxed font-medium">
              You have {scheduledCalls.length} call{scheduledCalls.length > 1 ? 's' : ''} scheduled above. 
              {nextMentorCall && !isScheduled && (
                <> After your scheduled call{scheduledCalls.length > 1 ? 's' : ''} {scheduledCalls.length > 1 ? 'are' : 'is'} completed, you'll be able to work towards your {nextMentorCall.label.toLowerCase()}.</>
              )}
              {nextMentorCall && isScheduled && (
                <> Your {nextMentorCall.label.toLowerCase()} is already scheduled. Complete the prerequisites below to unlock it.</>
              )}
            </p>
          </div>
        )}

        {!isBooked && !isEligible && currentMilestones.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-indigo-200 dark:border-gray-700 shadow-xl">
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-medium">
              {(nextMentorCall as any)?.dynamicMessage || 
                `Before you meet your mentor for your ${nextMentorCall?.label.toLowerCase() || 'mentor call'}, our team will ensure that these milestones are completed: ${currentMilestones.map(m => m.label).join(', ')}. We're here to guide you through each step and ensure everything is in place for a productive mentoring session.`
              }
            </p>
            <div className="space-y-4">
              {currentMilestones.map((milestone: { id: string; label: string; icon: any; completed: boolean }) => {
                const Icon = milestone.icon
                return (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-4 p-5 rounded-xl transition-all transform hover:scale-[1.02] ${
                      milestone.completed
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-400 dark:border-green-600 shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all ${
                        milestone.completed
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse'
                          : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700'
                      }`}
                    >
                      {milestone.completed ? (
                        <Check className="w-7 h-7 text-white" />
                      ) : (
                        <Icon className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-bold text-lg ${
                          milestone.completed
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {milestone.label}
                      </p>
                    </div>
                    {milestone.completed && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {isEligible && !isBooked && (
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-6 mb-6 shadow-2xl border-2 border-green-300 transform hover:scale-[1.02] transition-transform">
            <p className="text-sm text-white leading-relaxed mb-3 font-semibold">
              🎉 Excellent progress! All prerequisites for your {nextMentorCall.label.toLowerCase()} are complete. Our team at Mentorque has verified your milestones and you're now ready to meet your mentor!
            </p>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              Please contact Mentorque with your availability for this call. Once the admin approves and schedules your session, all the call details will appear above. We're excited to help you take the next step in your career journey!
            </p>
          </div>
        )}

        {isBooked && (
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-6 mb-6 shadow-2xl border-2 border-green-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <p className="text-lg font-bold text-white">
                Call Booked Successfully! 🎊
              </p>
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              Your {nextMentorCall.label.toLowerCase()} has been booked. You'll see the next steps once this call is completed.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
