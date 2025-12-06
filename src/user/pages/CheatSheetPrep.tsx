import { BookOpen, CheckCircle, Star, Clock, Target, Zap, Award, FileText, Users, MessageSquare, Brain, Calendar } from 'lucide-react';
import { CompletionBadge } from '@/shared/ui/completion-badge';
import Navbar from '@/shared/components/Navbar';
import Protected from '@/shared/components/Protected';
import WhatsAppCTA from '@/shared/components/WhatsAppCTA';

const CheatSheetPrep = () => {
  const cheatSheetCategories = [
    {
      title: "Behavioral Questions",
      description: "Master the STAR method with 50+ common behavioral questions and perfect answers",
      icon: <Users className="w-8 h-8" />,
      items: [
        "Leadership scenarios",
        "Conflict resolution examples",
        "Teamwork situations",
        "Problem-solving stories",
        "Failure and learning experiences"
      ]
    },
    {
      title: "Technical Questions",
      description: "Comprehensive technical interview prep with coding challenges and system design",
      icon: <Brain className="w-8 h-8" />,
      items: [
        "Data structures & algorithms",
        "System design fundamentals",
        "Database optimization",
        "API design principles",
        "Performance optimization"
      ]
    },
    {
      title: "Industry-Specific",
      description: "Tailored questions and answers for your specific industry and role",
      icon: <Target className="w-8 h-8" />,
      items: [
        "Role-specific scenarios",
        "Industry terminology",
        "Current market trends",
        "Company-specific insights",
        "Salary negotiation tips"
      ]
    },
    {
      title: "Soft Skills",
      description: "Communication, leadership, and cultural fit assessment preparation",
      icon: <MessageSquare className="w-8 h-8" />,
      items: [
        "Communication techniques",
        "Leadership examples",
        "Cultural fit scenarios",
        "Stress management",
        "Presentation skills"
      ]
    }
  ];

  const prepPlanSteps = [
    {
      step: "1",
      title: "Assessment & Analysis",
      description: "Evaluate your current interview skills and identify improvement areas"
    },
    {
      step: "2", 
      title: "Cheat Sheet Creation",
      description: "Develop personalized cheat sheets with your best examples and stories"
    },
    {
      step: "3",
      title: "Practice Sessions",
      description: "Structured mock interviews with expert mentors and detailed feedback"
    },
    {
      step: "4",
      title: "Final Preparation",
      description: "Last-minute prep, confidence building, and interview day strategies"
    }
  ];

  const prepPackage = {
    title: "Cheat Sheet & Mock Interview Prep Plan",
    duration: "2-3 days",
    description: "Comprehensive interview preparation with personalized cheat sheets and expert guidance",
    includes: [
      "Personalized cheat sheet creation",
      "50+ behavioral question examples",
      "Technical interview preparation",
      "Industry-specific question bank",
      "STAR method mastery guide",
      "Mock interview practice sessions",
      "Expert feedback and coaching",
      "Confidence building strategies",
      "Interview day preparation tips",
      "Follow-up email templates",
      "Salary negotiation guide",
      "30-day follow-up support"
    ]
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
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
                  Cheat Sheet & Mock Interview Prep Plan
                </h1>
                <CompletionBadge serviceId="cheat-sheet-prep" />
              </div>
              <p className="text-xl md:text-2xl mb-8 text-indigo-100">
                Get comprehensive interview preparation with personalized cheat sheets and expert guidance
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Personalized Cheat Sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Expert Coaching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Fast Turnaround</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cheat Sheet Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Comprehensive Cheat Sheet Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to ace any interview type
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {cheatSheetCategories.map((category, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="text-indigo-600 mb-6 flex justify-center">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  {category.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                  {category.description}
                </p>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation Plan */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Your 4-Step Preparation Plan
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Structured approach to interview mastery
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {prepPlanSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prep Package */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Cheat Sheet & Prep Service
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete interview preparation solution
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {prepPackage.title}
                  </h3>
                  <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {prepPackage.duration}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 text-center text-lg">{prepPackage.description}</p>

                <div className="space-y-4 mb-8">
                  {prepPackage.includes.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <WhatsAppCTA label="Cheat Sheet & Mock Interview Prep Plan" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Ace Your Interviews?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Get your personalized cheat sheets and expert coaching to land your dream job
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WhatsAppCTA label="Cheat Sheet & Mock Interview Prep Plan" />
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default CheatSheetPrep;
