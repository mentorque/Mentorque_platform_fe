import { Bot, CheckCircle, Star, Clock, Users, Zap, Search, FileText, Target, Code, Globe, Palette } from 'lucide-react';
import { CompletionBadge } from '@/shared/ui/completion-badge';
import Navbar from '@/shared/components/Navbar';
import Protected from '@/shared/components/Protected';
import WhatsAppCTA from '@/shared/components/WhatsAppCTA';

const AIAssistant = () => {
  const aiFeatures = [
    {
      title: "Keyword Analysis",
      description: "Analyze job descriptions and optimize your resume with AI-powered keyword matching",
      icon: <Search className="w-8 h-8" />
    },
    {
      title: "Experience Enhancement",
      description: "Transform your experience into compelling, quantified achievements",
      icon: <Zap className="w-8 h-8" />
    },
    {
      title: "Cover Letter Generator",
      description: "Create personalized cover letters tailored to each job application",
      icon: <FileText className="w-8 h-8" />
    },
    {
      title: "HR Contact Finder",
      description: "Find and connect with HR professionals and hiring managers instantly",
      icon: <Users className="w-8 h-8" />
    }
  ];

  const preparationStrategy = [
    {
      step: "1",
      title: "Install Chrome Extension",
      description: "Get our AI assistant browser extension for seamless job application workflow"
    },
    {
      step: "2", 
      title: "Upload Your Resume",
      description: "AI analyzes your current resume and identifies improvement opportunities"
    },
    {
      step: "3",
      title: "Job Application Mode",
      description: "Browse jobs and let AI optimize your application materials in real-time"
    },
    {
      step: "4",
      title: "Track & Optimize",
      description: "Monitor application success rates and continuously improve with AI insights"
    }
  ];

  const aiPackage = {
    title: "AI Assistant & Portfolio Development",
    duration: "5-7 days",
    description: "Complete AI-powered job application toolkit with professional portfolio development",
    includes: [
      "Chrome extension installation",
      "Resume keyword optimization",
      "Experience enhancement AI",
      "Cover letter generation",
      "HR contact finder",
      "Custom portfolio website design",
      "Mobile-responsive development",
      "Professional domain setup",
      "1-year hosting included",
      "SEO optimization",
      "Job application tracking",
      "Success rate analytics",
      "Real-time optimization",
      "Lifetime updates"
    ]
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <Bot className="w-12 h-12" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  AI Assistant & Portfolio Setup
                </h1>
                <CompletionBadge serviceId="ai-assistant" />
              </div>
              <p className="text-xl md:text-2xl mb-8 text-orange-100">
                Get your AI assistant Chrome extension and build a stunning portfolio
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Chrome Extension</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Instant Setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              AI-Powered Job Application Tools
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Automate and optimize your job search with intelligent assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-orange-600 mb-4 flex justify-center">
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

        {/* Portfolio Section */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Portfolio Development
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Build a stunning portfolio that showcases your skills and projects
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  title: "Custom Design",
                  description: "Personalized layouts that reflect your unique brand and style",
                  icon: <Palette className="w-8 h-8" />
                },
                {
                  title: "Responsive Development",
                  description: "Mobile-first designs that look perfect on all devices",
                  icon: <Code className="w-8 h-8" />
                },
                {
                  title: "SEO Optimization",
                  description: "Built for search engines to help recruiters find you",
                  icon: <Target className="w-8 h-8" />
                },
                {
                  title: "Domain & Hosting",
                  description: "Professional domain setup and reliable hosting included",
                  icon: <Globe className="w-8 h-8" />
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="text-purple-600 mb-4 flex justify-center">
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

            {/* Portfolio Examples */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Business Analyst Portfolio",
                  industry: "Data & Analytics",
                  description: "Clean, professional design showcasing data visualization projects and analytical insights",
                  image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  features: ["Interactive Dashboards", "Case Studies", "Data Visualizations", "Technical Skills"]
                },
                {
                  title: "Software Developer Portfolio", 
                  industry: "Technology",
                  description: "Modern, tech-focused design highlighting coding projects and technical expertise",
                  image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                  features: ["GitHub Integration", "Live Project Demos", "Tech Stack Display", "Code Samples"]
                },
                {
                  title: "Business Development Portfolio",
                  industry: "Sales & Marketing", 
                  description: "Results-driven design emphasizing achievements and business growth metrics",
                  image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80",
                  features: ["Revenue Metrics", "Client Testimonials", "Success Stories", "Industry Awards"]
                }
              ].map((example, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={example.image} 
                      alt={example.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {example.industry}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {example.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {example.description}
                    </p>
                    <div className="space-y-2">
                      {example.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Portfolio CTA */}
            <div className="text-center mt-12">
              <button
                onClick={() => window.location.href = '/portfolio-templates'}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center justify-center gap-2 text-lg"
              >
                View Portfolio Templates
                <Star className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preparation Strategy */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Quick Setup Strategy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Get your AI assistant ready in 4 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {preparationStrategy.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
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

        {/* AI Package */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our AI Assistant & Portfolio Service
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete AI-powered job application toolkit with professional portfolio development
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {aiPackage.title}
                  </h3>
                  <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {aiPackage.duration}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 text-center text-lg">{aiPackage.description}</p>

                <div className="space-y-4 mb-8">
                  {aiPackage.includes.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <WhatsAppCTA label="AI Assistant & Portfolio Setup" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Supercharge Your Job Search?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands using AI to land interviews faster and more effectively
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WhatsAppCTA label="AI Assistant Setup" />
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default AIAssistant;
