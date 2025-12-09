import { Briefcase, Flame, Target, Trophy, Zap, BarChart3, PieChart } from 'lucide-react'
import { AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AppliedJob {
  id: string
  title: string
  company?: string
  status: string
  appliedDate: string
}

interface JobStatsProps {
  jobs: AppliedJob[]
  goalPerDay?: number
  timeFilter?: 'all' | '30days' | '7days'
  onTimeFilterChange?: (filter: 'all' | '30days' | '7days') => void
}

export default function JobStats({ jobs, goalPerDay = 3, timeFilter = 'all', onTimeFilterChange }: JobStatsProps) {
  // Ensure jobs is a valid array and filter out any invalid entries
  const validJobs = Array.isArray(jobs) ? jobs.filter(job => job && job.id && job.appliedDate) : []
  
  // Filter jobs based on time filter
  const getFilteredJobs = () => {
    if (timeFilter === 'all') return validJobs
    
    const now = new Date()
    const filterDate = new Date()
    
    if (timeFilter === '30days') {
      filterDate.setDate(now.getDate() - 30)
    } else if (timeFilter === '7days') {
      filterDate.setDate(now.getDate() - 7)
    }
    
    // Set to start of day (00:00:00) to include all jobs from that day onwards
    filterDate.setHours(0, 0, 0, 0)
    
    return validJobs.filter(job => {
      const jobDate = new Date(job.appliedDate)
      return jobDate >= filterDate
    })
  }
  
  const filteredJobs = getFilteredJobs() || []
  // Calculate streak data
  const calculateStreakData = () => {
    if (!filteredJobs || filteredJobs.length === 0) return { currentStreak: 0, todayCount: 0, needToday: goalPerDay }

    const jobsByDate: { [key: string]: number } = {}
    filteredJobs.forEach((job) => {
      const date = new Date(job.appliedDate).toISOString().split('T')[0]
      jobsByDate[date] = (jobsByDate[date] || 0) + 1
    })

    const today = new Date().toISOString().split('T')[0]
    const todayCount = jobsByDate[today] || 0

    // Calculate streak
    let currentStreak = 0
    const currentDate = new Date()
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const count = jobsByDate[dateStr] || 0
      
      if (count >= goalPerDay) {
        currentStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (dateStr === today && count > 0) {
        currentStreak++
        break
      } else {
        break
      }
    }

    return {
      currentStreak,
      todayCount,
      needToday: Math.max(0, goalPerDay - todayCount),
    }
  }

  const streakData = calculateStreakData()

  // Prepare jobs per day data
  const getJobsPerDayData = () => {
    const dateCounts: { [key: string]: number } = {}
    filteredJobs.forEach((job) => {
      const date = new Date(job.appliedDate).toISOString().split('T')[0]
      dateCounts[date] = (dateCounts[date] || 0) + 1
    })

    const dates = Object.keys(dateCounts).sort()
    if (dates.length === 0) return []

    const startDate = timeFilter === '7days' 
      ? (() => {
          const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          date.setHours(0, 0, 0, 0)
          return date
        })()
      : timeFilter === '30days'
      ? (() => {
          const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          date.setHours(0, 0, 0, 0)
          return date
        })()
      : new Date(dates[0])
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999) // Include today's jobs

    const result: { date: string; applications: number; displayDate: string }[] = []
    const currentDate = new Date(startDate)
    const maxDays = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 30

    while (currentDate <= endDate && result.length < maxDays) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const displayDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      result.push({
        date: dateStr,
        applications: dateCounts[dateStr] || 0,
        displayDate,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  }

  // Prepare jobs by status data
  const getJobsByStatusData = () => {
    const statusCounts: { [key: string]: number } = {}
    filteredJobs.forEach((job) => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1
    })

    const colors: { [key: string]: string } = {
      Applied: '#3b82f6',
      'In Progress': '#eab308',
      'Got Call Back': '#22c55e',
      'Received Offer': '#a855f7',
      Rejected: '#ef4444',
    }

    return Object.entries(statusCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name] || '#6b7280',
      }))
      .filter((item) => item.value > 0)
  }

  const jobsPerDayData = getJobsPerDayData()
  const jobsByStatusData = getJobsByStatusData()

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      {onTimeFilterChange && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onTimeFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => onTimeFilterChange('30days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === '30days'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => onTimeFilterChange('7days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === '7days'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>
      )}
      
      {/* Streak & Activity Card */}
      <div className="mb-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Current Streak */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-md">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {streakData.currentStreak}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Consecutive Days 🔥
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-slate-300 dark:bg-slate-600"></div>

            {/* Today's Progress */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-md">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {streakData.todayCount}
                  </div>
                  <div className="text-xl font-semibold text-slate-500 dark:text-slate-400">
                    / {goalPerDay}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Applied Today ✨
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-slate-300 dark:bg-slate-600"></div>

            {/* Total Applications */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 rounded-xl shadow-md">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {filteredJobs?.length || 0}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Total No of Applications
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-16 w-px bg-slate-300 dark:bg-slate-600"></div>

            {/* Achievement Badge */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 rounded-xl shadow-md">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {streakData.currentStreak >= 30
                    ? 'Legend'
                    : streakData.currentStreak >= 14
                    ? 'Champion'
                    : streakData.currentStreak >= 7
                    ? 'Achiever'
                    : streakData.currentStreak >= 3
                    ? 'Rising Star'
                    : 'Beginner'}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Your Level ⭐
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-right">
            {streakData.todayCount >= goalPerDay ? (
              <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white rounded-xl shadow-md">
                <Zap className="w-5 h-5" />
                <span className="font-bold">Daily Goal Complete</span>
              </div>
            ) : (
              <div className="text-slate-700 dark:text-slate-300">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {streakData.needToday}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  more to unlock today's goal
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-600 dark:via-indigo-600 dark:to-violet-600 transition-all duration-500 shadow-sm"
              style={{
                width: `${Math.min((streakData.todayCount / goalPerDay) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      {filteredJobs.length > 0 && (
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs Applied Per Day Chart */}
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-950/20 dark:to-indigo-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Application Trend
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Jobs applied per day {timeFilter === '7days' ? '(Last 7 days)' : timeFilter === '30days' ? '(Last 30 days)' : '(All time)'}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={jobsPerDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-blue-200 dark:border-blue-800 rounded-xl shadow-2xl p-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {payload[0].payload.displayDate}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500"></div>
                            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                              {payload[0].value}{' '}
                              {payload[0].value === 1 ? 'application' : 'applications'}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="url(#colorApplications)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApplications)"
                  name="Applications"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  dot={{
                    fill: '#6366f1',
                    strokeWidth: 2,
                    r: 4,
                    stroke: '#fff',
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#6366f1',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Jobs by Status Chart */}
          <div className="bg-gradient-to-br from-white via-violet-50/30 to-purple-50/50 dark:from-gray-800 dark:via-violet-950/20 dark:to-purple-950/30 rounded-2xl border border-violet-200/50 dark:border-violet-800/30 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-xl shadow-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Status Distribution
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Breakdown by application status
                </p>
              </div>
            </div>
            {jobsByStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={jobsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {jobsByStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={2}
                        stroke="#fff"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]
                        return (
                          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-violet-200 dark:border-violet-800 rounded-xl shadow-2xl p-4">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {data.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: data.payload.color }}
                              ></div>
                              <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {data.value} {data.value === 1 ? 'job' : 'jobs'}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center">
                    <PieChart className="w-8 h-8 text-violet-400 dark:text-violet-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No data to display</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

