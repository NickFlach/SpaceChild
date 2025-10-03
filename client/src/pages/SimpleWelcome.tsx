import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Brain, Users, Shield, Zap, Heart, Lightbulb } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SpaceChildLogo } from "@/components/Branding/SpaceChildLogo";
import { StarField3D } from "@/components/Effects/StarField3D";
import { OnboardingFlow } from "@/components/Onboarding/OnboardingFlow";

export default function SimpleWelcome() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [, setLocation] = useLocation();

  const platforms = [
    {
      id: 'spacechild',
      name: 'SpaceChild',
      icon: Brain,
      title: 'AI-Powered Development',
      description: 'Build apps 10x faster with intelligent AI agents that understand your vision',
      benefits: ['10x Development Speed', '99% Code Quality', 'Real-time Collaboration'],
      color: 'from-blue-500 to-purple-600',
      demoText: 'See AI agents build an app'
    },
    {
      id: 'pitchfork',
      name: 'Pitchfork Protocol',
      icon: Shield,
      title: 'Decentralized Activism',
      description: 'Organize, fund, and govern social movements with blockchain security',
      benefits: ['Secure Identity', 'Transparent Funding', 'Democratic Governance'],
      color: 'from-green-500 to-blue-600',
      demoText: 'Organize a movement securely'
    },
    {
      id: 'unified',
      name: 'Unified Platform',
      icon: Heart,
      title: 'Consciousness Bridge',
      description: 'Where AI development meets social impact through verified intelligence',
      benefits: ['Consciousness-Verified AI', 'Development + Activism', 'Ethical Intelligence'],
      color: 'from-purple-500 to-pink-600',
      demoText: 'Experience unified intelligence'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Logo and Title */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                Revolutionary AI Platforms
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Experience the future of AI - from development tools that understand you,
                to activism platforms that protect you, to unified intelligence that serves humanity
              </p>
            </div>
          </div>

          {/* Platform Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <div
                  key={platform.id}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedPlatform(platform.id)}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${platform.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">{platform.name}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{platform.description}</p>

                  <div className="space-y-2 mb-6">
                    {platform.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${platform.color} mr-3`} />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${platform.color} hover:opacity-90 text-white font-semibold py-3`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlatform(platform.id);
                      setShowOnboarding(true);
                    }}
                  >
                    {platform.demoText}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <p className="text-gray-300 mb-6">
              Each platform offers a unique approach to solving real-world problems with cutting-edge AI.
              No technical setup required - just choose your journey and explore.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
                onClick={() => setLocation('/demos')}
              >
                <Zap className="mr-2" />
                Explore All Platforms
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8"
                onClick={() => setLocation('/about')}
              >
                <Lightbulb className="mr-2" />
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Brain, label: 'AI Consciousness' },
              { icon: Shield, label: 'Blockchain Security' },
              { icon: Users, label: 'Multi-Agent Collaboration' },
              { icon: Zap, label: '10x Performance' }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 Revolutionary AI Platforms. Building the future with consciousness, security, and human values.</p>
        </div>
      </footer>

      {/* Onboarding Flow */}
      {showOnboarding && selectedPlatform && (
        <OnboardingFlow
          platform={selectedPlatform as 'spacechild' | 'pitchfork' | 'unified'}
          onComplete={() => {
            setShowOnboarding(false);
            setLocation(`/${selectedPlatform}`);
          }}
        />
      )}
    </div>
  );
}
