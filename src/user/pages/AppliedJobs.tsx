import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Briefcase, MapPin, ExternalLink, Trash2, Calendar, Building2, RefreshCw, FileText, Clock, Phone, XCircle, ChevronDown, Flame, Trophy, Target, Zap, Plus, X, ChevronLeft, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import toast from 'react-hot-toast';
import Protected from '@/shared/components/Protected';
import Navbar from '@/shared/components/Navbar';
import { AreaChart, Area, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AppliedJob {
  id: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  appliedDate: string;
  appliedText?: string;
  status: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_OPTIONS = [
  { 
    value: 'Applied', 
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700', 
    icon: FileText 
  },
  { 
    value: 'In Progress', 
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700', 
    icon: Clock 
  },
  { 
    value: 'Got Call Back', 
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700', 
    icon: Phone 
  },
  { 
    value: 'Received Offer', 
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700', 
    icon: Trophy 
  },
  { 
    value: 'Rejected', 
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700', 
    icon: XCircle 
  }
];

export default function AppliedJobs() {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Applied',
    type: 'Website',
    url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [goalPerDay, setGoalPerDay] = useState<number>(3);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState<number>(3);
  const [updatingGoal, setUpdatingGoal] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await Promise.all([
          fetchAppliedJobs(user),
          fetchDailyGoal(user)
        ]);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDailyGoal = async (user?: any) => {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/applied-jobs/goal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily goal');
      }

      const data = await response.json();
      setGoalPerDay(data.goalPerDay || 3);
      setTempGoal(data.goalPerDay || 3);
    } catch (error: any) {
      console.error('Error fetching daily goal:', error);
      // Use default value of 3 if fetch fails
      setGoalPerDay(3);
      setTempGoal(3);
    }
  };

  const updateDailyGoal = async () => {
    if (tempGoal < 1 || tempGoal > 100) {
      toast.error('Goal must be between 1 and 100');
      return;
    }

    setUpdatingGoal(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        setUpdatingGoal(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/applied-jobs/goal`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goalPerDay: tempGoal })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update goal');
      }

      const data = await response.json();
      setGoalPerDay(data.goalPerDay);
      setEditingGoal(false);
      toast.success('Daily goal updated successfully');
    } catch (error: any) {
      console.error('Error updating daily goal:', error);
      toast.error(error.message || 'Failed to update daily goal');
      setTempGoal(goalPerDay); // Revert on error
    } finally {
      setUpdatingGoal(false);
    }
  };

  const fetchAppliedJobs = async (user?: any) => {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/applied-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applied jobs');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error: any) {
      console.error('Error fetching applied jobs:', error);
      toast.error(error.message || 'Failed to load applied jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setUpdatingJobId(jobId);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        setUpdatingJobId(null);
        return;
      }

      const response = await fetch(`${API_URL}/api/applied-jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      const data = await response.json();
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus, updatedAt: data.job.updatedAt } : job
      ));

      toast.success(`Status updated to "${newStatus}"`);
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingJobId(null);
    }
  };

  const deleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/applied-jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleAddJob = async () => {
    if (!newJob.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        setSubmitting(false);
        return;
      }

      const jobData = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newJob.title.trim(),
        company: newJob.company.trim() || null,
        url: newJob.url.trim() || '#',
        appliedDate: newJob.appliedDate,
        status: newJob.status,
        type: newJob.type
      };

      const response = await fetch(`${API_URL}/api/applied-jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add job');
      }

      const data = await response.json();
      setJobs([data.job, ...jobs]);
      setShowAddJobModal(false);
      setNewJob({
        title: '',
        company: '',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        type: 'Website',
        url: ''
      });
      toast.success('Job added successfully');
    } catch (error: any) {
      console.error('Error adding job:', error);
      toast.error(error.message || 'Failed to add job');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const filteredJobs = filterStatus === 'All' 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusCounts = () => {
    const counts: { [key: string]: number } = { All: jobs.length };
    STATUS_OPTIONS.forEach(option => {
      counts[option.value] = jobs.filter(job => job.status === option.value).length;
    });
    return counts;
  };

  const calculateStreak = () => {
    if (jobs.length === 0) return { currentStreak: 0, todayCount: 0, needToday: goalPerDay };

    // Group jobs by date
    const jobsByDate: { [key: string]: number } = {};
    jobs.forEach(job => {
      const date = new Date(job.appliedDate).toDateString();
      jobsByDate[date] = (jobsByDate[date] || 0) + 1;
    });

    // Get today's date
    const today = new Date().toDateString();
    const todayCount = jobsByDate[today] || 0;

    // Calculate streak using user-defined goal
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toDateString();
      const count = jobsByDate[dateStr] || 0;
      
      if (count >= goalPerDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateStr === today && count > 0) {
        // Today but hasn't reached minimum yet - don't break streak
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      todayCount,
      needToday: Math.max(0, goalPerDay - todayCount)
    };
  };

  const streakData = calculateStreak();
  
  const statusCounts = getStatusCounts();

  // Prepare data for Jobs Applied Per Day chart
  const getJobsPerDayData = () => {
    if (jobs.length === 0) return [];

    // Get all unique dates and count jobs per date
    const dateCounts: { [key: string]: number } = {};
    jobs.forEach(job => {
      const date = new Date(job.appliedDate).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Get date range (last 30 days or all dates if less)
    const dates = Object.keys(dateCounts).sort();
    const startDate = new Date(dates[0]);
    const endDate = new Date();
    
    // Fill in missing dates with 0
    const result: { date: string; applications: number; displayDate: string }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const displayDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      result.push({
        date: dateStr,
        applications: dateCounts[dateStr] || 0,
        displayDate
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Return last 30 days
    return result.slice(-30);
  };

  // Prepare data for Jobs by Status chart
  const getJobsByStatusData = () => {
    const data = STATUS_OPTIONS.map(option => ({
      name: option.value,
      value: jobs.filter(job => job.status === option.value).length,
      color: option.value === 'Applied' ? '#3b82f6' :
             option.value === 'In Progress' ? '#eab308' :
             option.value === 'Got Call Back' ? '#22c55e' :
             option.value === 'Received Offer' ? '#a855f7' :
             '#ef4444'
    })).filter(item => item.value > 0);

    return data;
  };

  const jobsPerDayData = getJobsPerDayData();
  const jobsByStatusData = getJobsByStatusData();

  if (loading) {
    return (
      <Protected>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                    Day Streak
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
                    {!editingGoal && (
                      <button
                        onClick={() => {
                          setEditingGoal(true);
                          setTempGoal(goalPerDay);
                        }}
                        className="ml-2 p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Edit daily goal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {editingGoal && (
                      <div className="flex items-center gap-2 ml-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={tempGoal}
                          onChange={(e) => setTempGoal(parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 text-lg font-semibold border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateDailyGoal();
                            } else if (e.key === 'Escape') {
                              setEditingGoal(false);
                              setTempGoal(goalPerDay);
                            }
                          }}
                        />
                        <button
                          onClick={updateDailyGoal}
                          disabled={updatingGoal}
                          className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Save goal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoal(false);
                            setTempGoal(goalPerDay);
                          }}
                          className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Today's Applications
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
                    {jobs.length}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Total Applications
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
                    {streakData.currentStreak >= 30 ? 'Legend' : 
                     streakData.currentStreak >= 14 ? 'Champion' : 
                     streakData.currentStreak >= 7 ? 'Achiever' : 
                     streakData.currentStreak >= 3 ? 'Rising Star' : 'Beginner'}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Achievement Rank
                  </div>
                </div>
              </div>
            </div>

            {/* Status Message & Goal Editor */}
            <div className="text-right">
              {streakData.todayCount >= goalPerDay ? (
                <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white rounded-xl shadow-md">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Daily Goal Complete</span>
                </div>
              ) : (
                <div className="text-slate-700 dark:text-slate-300">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{streakData.needToday}</div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">more to reach goal</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-600 dark:via-indigo-600 dark:to-violet-600 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min((streakData.todayCount / goalPerDay) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Analytics Charts Section */}
        {jobs.length > 0 && (
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
                    Jobs applied per day (Last 30 days)
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart 
                  data={jobsPerDayData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
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
                                {payload[0].value} {payload[0].value === 1 ? 'application' : 'applications'}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
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
                      stroke: '#fff'
                    }}
                    activeDot={{ 
                      r: 6, 
                      fill: '#6366f1',
                      stroke: '#fff',
                      strokeWidth: 2,
                      filter: 'url(#glow)'
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
                    <defs>
                      <filter id="shadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <Pie
                      data={jobsByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      style={{ filter: 'url(#shadow)' }}
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
                          const data = payload[0];
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
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                        fontWeight: 500
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Applied Jobs
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddJobModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Job Manually
              </button>
              <button
                onClick={() => fetchAppliedJobs()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                filterStatus === 'All'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="font-semibold">All Jobs</span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-sm font-bold">{statusCounts['All']}</span>
            </button>
            {STATUS_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    filterStatus === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{option.value}</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-sm font-bold">{statusCounts[option.value]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              {filterStatus === 'All' ? 'No Jobs Yet' : `No ${filterStatus} Jobs`}
            </h3>
            {filterStatus !== 'All' && (
              <button
                onClick={() => setFilterStatus('All')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View All Jobs
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentJobs.map((job) => {
              const statusConfig = getStatusConfig(job.status);
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300 dark:border-gray-600"
                >
                  <div className="p-6">
                    {/* Job Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              {job.company && (
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="w-4 h-4 flex-shrink-0" />
                                  <span className="font-medium">{job.company}</span>
                                </div>
                              )}
                              {job.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              {job.type && (
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-xs font-medium">
                                    {job.type}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>Applied {new Date(job.appliedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteJob(job.id, job.title)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <div className="relative inline-block">
                          <select
                            value={job.status}
                            onChange={(e) => updateJobStatus(job.id, e.target.value)}
                            disabled={updatingJobId === job.id}
                            style={{
                              backgroundImage: 'none',
                            }}
                            className={`${statusConfig.color} pl-3 pr-9 py-2 rounded-lg font-medium text-sm transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option 
                                key={option.value} 
                                value={option.value}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                {option.value}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      {job.url && job.url !== '#' && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                          <span>View Job</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pagination Info */}
            {totalPages > 1 && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Add Job Manually
                </h2>
                <button
                  onClick={() => setShowAddJobModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddJob(); }} className="space-y-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g. Google"
                  />
                </div>

                {/* Applied Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={newJob.appliedDate}
                    onChange={(e) => setNewJob({ ...newJob, appliedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={newJob.status}
                    onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>

                {/* Job Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Job Link
                  </label>
                  <input
                    type="url"
                    value={newJob.url}
                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="https://company.com/job-posting (optional)"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddJobModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Job'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Protected>
  );
}

