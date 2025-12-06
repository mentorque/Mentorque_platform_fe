import Navbar from "@/shared/components/Navbar";
import Protected from "@/shared/components/Protected";
import ProgressBoard from "@/shared/components/ProgressBoard";
import { useUserProgress } from "@/hooks/useUserProgress";
import { TrendingUp, Target, Award, Calendar } from "lucide-react";

export default function Progress() {
  const { weeks } = useUserProgress();
  
  const completedWeeks = weeks?.filter(w => w.done).length || 0;
  const totalWeeks = weeks?.length || 8;
  const progressPercentage = (completedWeeks / totalWeeks) * 100;

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <Navbar />
        
        {/* Progress Header */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Your Progress Journey
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Track your journey through the 8-week interview acceleration program. 
                Mark milestones, add reflections, and watch your progress unfold.
              </p>
            </div>

            {/* Progress Stats Cards */}
            {weeks && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completedWeeks}/{totalWeeks}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">weeks completed</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{Math.round(progressPercentage)}% complete</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalWeeks - completedWeeks}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">weeks to go</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Achievement</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {completedWeeks === totalWeeks ? "🎉" : completedWeeks > 0 ? "🔥" : "🚀"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {completedWeeks === totalWeeks ? "Program Complete!" : 
                         completedWeeks > 0 ? "Great progress!" : "Ready to start"}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Progress Board */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Weekly Milestones</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Click to mark weeks complete and add your notes. Use "Save & Lock" to finalize your progress. Everything auto-saves to Firebase.
              </p>
            </div>
            <ProgressBoard />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {completedWeeks === totalWeeks ? "Congratulations! 🎉" : "Keep Going! 🚀"}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {completedWeeks === totalWeeks 
                  ? "You've completed the entire program! You're ready to ace those interviews."
                  : "Each completed week brings you closer to your dream job. Stay consistent and track your progress here."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Back to Dashboard
                </button>
                <button 
                  className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => window.location.href = '/mock-interviews'}
                >
                  Practice Interviews
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Protected>
  );
}
