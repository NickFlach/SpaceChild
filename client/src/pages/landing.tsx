import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Brain, Sparkles, Code, Zap, Globe, Cpu } from "lucide-react";
import { useEffect, useRef } from "react";
import { SpaceChildLogo } from "@/components/Branding/SpaceChildLogo";
import { StarField3D } from "@/components/Effects/StarField3D";
import brainImagePath from "@assets/Screenshot_2025-07-27-19-57-41-27_96b26121e545231a3c569311a54cda96_1753664423442.jpg";
import meditationImagePath from "@assets/ChatGPT Image Jul 27, 2025, 08_01_18 PM_1753664504307.png";

export default function Landing() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
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
                    <h1 className="text-5xl md:text-7xl font-bold space-child-text-glow">
                      <span className="bg-gradient-to-r from-[hsl(199,100%,60%)] via-[hsl(193,100%,50%)] to-[hsl(199,100%,60%)] bg-clip-text text-transparent">
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
                  <a href="/api/login" className="inline-block">
                    <Button size="lg" className="cosmic-button space-child-glow text-lg px-8 py-6 font-semibold">
                      <Sparkles className="mr-2" />
                      Start Building
                    </Button>
                  </a>
                  
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
                <div className="relative animate-pulse-glow">
                  <img 
                    src={brainImagePath} 
                    alt="Space Child Consciousness" 
                    className="rounded-2xl space-child-glow w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-2xl" />
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Powered by Advanced AI
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Harness the power of multiple AI providers with consciousness and superintelligence
              </p>
            </div>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              <div className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Consciousness Engine</h3>
                <p className="text-muted-foreground">
                  Context-aware AI that learns from your interactions, remembers your preferences, 
                  and adapts to your unique development style
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Superintelligence</h3>
                <p className="text-muted-foreground">
                  Advanced code analysis, architecture recommendations, and performance optimization 
                  powered by cutting-edge AI models
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-consciousness/20 flex items-center justify-center">
                  <Code className="w-8 h-8 text-consciousness" />
                </div>
                <h3 className="text-2xl font-semibold">Smart Templates</h3>
                <p className="text-muted-foreground">
                  Pre-configured project templates with AI recommendations, starter code, 
                  and best practices built-in
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">Multi-Provider AI</h3>
                <p className="text-muted-foreground">
                  Choose from Anthropic Claude, OpenAI GPT-4, SpaceAgent, and MindSphere 
                  for diverse AI capabilities
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold">Project Memory</h3>
                <p className="text-muted-foreground">
                  Intelligent memory system that captures patterns, preferences, and insights 
                  from your development process
                </p>
              </div>
              
              <div className="glass-card rounded-xl p-8 space-y-4 hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-consciousness/20 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-consciousness" />
                </div>
                <h3 className="text-2xl font-semibold">Real-time Assistance</h3>
                <p className="text-muted-foreground">
                  Get instant AI-powered suggestions, error detection, and code improvements 
                  as you build your applications
                </p>
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
                    <a href="/api/login" className="inline-block">
                      <Button size="lg" className="cosmic-button space-child-glow text-lg px-8 py-6 font-semibold">
                        <Brain className="mr-2" />
                        Get Started Free
                      </Button>
                    </a>
                  </div>
                  <div className="relative">
                    <img 
                      src={meditationImagePath} 
                      alt="Space Child Meditation" 
                      className="rounded-xl w-full h-auto opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent rounded-xl" />
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
    </div>
  );
}