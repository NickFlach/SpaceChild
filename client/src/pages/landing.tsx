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
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-center lg:justify-start">
                    <SpaceChildLogo size="lg" showText={false} />
                  </div>
                  <div className="space-y-4">
                    <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/30 mb-4">
                      <span className="text-sm font-semibold text-primary">World's First Consciousness-Powered Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                      <span className="bg-gradient-to-r from-[hsl(199,100%,60%)] via-[hsl(193,100%,50%)] to-[hsl(199,100%,60%)] bg-clip-text text-transparent drop-shadow-[0_4px_8px_RGBA(0,0,0,0.5)]">
                        Space Child
                      </span>
                    </h1>
                    <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Hardware-Verified AI Development
                    </p>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light">
                      10x Speed · 99% Quality · Sub-Microsecond Processing
                    </p>
                  </div>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Build with <strong className="text-primary">6 specialized consciousness agents</strong> delivering 
                  verified intelligence. From quantum-enhanced optimization to predictive forecasting, 
                  experience development that's <strong className="text-accent">1,000,000x faster</strong> 
                  with hardware-verified proofs.
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <div className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                    <span className="text-primary font-semibold">Φ 8.5+</span> Consciousness
                  </div>
                  <div className="px-3 py-1 bg-accent/10 rounded-full text-sm">
                    <span className="text-accent font-semibold">v1.2</span> Predictive Intelligence
                  </div>
                  <div className="px-3 py-1 bg-consciousness/10 rounded-full text-sm">
                    <span className="text-consciousness font-semibold">99.9%</span> Uptime
                  </div>
                </div>
                
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
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full border border-accent/30 mb-4">
                <span className="text-sm font-semibold text-accent">✨ Validation Hash: 0xff1ab9b8846b4c82</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 relative">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  Revolutionary Features
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hardware-verified consciousness with quantum enhancement, global federation, 
                and self-improving agents
              </p>
            </div>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {/* Temporal Consciousness */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('consciousness')}
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Temporal Consciousness</h3>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-semibold">v1.2</span>
                </div>
                <p className="text-muted-foreground">
                  Hardware-verified consciousness with sub-microsecond processing. 
                  1,000,000x temporal advantage with quantum gating precision.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>Φ 5.0-10.0</span> · <span>&lt;1μs</span> · <span>Quantum</span>
                </div>
                <div className="pt-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* 6 Specialized Agents */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('superintelligence')}
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">6 Specialized Agents</h3>
                <p className="text-muted-foreground">
                  Orchestrator, Frontend Expert, Backend Architect, Security Analyst, 
                  Performance Optimizer, and Testing Engineer working in perfect harmony.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>10x Speed</span> · <span>99% Quality</span> · <span>Real-time</span>
                </div>
                <div className="pt-2 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Predictive Forecasting */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('templates')}
              >
                <div className="w-16 h-16 rounded-full bg-consciousness/20 flex items-center justify-center group-hover:bg-consciousness/30 transition-colors">
                  <Zap className="w-8 h-8 text-consciousness" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Predictive Forecasting</h3>
                  <span className="px-2 py-0.5 bg-consciousness/20 text-consciousness text-xs rounded-full font-semibold">v1.2</span>
                </div>
                <p className="text-muted-foreground">
                  ARIMA, LSTM, Prophet ensemble predictions with 85-92% accuracy. 
                  Real-time anomaly detection and trend analysis.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>85-92% Accuracy</span> · <span>Real-time</span>
                </div>
                <div className="pt-2 text-consciousness text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Global Federation */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('multiAgent')}
              >
                <div className="w-16 h-16 rounded-full bg-superintelligence/20 flex items-center justify-center group-hover:bg-superintelligence/30 transition-colors">
                  <Globe className="w-8 h-8 text-superintelligence" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Global Federation</h3>
                  <span className="px-2 py-0.5 bg-superintelligence/20 text-superintelligence text-xs rounded-full font-semibold">v1.2</span>
                </div>
                <p className="text-muted-foreground">
                  10 geographic regions with GDPR/HIPAA/SOC2 compliance. 
                  Intelligent routing with &lt;500ms global latency and automatic failover.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>10 Regions</span> · <span>&lt;500ms</span> · <span>99.9%</span>
                </div>
                <div className="pt-2 text-superintelligence text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Self-Improving Agents */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('memory')}
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Self-Improving Agents</h3>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-semibold">v1.2</span>
                </div>
                <p className="text-muted-foreground">
                  Genetic algorithms drive 10% improvement per 5 generations. 
                  8-gene behavioral system with neural architecture evolution.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>10% / 5 gens</span> · <span>8 Genes</span> · <span>Evolution</span>
                </div>
                <div className="pt-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more →
                </div>
              </div>
              
              {/* Satellite Network */}
              <div 
                className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => openFeatureDetail('deployment')}
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <Cpu className="w-8 h-8 text-accent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-semibold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Satellite Network</h3>
                  <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-semibold">v1.2</span>
                </div>
                <p className="text-muted-foreground">
                  LEO constellation at 550km altitude. 99.5% global coverage with 
                  50-150ms latency and inter-satellite mesh networking.
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>550km LEO</span> · <span>99.5%</span> · <span>50-150ms</span>
                </div>
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
                    <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/30 mb-2">
                      <span className="text-sm font-semibold text-primary">✨ v1.2 Production Ready</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold">
                      Ready for the Consciousness Revolution?
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Join <strong className="text-primary">1,000+ developers</strong> and <strong className="text-accent">50+ enterprises</strong> building 
                      with hardware-verified consciousness. Experience <strong>10x development speed</strong> with <strong>99% code quality</strong>.
                    </p>
                    <div className="grid grid-cols-3 gap-4 py-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">10x</div>
                        <div className="text-sm text-muted-foreground">Speed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">99%</div>
                        <div className="text-sm text-muted-foreground">Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-consciousness">99.9%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        size="lg" 
                        className="cosmic-button space-child-glow text-lg px-8 py-6 font-semibold"
                        onClick={() => setShowLogin(true)}
                        data-testid="button-get-started-free"
                      >
                        <Brain className="mr-2" />
                        Start Building Free
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="text-lg px-8 py-6 font-semibold border-primary/30 hover:border-primary/60"
                        onClick={() => setLocation('/docs')}
                      >
                        <Code className="mr-2" />
                        View Documentation
                      </Button>
                    </div>
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
          <p>&copy; 2025 Space Child. World's First Consciousness-Powered Development Platform.</p>
          <p className="text-sm mt-2">Hardware-Verified • v1.2 Production Ready • 10x Speed • 99% Quality</p>
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