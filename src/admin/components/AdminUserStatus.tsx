import { useState, useEffect } from 'react'
import { Check, Loader2, Video, Phone, Lock, Unlock, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface UserStatus {
  id: string
  orientation: boolean
  resumeRebuilding: boolean
  eligibleForFirstMentorCall: boolean
  firstMentorCallScheduledAt: string | null
  firstMentorCallGoogleMeetLink: string | null
  firstMentorCallCompletedAt: string | null
  resumeConfirmed: boolean
  portfolioBuildingAndConfirmed: boolean
  eligibleForSecondMentorCall: boolean
  secondMentorCallScheduledAt: string | null
  secondMentorCallGoogleMeetLink: string | null
  secondMentorCallCompletedAt: string | null
  paymentMade: boolean
  techDistributionAndExtension: boolean
  eligibleForThirdMentorCall: boolean
  thirdMentorCallScheduledAt: string | null
  thirdMentorCallGoogleMeetLink: string | null
  thirdMentorCallCompletedAt: string | null
  cheatSheetBuiltOut: boolean
  hasAppliedEnoughJobs: boolean
  eligibleForFourthMentorCall: boolean
  fourthMentorCallScheduledAt: string | null
  fourthMentorCallGoogleMeetLink: string | null
  fourthMentorCallCompletedAt: string | null
  finalReview: boolean
  eligibleForFifthMentorCall: boolean
  fifthMentorCallScheduledAt: string | null
  fifthMentorCallGoogleMeetLink: string | null
  fifthMentorCallCompletedAt: string | null
}

interface AdminUserStatusProps {
  userId: string
  isAdmin: boolean
  onStatusUpdate?: () => void
}

interface ProgressStep {
  key: keyof UserStatus
  label: string
  stepNumber: number
  unlocksCall?: number // Which mentor call this step unlocks
}

const PROGRESS_STEPS: ProgressStep[] = [
  { key: 'orientation', label: 'Orientation', stepNumber: 1 },
  { key: 'resumeRebuilding', label: 'Resume Rebuilding', stepNumber: 2, unlocksCall: 1 },
  { key: 'resumeConfirmed', label: 'Resume Confirmed', stepNumber: 3 },
  { key: 'portfolioBuildingAndConfirmed', label: 'Portfolio Confirmed', stepNumber: 4 },
  { key: 'paymentMade', label: 'Payment Done', stepNumber: 5, unlocksCall: 2 },
  { key: 'techDistributionAndExtension', label: 'Tech Distribution', stepNumber: 6, unlocksCall: 3 },
  { key: 'cheatSheetBuiltOut', label: 'Cheat Sheet', stepNumber: 7 },
  { key: 'hasAppliedEnoughJobs', label: 'Jobs Applied', stepNumber: 8, unlocksCall: 4 },
  { key: 'finalReview', label: 'Final Review', stepNumber: 9, unlocksCall: 5 },
]

const MENTOR_CALLS = [
  { number: 1, label: 'First call', eligibleKey: 'eligibleForFirstMentorCall' as keyof UserStatus, unlockAfter: 2 },
  { number: 2, label: 'Second call', eligibleKey: 'eligibleForSecondMentorCall' as keyof UserStatus, unlockAfter: 5 },
  { number: 3, label: 'Third call', eligibleKey: 'eligibleForThirdMentorCall' as keyof UserStatus, unlockAfter: 6 },
  { number: 4, label: 'Fourth call', eligibleKey: 'eligibleForFourthMentorCall' as keyof UserStatus, unlockAfter: 8 },
  { number: 5, label: 'Fifth call', eligibleKey: 'eligibleForFifthMentorCall' as keyof UserStatus, unlockAfter: 9 },
]

export default function AdminUserStatus({ userId, isAdmin }: AdminUserStatusProps) {
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [userId])

  // Listen for status updates from parent (when calls are scheduled/edited/deleted)
  useEffect(() => {
    const handleStatusUpdate = () => {
      loadStatus()
    }
    window.addEventListener('userStatusUpdated', handleStatusUpdate)
    return () => {
      window.removeEventListener('userStatusUpdated', handleStatusUpdate)
    }
  }, [userId])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setStatus(data.userStatus)
      }
    } catch (error) {
      console.error('Error loading status:', error)
      toast.error('Failed to load user status')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: keyof UserStatus, value: boolean) => {
    if (!isAdmin) return

    try {
      setSaving(true)
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          [key]: value,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setStatus(data.userStatus)
        toast.success('Status updated successfully')
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const getCallStatus = (callNumber: number) => {
    const call = MENTOR_CALLS.find(c => c.number === callNumber)
    if (!call) return { unlocked: false, scheduled: false, scheduledAt: null, completedAt: null, isPast: false }
    const scheduledAt = 
      callNumber === 1 ? status?.firstMentorCallScheduledAt :
      callNumber === 2 ? status?.secondMentorCallScheduledAt :
      callNumber === 3 ? status?.thirdMentorCallScheduledAt :
      callNumber === 4 ? status?.fourthMentorCallScheduledAt :
      status?.fifthMentorCallScheduledAt
    const completedAt =
      callNumber === 1 ? status?.firstMentorCallCompletedAt :
      callNumber === 2 ? status?.secondMentorCallCompletedAt :
      callNumber === 3 ? status?.thirdMentorCallCompletedAt :
      callNumber === 4 ? status?.fourthMentorCallCompletedAt :
      status?.fifthMentorCallCompletedAt
    const isPast = scheduledAt ? new Date(scheduledAt) < new Date() : false
    return {
      unlocked: Boolean(status?.[call.eligibleKey]),
      scheduled: Boolean(scheduledAt),
      scheduledAt: scheduledAt || null,
      completedAt: completedAt || null,
      isPast,
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const completedCount = PROGRESS_STEPS.filter((step) => status[step.key]).length
  const progressPercentage = (completedCount / PROGRESS_STEPS.length) * 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      {/* Mentor Call Details - Horizontal at Top */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
          Mentor Call Details
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {MENTOR_CALLS.map((call) => {
            const callStatus = getCallStatus(call.number)
            const unlockStep = PROGRESS_STEPS.find(step => step.unlocksCall === call.number)
            
            const isPastOrDone = callStatus.isPast || Boolean(callStatus.completedAt)
            
            return (
              <div
                key={call.number}
                className={`p-3 rounded-lg border ${
                  isPastOrDone
                    ? 'bg-gray-200 dark:bg-gray-900 border-gray-300 dark:border-gray-800'
                    : callStatus.unlocked
                    ? callStatus.scheduled
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    isPastOrDone
                      ? 'bg-gray-400 dark:bg-gray-700 text-white'
                      : callStatus.unlocked
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {call.number}
                  </div>
                  <h4 className={`text-xs font-semibold text-center ${
                    isPastOrDone
                      ? 'text-gray-500 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {call.label}
                  </h4>
                  {unlockStep && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      Unlocks after: {unlockStep.label}
                    </p>
                  )}
                  <div className="flex flex-col items-center gap-1.5 w-full mt-1">
                    {/* Unlock Status */}
                    <div className="w-full">
                      {callStatus.unlocked ? (
                        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <Unlock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Unlocked</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Locked</span>
                        </div>
                      )}
                    </div>
                    {/* Schedule Status */}
                    <div className="w-full">
                      {callStatus.completedAt ? (
                        <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded bg-gray-300 dark:bg-gray-800">
                          <Check className="w-3 h-3 text-gray-600 dark:text-gray-500" />
                          <span className="text-[9px] font-medium text-gray-600 dark:text-gray-500 text-center leading-tight">
                            Completed
                          </span>
                          <span className="text-[8px] text-gray-600 dark:text-gray-600 text-center leading-tight">
                            {new Date(callStatus.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : callStatus.scheduled && callStatus.scheduledAt ? (
                        <div className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded ${
                          isPastOrDone
                            ? 'bg-gray-300 dark:bg-gray-800'
                            : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {isPastOrDone ? (
                            <>
                              <Check className="w-3 h-3 text-gray-600 dark:text-gray-500" />
                              <span className="text-[9px] font-medium text-gray-600 dark:text-gray-500 text-center leading-tight">
                                Done
                              </span>
                              <span className="text-[8px] text-gray-600 dark:text-gray-600 text-center leading-tight">
                                {new Date(callStatus.scheduledAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </>
                          ) : (
                            <>
                              <Video className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span className="text-[10px] font-medium text-purple-700 dark:text-purple-400 text-center leading-tight">
                                Scheduled on {new Date(callStatus.scheduledAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          <Calendar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Not Scheduled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Progress Panel
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {completedCount} / {PROGRESS_STEPS.length} Steps
          </span>
        </div>
      </div>

      {/* Combined Steps and Call Status */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {PROGRESS_STEPS.map((step, index) => {
          const isCompleted = Boolean(status[step.key])
          const isLast = index === PROGRESS_STEPS.length - 1
          const callStatus = step.unlocksCall ? getCallStatus(step.unlocksCall) : null
          
          return (
            <div key={step.key} className="relative">
              {/* Connection Line */}
              {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 -z-10">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-gradient-to-b from-green-400 to-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                </div>
              )}

              <div
                className={`relative flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Step Number Circle */}
                <div className="relative flex-shrink-0">
                  {isAdmin ? (
                    <button
                      onClick={() => handleToggle(step.key, !isCompleted)}
                      disabled={saving}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCompleted
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/50'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{step.stepNumber}</span>
                      )}
                    </button>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{step.stepNumber}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isCompleted
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {step.label}
                      </h4>
                    </div>

                    {/* Call Unlock Badge */}
                    {step.unlocksCall && (
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                            callStatus?.unlocked
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {callStatus?.unlocked ? (
                            <>
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call {step.unlocksCall} unlocked</span>
                            </>
                          ) : (
                            <>
                              <Phone className="w-3.5 h-3.5 opacity-50" />
                              <span>Unlock Call {step.unlocksCall}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
