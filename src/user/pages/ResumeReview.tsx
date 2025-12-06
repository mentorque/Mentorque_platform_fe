import { FileText, CheckCircle, Star, Clock, Users, Target, Zap, Award } from 'lucide-react';
import { CompletionBadge } from '@/shared/ui/completion-badge';
import Navbar from '@/shared/components/Navbar';
import Protected from '@/shared/components/Protected';
import WhatsAppCTA from '@/shared/components/WhatsAppCTA';

const ResumeReview = () => {
  const reviewFeatures = [
    {
      title: "ATS Optimization",
      description: "Ensure your resume passes Applicant Tracking Systems",
      icon: <Target className="w-8 h-8" />
    },
    {
      title: "Content Enhancement",
      description: "Improve impact statements and quantify achievements",
      icon: <Zap className="w-8 h-8" />
    },
    {
      title: "Format & Design",
      description: "Professional formatting that stands out to recruiters",
      icon: <Award className="w-8 h-8" />
    },
    {
      title: "Industry Alignment",
      description: "Tailor content to your target industry and role",
      icon: <Users className="w-8 h-8" />
    }
  ];

  const reviewPackage = {
    title: "Professional Resume Review",
    duration: "60 minutes",
    description: "Comprehensive analysis with expert feedback and optimization",
    includes: [
      "ATS compatibility check",
      "Content review and suggestions",
      "Format optimization tips",
      "Live 1-on-1 feedback session",
      "Industry-specific recommendations",
      "Before/after comparison",
      "Written feedback report",
      "Follow-up email support"
    ]
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <FileText className="w-12 h-12" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  Professional Resume Review
                </h1>
                <CompletionBadge serviceId="resume-review" />
              </div>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Get expert feedback to make your resume stand out to recruiters
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>ATS Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Industry Experts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>24hr Turnaround</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What We Review
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive analysis to maximize your interview potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reviewFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-blue-600 mb-4 flex justify-center">
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

        {/* Review Package */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Our Resume Review Service
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Comprehensive professional review to maximize your interview potential
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {reviewPackage.title}
                    </h3>
                    <div className="text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {reviewPackage.duration}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-8 text-center text-lg">{reviewPackage.description}</p>

                  <div className="space-y-4 mb-8">
                    {reviewPackage.includes.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-lg">{item}</span>
                      </div>
                    ))}
                  </div>

                  <WhatsAppCTA label="Professional Resume Review" />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands who've improved their interview success rate with expert feedback
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WhatsAppCTA label="Professional Resume Review" />
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default ResumeReview;
