
import { Briefcase, CheckCircle, Star, Clock, Target, Code, Globe, Palette } from 'lucide-react';
import { CompletionBadge } from '@/shared/ui/completion-badge';
import Navbar from '@/shared/components/Navbar';
import Protected from '@/shared/components/Protected';
import WhatsAppCTA from '@/shared/components/WhatsAppCTA';

const PortfolioTemplates = () => {
  const portfolioFeatures = [
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
  ];

  const portfolioExamples = [
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
    },
    {
      title: "Cybersecurity Professional",
      industry: "Security & Compliance",
      description: "Sleek, security-focused design showcasing certifications and security projects",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      features: ["Security Certifications", "Penetration Testing", "Risk Assessments", "Compliance Reports"]
    },
    {
      title: "Product Manager Portfolio",
      industry: "Product & Strategy",
      description: "Strategic design highlighting product launches and user experience focus",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      features: ["Product Roadmaps", "User Research", "Launch Metrics", "Feature Development"]
    },
    {
      title: "Creative Professional",
      industry: "Design & Media",
      description: "Visually stunning design showcasing creative work and artistic projects",
      image: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      features: ["Portfolio Gallery", "Creative Process", "Client Work", "Design Tools"]
    }
  ];

  const portfolioPackage = {
    title: "Professional Portfolio Development",
    duration: "5-7 days",
    description: "Complete portfolio website with custom design and professional hosting",
    includes: [
      "Custom portfolio website design",
      "Mobile-responsive development",
      "Professional domain setup",
      "1-year hosting included",
      "SEO optimization",
      "Contact form integration",
      "Portfolio template selection",
      "Content organization guidance",
      "Launch support & training"
    ]
  };

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 p-4 rounded-full">
                  <Briefcase className="w-12 h-12" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  Portfolio Development
                </h1>
                <CompletionBadge serviceId="portfolio-templates" />
              </div>
              <p className="text-xl md:text-2xl mb-8 text-purple-100">
                Build a stunning portfolio that showcases your skills and projects
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Custom Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Professional Hosting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Examples */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Portfolio Examples by Industry
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how we create stunning portfolios tailored to different professions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {portfolioExamples.map((example, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
        </div>

        {/* Portfolio Features */}
        <div className="bg-white dark:bg-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                What We Include
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need for a professional online presence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {portfolioFeatures.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
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
          </div>
        </div>

        {/* Portfolio Package */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Portfolio Development Service
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete portfolio solution to showcase your professional brand
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {portfolioPackage.title}
                  </h3>
                  <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    {portfolioPackage.duration}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 text-center text-lg">{portfolioPackage.description}</p>

                <div className="space-y-4 mb-8">
                  {portfolioPackage.includes.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 dark:text-gray-300 text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <WhatsAppCTA label="Portfolio Development" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Build Your Portfolio?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Showcase your skills with a professional portfolio that gets you noticed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WhatsAppCTA label="Portfolio Development" />
            </div>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default PortfolioTemplates;
