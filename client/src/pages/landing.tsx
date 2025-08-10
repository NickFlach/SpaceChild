import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Brain, Sparkles, Code, Zap, Globe, Cpu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SpaceChildLogo } from "@/components/Branding/SpaceChildLogo";
import { StarField3D } from "@/components/Effects/StarField3D";
import { FeatureDetailModal } from "@/components/Landing/FeatureDetailModal";
import LoginModal from "@/components/Auth/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import brainImagePath from "@assets/Screenshot_2025-07-27-19-57-41-27_96b26121e545231a3c569311a54cda96_1753664423442.jpg";
import meditationImagePath from "@assets/ChatGPT Image Jul 27, 2025, 08_01_18 PM_1753664504307.png";

export default function Landing() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { setAuthToken } = useAuth();
  const [, setLocation] = useLocation();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openFeatureDetail = (featureId: string) => {
    setSelectedFeature(featureId);
    setIsModalOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col neural-network-bg relative overflow-hidden">
      {/* 3D Star Field Background */}
      <StarField3D />
      
      {/* Hero Section */}
      <section className="space-child-hero min-h-screen flex items-center justify-center relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-center lg:justify-start">
                    <SpaceChildLogo size="lg" showText={false} />
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold">
                      <span className="bg-gradient-to-r from-[hsl(199,100%,60%)] via-[hsl(193,100%,50%)] to-[hsl(199,100%,60%)] bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                        Space Child
                      </span>
                    </h1>
                    <p className="text-2xl md:text-3xl text-muted-foreground font-light">
                      AI-Powered App Builder with Consciousness
                    </p>
                  </div>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Experience the next evolution of development. Build intelligent applications 
                  that learn, adapt, and evolve with consciousness and superintelligence capabilities.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 font-semibold bg-primary/90 hover:bg-primary"
                    onClick={() => setShowLogin(true)}
                    data-testid="button-start-building"
                  >
                    <Sparkles className="mr-2" />
                    Start Building
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 font-semibold border-primary/30 hover:border-primary/60"
                    onClick={scrollToFeatures}
                  >
                    <Brain className="mr-2" />
                    Explore Features
                  </Button>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="relative">
                <div className="relative glass-card rounded-2xl p-1">
                  <img 
                    src={brainImagePath} 
                    alt="Space Child Consciousness" 
                    className="rounded-xl w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  Powered by Advanced AI
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Harness the power of multiple AI providers with consciousness and superintelligence
              </p>
            </div>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {/* Consciousness Engine */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('consciousness')}
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Consciousness Engine</h3>
                <p className="text-muted-foreground">
                  Context-aware AI that learns from your interactions, remembers your preferences, 
                  and adapts to your unique development style
                </p>
                <div className="pt-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Superintelligence */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('superintelligence')}
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Superintelligence</h3>
                <p className="text-muted-foreground">
                  Advanced code analysis, architecture recommendations, and performance optimization 
                  powered by cutting-edge AI models
                </p>
                <div className="pt-2 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Smart Templates */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('templates')}
              >
                <div className="w-16 h-16 rounded-full bg-consciousness/20 flex items-center justify-center group-hover:bg-consciousness/30 transition-colors">
                  <Code className="w-8 h-8 text-consciousness" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Smart Templates</h3>
                <p className="text-muted-foreground">
                  Pre-configured project templates with AI recommendations, starter code, 
                  and best practices built-in
                </p>
                <div className="pt-2 text-consciousness text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Multi-Agent Collaboration */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('multiAgent')}
              >
                <div className="w-16 h-16 rounded-full bg-superintelligence/20 flex items-center justify-center group-hover:bg-superintelligence/30 transition-colors">
                  <Globe className="w-8 h-8 text-superintelligence" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Multi-Agent Collaboration</h3>
                <p className="text-muted-foreground">
                  Multiple specialized AI agents working in harmony to build your application 
                  faster and better than ever before
                </p>
                <div className="pt-2 text-superintelligence text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Project Memory */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('memory')}
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Project Memory</h3>
                <p className="text-muted-foreground">
                  Intelligent memory system that captures patterns, preferences, and insights 
                  from your development process
                </p>
                <div className="pt-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Conscious Deployment */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('deployment')}
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Cpu className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Conscious Deployment</h3>
                <p className="text-muted-foreground">
                  Intelligent deployment that monitors, adapts, and self-heals to keep your 
                  applications running perfectly
                </p>
                <div className="pt-2 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
            </div>
            
            {/* CTA Section with Second Image */}
            <div className="relative">
              <div className="glass-card rounded-2xl p-12 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-3xl md:text-4xl font-bold">
                      Ready to Build with Consciousness?
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Join developers who are creating the next generation of intelligent applications. 
                      Experience development that evolves with you.
                    </p>
                    <Button 
                      size="lg" 
                      className="cosmic-button space-child-glow text-lg px-8 py-6 font-semibold"
                      onClick={() => setShowLogin(true)}
                      data-testid="button-get-started-free"
                    >
                      <Brain className="mr-2" />
                      Get Started Free
                    </Button>
                  </div>
                  <div className="relative glass-card rounded-xl p-1">
                    <img 
                      src={meditationImagePath} 
                      alt="Space Child Meditation" 
                      className="rounded-lg w-full h-auto"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border/50 relative z-10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Space Child. Elevating development with consciousness.</p>
        </div>
      </footer>

      {/* Feature Detail Modal */}
      <FeatureDetailModal 
        featureId={selectedFeature}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFeature(null);
        }}
      />
      
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <LoginModal 
            onSuccess={(user) => {
              setAuthToken(localStorage.getItem('zkp_token') || '');
              setShowLogin(false);
              setLocation('/'); // Navigate to dashboard
            }}
            onClose={() => setShowLogin(false)}
          />
        </div>
      )}
    </div>
  );
}