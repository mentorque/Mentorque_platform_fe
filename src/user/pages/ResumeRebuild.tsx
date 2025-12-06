
import { TrendingUp, CheckCircle, Star, Clock, Users, Target, Zap, Award } from 'lucide-react';
import { CompletionBadge } from '@/shared/ui/completion-badge';
import Navbar from '@/shared/components/Navbar';
import Protected from '@/shared/components/Protected';
import WhatsAppCTA from '@/shared/components/WhatsAppCTA';

const ResumeRebuild = () => {
  const rebuildFeatures = [
    {
      title: "Complete Rewrite",
      description: "Start fresh with a professionally written resume from scratch",
      icon: <Target className="w-8 h-8" />
    },
    {
      title: "ATS Optimization",
      description: "Advanced formatting and keywords to beat tracking systems",
      icon: <Zap className="w-8 h-8" />
    },
    {
      title: "Industry Templates",
      description: "Custom designs tailored to your specific industry",
      icon: <Award className="w-8 h-8" />
    },
    {
      title: "Personal Branding",
      description: "Develop your unique professional narrative and value proposition",
      icon: <Users className="w-8 h-8" />
    }
  ];

  const rebuildPackage = {
    title: "Complete Resume Rebuild",
    duration: "3-5 days",
    description: "Comprehensive resume transformation with expert collaboration",
    includes: [
      "Full resume rewrite from scratch",
      "ATS-optimized formatting",
      "Industry-specific keywords",
      "Personal branding consultation",
      "LinkedIn profile optimization",
      "Cover letter template",
      "Multiple rounds of revisions",
      "PDF and Word formats",
      "30-day follow-up support"
    ]
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <TrendingUp className="w-12 h-12" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  Resume Rebuild & Optimization
                </h1>
                <CompletionBadge serviceId="resume-rebuild" />
              </div>
              <p className="text-xl md:text-2xl mb-8 text-green-100">
                Complete resume transformation with expert guidance and ATS optimization
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Rewrite</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Expert Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Fast Turnaround</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rebuild Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What We Rebuild
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete transformation to maximize your career potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {rebuildFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-green-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rebuild Package */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Our Resume Rebuild Service
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Complete transformation to maximize your career potential
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {rebuildPackage.title}
                    </h3>
                    <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {rebuildPackage.duration}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-8 text-center text-lg">{rebuildPackage.description}</p>

                  <div className="space-y-4 mb-8">
                    {rebuildPackage.includes.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                      </div>
                    ))}
                  </div>

                  <WhatsAppCTA label="Resume Rebuild & Optimization" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Rebuild Your Resume?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Transform your career with a professionally rebuilt resume that gets results
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WhatsAppCTA label="Resume Rebuild & Optimization" />
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default ResumeRebuild;
