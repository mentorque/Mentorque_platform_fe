import { MessageSquare, Users, FileText, Star, CheckCircle, Clock, Target, Zap, Award, Calendar, BookOpen } from 'lucide-react';
import { CompletionBadge } from '@/shared/ui/completion-badge';
import Navbar from '@/shared/components/Navbar';
import Protected from '@/shared/components/Protected';
import { useUserProgress } from '@/hooks/useUserProgress';
import WhatsAppCTA from '@/shared/components/WhatsAppCTA';
import MockInterviewWhatsAppCTA from '@/shared/components/MockInterviewWhatsAppCTA';

const MockInterview = () => {
  const { weeks } = useUserProgress();

  // Helper function to check if a week is completed
  const isWeekCompleted = (weekNumber: number) => {
    if (!weeks) return false;
    const week = weeks.find(w => w.week === weekNumber);
    return week ? week.done : false;
  };

  // Interview weeks aligned with main progress system (weeks 5-8)
  const interviewWeeks = [
    {
      week: 5,
      title: "Elevator Pitch",
      subtitle: "Perfect Your 30-Second Introduction",
      duration: "30 minutes",
      difficulty: "Beginner",
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: <MessageSquare className="w-8 h-8" />,
      description: "Master the art of introducing yourself confidently and memorably. Learn to craft a compelling elevator pitch that highlights your unique value proposition and leaves a lasting impression on recruiters and hiring managers.",
      skills: [
        "Personal branding and positioning",
        "Confidence building and presentation",
        "Storytelling techniques",
        "Value proposition articulation"
      ],
      preparation: [
        "Prepare 3-4 key achievements",
        "Practice with different time limits (30s, 60s, 90s)",
        "Record yourself for self-assessment",
        "Prepare for follow-up questions"
      ]
    },
    {
      week: 6,
      title: "Competency Interview",
      subtitle: "Master the STAR Method",
      duration: "45 minutes",
      difficulty: "Intermediate",
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: <Users className="w-8 h-8" />,
      description: "Learn to answer behavioral questions using the STAR method (Situation, Task, Action, Result). Practice with real scenarios and get feedback on your storytelling structure and impact measurement.",
      skills: [
        "STAR method mastery",
        "Behavioral question patterns",
        "Leadership and teamwork examples",
        "Conflict resolution scenarios"
      ],
      preparation: [
        "Prepare 8-10 STAR stories",
        "Practice with common behavioral questions",
        "Quantify your achievements with metrics",
        "Prepare examples for different competencies"
      ]
    },
    {
      week: 7,
      title: "Technical Interview",
      subtitle: "Coding Challenges & Problem Solving",
      duration: "60 minutes",
      difficulty: "Advanced",
      color: "from-orange-600 to-red-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      icon: <FileText className="w-8 h-8" />,
      description: "Tackle coding challenges, system design questions, and technical deep-dives with MAANG engineers. Practice problem-solving approaches, code optimization, and technical communication.",
      skills: [
        "Algorithm and data structures",
        "System design fundamentals",
        "Code optimization techniques",
        "Technical communication"
      ],
      preparation: [
        "Review core algorithms and data structures",
        "Practice coding on whiteboard/online platforms",
        "Prepare system design examples",
        "Practice explaining your thought process"
      ]
    },
    {
      week: 8,
      title: "Final Behavioral Round",
      subtitle: "Executive-Level Assessment",
      duration: "45 minutes",
      difficulty: "Expert",
      color: "from-purple-600 to-indigo-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: <Star className="w-8 h-8" />,
      description: "Advanced behavioral assessment focusing on leadership, strategic thinking, and cultural fit. Practice with senior executives and learn to demonstrate executive presence and decision-making capabilities.",
      skills: [
        "Executive presence and leadership",
        "Strategic thinking and vision",
        "Cultural fit assessment",
        "High-stakes decision making"
      ],
      preparation: [
        "Prepare leadership and strategic examples",
        "Research company culture and values",
        "Practice executive-level communication",
        "Prepare questions for senior leadership"
      ]
    }
  ];

  const interviewBenefits = [
    {
      title: "Expert Industry Mentors",
      description: "Practice with mentors from top tech companies and leading organizations",
      icon: <Award className="w-6 h-6" />
    },
    {
      title: "Real Interview Simulation",
      description: "Authentic interview environment with actual interviewers",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Detailed Feedback",
      description: "Comprehensive feedback on performance and improvement areas",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Progress Tracking",
      description: "Track your improvement across all interview types",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <BookOpen className="w-12 h-12" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  Mock Interviews with Expert Mentors
                </h1>
                <CompletionBadge serviceId="mock-interviews" />
              </div>
              <p className="text-xl md:text-2xl mb-8 text-indigo-100">
                Practice with expert mentors from top companies and master every interview type
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Weeks 5-8 Program</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Expert Mentors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Real Interview Simulation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Benefits */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Practice with Expert Mentors?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get insider knowledge and real-world interview experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {interviewBenefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-indigo-600 mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Weeks */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Interview Mastery Program (Weeks 5-8)
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Progressive skill building from basic introductions to executive-level assessments
            </p>
          </div>

          <div className="space-y-8">
            {interviewWeeks.map((week, index) => {
              const isCompleted = isWeekCompleted(week.week);
              return (
                <div 
                  key={index} 
                  className={`${
                    isCompleted 
                      ? "bg-gray-100 border-gray-300 opacity-60" 
                      : week.bgColor
                  } rounded-2xl border-2 ${
                    isCompleted 
                      ? "border-gray-300" 
                      : week.borderColor
                  } overflow-hidden hover:shadow-xl transition-all duration-300`}
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left Side - Week Info */}
                      <div className="lg:w-1/3">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-16 h-16 ${
                            isCompleted 
                              ? "bg-gray-400" 
                              : `bg-gradient-to-r ${week.color}`
                          } text-white rounded-full flex items-center justify-center text-2xl font-bold`}>
                            {week.week}
                          </div>
                          <div>
                            <h3 className={`text-2xl font-bold ${
                              isCompleted ? "text-gray-500" : "text-gray-900"
                            }`}>
                              {week.title}
                            </h3>
                            <p className={`${
                              isCompleted ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {week.subtitle}
                            </p>
                          </div>
                          {isCompleted && (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className={`w-5 h-5 ${
                            isCompleted ? "text-gray-400" : "text-gray-500"
                          }`} />
                          <span className={`font-medium ${
                            isCompleted ? "text-gray-400" : "text-gray-700"
                          }`}>
                            {week.duration}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isCompleted 
                              ? "bg-gray-200 text-gray-500"
                              : week.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                              week.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                              week.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                              'bg-purple-100 text-purple-800'
                          }`}>
                            {week.difficulty}
                          </span>
                        </div>

                        <div className={`mb-4 ${
                          isCompleted ? "text-gray-400" : "text-indigo-600"
                        }`}>
                          {week.icon}
                        </div>

                        {isCompleted ? (
                          <div className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        ) : (
                          <WhatsAppCTA label={`Week ${week.week} — ${week.title}`} />
                        )}
                      </div>

                      {/* Right Side - Content */}
                      <div className="lg:w-2/3">
                        <p className={`mb-6 text-lg leading-relaxed ${
                          isCompleted ? "text-gray-400" : "text-gray-700"
                        }`}>
                          {week.description}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                              isCompleted ? "text-gray-500" : "text-gray-900"
                            }`}>
                              <Target className={`w-4 h-4 ${
                                isCompleted ? "text-gray-400" : "text-indigo-600"
                              }`} />
                              Skills You'll Master
                            </h4>
                            <ul className="space-y-2">
                              {week.skills.map((skill, skillIndex) => (
                                <li key={skillIndex} className="flex items-start gap-2">
                                  <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-1 ${
                                    isCompleted ? "text-gray-400" : "text-green-500"
                                  }`} />
                                  <span className={`text-sm ${
                                    isCompleted ? "text-gray-400" : "text-gray-700"
                                  }`}>
                                    {skill}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                              isCompleted ? "text-gray-500" : "text-gray-900"
                            }`}>
                              <Calendar className={`w-4 h-4 ${
                                isCompleted ? "text-gray-400" : "text-indigo-600"
                              }`} />
                              Preparation Tips
                            </h4>
                            <ul className="space-y-2">
                              {week.preparation.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2">
                                  <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-1 ${
                                    isCompleted ? "text-gray-400" : "text-green-500"
                                  }`} />
                                  <span className={`text-sm ${
                                    isCompleted ? "text-gray-400" : "text-gray-700"
                                  }`}>
                                    {tip}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Master Your Interviews?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands who've landed their dream jobs with expert mentor guidance
            </p>
            <div className="flex justify-center">
              <MockInterviewWhatsAppCTA />
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default MockInterview;