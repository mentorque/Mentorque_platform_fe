"use client"; // <-- only if you're on Next.js App Router

import { useEffect, useState } from "react";
import Navbar from "@/shared/components/Navbar";
import Protected from "@/shared/components/Protected";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle, Star, Users, TrendingUp, Bot, FileText, MessageSquare } from "lucide-react";
import { useUserProgress } from "@/hooks/useUserProgress";

export default function Dashboard() {
  const [name, setName] = useState<string | null>(null);
  const { weeks } = useUserProgress();

  // Helper function to check if a week is completed
  const isWeekCompleted = (weekNumber: number) => {
    if (!weeks) return false;
    const week = weeks.find(w => w.week === weekNumber);
    return week ? week.done : false;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return; // Protected will redirect if needed

      try {
        // 1) ensure freshest auth data
        await u.reload();
        let display = u.displayName || "";

        // 2) if no displayName, try Firestore profile
        if (!display) {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            display = (snap.data().fullName as string) || "";
          }
        }

        // 3) final fallbacks
        setName(display || u.email || "User");
      } catch (e) {
        console.error("Failed to resolve user name:", e);
        setName(u.email || "User");
      }
    });

    return () => unsub();
  }, []);

  const weeklyProgram = [
    {
      week: 1,
      title: "Resume Review & Analysis",
      description: "Get your resume reviewed and analysed by your personal mentor",
      duration: "1-1 Call Session",
      icon: <FileText className="h-6 w-6" />,
      action: () => window.location.href = '/resume-review',
      color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
    },
    {
      week: 2,
      title: "Resume Rebuild & Optimization",
      description: "Completely rebuild your resume with expert guidance and ATS optimization",
      duration: "Expert Collaboration",
      icon: <TrendingUp className="h-6 w-6" />,
      action: () => window.location.href = '/resume-rebuild',
      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
    },
    {
      week: 3,
      title: "AI Assistant & Job Tracker Setup, Portfolio Building",
      description: "Get your AI assistant setup and build a stunning portfolio that showcases your skills and projects",
      duration: "AI Setup + Portfolio",
      icon: <Bot className="h-6 w-6" />,
      action: () => window.location.href = '/ai-assistant',
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
    },
    {
      week: 4,
      title: "Cheat Sheet & Mock Interview Prep Plan",
      description: "Get your cheat sheets and comprehensive mock interview preparation plan",
      duration: "Prep Materials",
      icon: <MessageSquare className="h-6 w-6" />,
      action: () => window.location.href = '/cheat-sheet-prep',
      color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700"
    }
  ];

  const optionalServices = [
    {
      title: "Interview Cheatsheet Preparation",
      description: "Create personalized cheatsheets with mentor guidance",
      icon: <FileText className="h-5 w-5" />,
      action: () => window.location.href = '/interview-cheatsheet'
    },
    {
      title: "LinkedIn & Outreach Strategy",
      description: "Master networking and referral strategies",
      icon: <Users className="h-5 w-5" />,
      action: () => window.location.href = '/linkedin-strategy'
    }
  ];

  const mockInterviews = [
    {
      title: "Elevator Pitch",
      description: "Perfect your 30-second introduction",
      duration: "30 mins",
      difficulty: "Beginner",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
    },
    {
      title: "Competency Interview",
      description: "Behavioral questions and soft skills assessment",
      duration: "45 mins", 
      difficulty: "Intermediate",
      icon: <Users className="h-5 w-5" />,
      color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
    },
    {
      title: "Technical Interview",
      description: "Coding challenges and technical deep-dives",
      duration: "60 mins",
      difficulty: "Advanced",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
    },
    {
      title: "Final Behavioral Round",
      description: "Executive-level behavioral assessment",
      duration: "45 mins",
      difficulty: "Expert",
      icon: <Star className="h-5 w-5" />,
      color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
    }
  ];

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6 inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-3 py-1 rounded-full text-sm font-medium">
              🚀 8-Week Interview Acceleration Program
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              Welcome back{ name ? `, ${name}` : "" }! 👋<br />
              Continue Your Journey to
              <span className="text-blue-600 dark:text-blue-400"> Dream Job</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              A structured, week-by-week program designed to accelerate your interview success. 
              From resume optimization to mock interviews with MAANG engineers.
            </p>
            <div className="flex justify-center">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                onClick={() => window.location.href = '/dashboard'}
              >
                Continue Your Journey
              </button>
            </div>
          </div>
        </section>

        {/* 8-Week Program */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Your 8-Week Success Timeline
              </h2>
              <p className="text-lg text-gray-600">
                Follow our proven week-by-week program for maximum interview success
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {weeklyProgram.map((week, index) => {
                const isCompleted = isWeekCompleted(week.week);
                return (
                  <div 
                    key={index} 
                    className={`${
                      isCompleted 
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60" 
                        : week.color
                    } hover:shadow-lg transition-all duration-300 cursor-pointer rounded-lg border p-6 ${
                      isCompleted ? "cursor-default" : ""
                    }`} 
                    onClick={isCompleted ? undefined : week.action}
                  >
                    <div className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${
                          isCompleted 
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        } text-xs px-2 py-1 rounded`}>
                          Week {week.week}
                        </span>
                        <div className="flex items-center space-x-2">
                          {week.icon}
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                      <h3 className={`text-lg font-semibold ${
                        isCompleted ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {week.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        isCompleted ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
                      }`}>
                        {week.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isCompleted ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
                      }`}>
                        {week.duration}
                      </span>
                      {isCompleted ? (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                          Completed
                        </span>
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Mock Interviews */}
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Mock Interviews with Expert Mentors
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Practice with expert mentors from top companies
              </p>
              <button 
                onClick={() => window.location.href = '/mock-interviews'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                View All Interview Types
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockInterviews.map((interview, index) => {
                // Map interview titles to week numbers (5-8)
                const weekMapping: { [key: string]: number } = {
                  "Elevator Pitch": 5,
                  "Competency Interview": 6,
                  "Technical Interview": 7,
                  "Final Behavioral Round": 8
                };
                const weekNumber = weekMapping[interview.title];
                const isCompleted = weekNumber ? isWeekCompleted(weekNumber) : false;
                
                return (
                  <div 
                    key={index} 
                    className={`${
                      isCompleted 
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60" 
                        : "bg-white dark:bg-gray-900"
                    } rounded-lg border hover:shadow-lg transition-all duration-300 p-6 ${
                      isCompleted ? "cursor-default" : "cursor-pointer"
                    }`}
                    onClick={isCompleted ? undefined : () => window.location.href = '/mock-interviews'}
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {interview.icon}
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <span className={`${
                          isCompleted 
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                            : interview.color
                        } px-2 py-1 rounded text-xs font-medium`}>
                          {interview.difficulty}
                        </span>
                      </div>
                      <h4 className={`text-lg font-semibold ${
                        isCompleted ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {interview.title}
                      </h4>
                      <p className={`${
                        isCompleted ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
                      }`}>
                        {interview.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm ${
                        isCompleted ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
                      }`}>
                        {interview.duration}
                      </span>
                      {isCompleted && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                          Completed
                        </span>
                      )}
                    </div>
                    {isCompleted ? (
                      <div className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium text-center">
                        Completed
                      </div>
                    ) : (
                      <button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/mock-interviews';
                        }}
                      >
                        View All Sessions
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Optional Enhancement Services */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Optional Enhancement Services
              </h2>
              <p className="text-lg text-gray-600">
                Additional services to boost your interview preparation
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {optionalServices.map((service, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg border hover:shadow-lg transition-all duration-300 cursor-pointer p-6" onClick={service.action}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{service.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet Your Student Success Manager */}
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Meet Your Student Success Manager
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Your dedicated success managers will be managing your candidature end-to-end, 
                providing personalized guidance throughout your journey to ensure your success feels unique to you.
              </p>
            </div>
            <div className="flex justify-center">
              {/* Anchita Basumtary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-8 hover:shadow-lg transition-all duration-300 max-w-md">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">AB</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Anchita Basumatary</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Student Success Manager</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">📧</span>
                      <a href="mailto:info@mentorquedu.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        info@mentorquedu.com
                      </a>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">📞</span>
                      <a href="tel:+353892025448" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        +353 89 202 5448
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start your journey Now!
            </p>
            <div className="flex justify-center">
              <button 
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-8 py-3 rounded-lg font-medium transition-colors"
                onClick={() => window.location.href = '/dashboard'}
              >
                Start Week 1 Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </Protected>
  );
}


