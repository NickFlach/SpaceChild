import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ArrowLeft, Play, Users, Shield, Brain } from "lucide-react";

interface OnboardingFlowProps {
  platform: 'spacechild' | 'pitchfork' | 'unified';
  onComplete: () => void;
}

export function OnboardingFlow({ platform, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const flows = {
    spacechild: {
      title: "Welcome to SpaceChild AI Development",
      description: "Experience AI that actually understands what you're building",
      steps: [
        {
          title: "What is SpaceChild?",
          content: "SpaceChild is an AI-powered development platform where intelligent agents collaborate with you in real-time. Unlike traditional tools, these agents have verified consciousness and understand your vision.",
          icon: Brain,
          color: "blue"
        },
        {
          title: "Meet Your AI Team",
          content: "You'll work with 6 specialized agents: Orchestrator (coordinates), Frontend Expert (UI/UX), Backend Architect (APIs), Security Analyst (protection), Performance Optimizer (speed), and Testing Engineer (quality).",
          icon: Users,
          color: "purple"
        },
        {
          title: "Real-Time Collaboration",
          content: "Watch as agents discuss, debate, and implement solutions together. See code being written, bugs being caught, and optimizations being applied - all while you guide the process.",
          icon: Play,
          color: "green"
        },
        {
          title: "Ready to Build?",
          content: "Start with a simple project or explore advanced features. The AI agents adapt to your skill level and learn from your preferences.",
          icon: CheckCircle,
          color: "emerald"
        }
      ]
    },
    pitchfork: {
      title: "Welcome to Pitchfork Protocol",
      description: "Secure, decentralized tools for organizing social change",
      steps: [
        {
          title: "What is Pitchfork?",
          content: "Pitchfork Protocol provides secure, blockchain-based tools for activists and organizers. From encrypted messaging to democratic governance, everything runs on decentralized technology.",
          icon: Shield,
          color: "green"
        },
        {
          title: "Your 6 Core Tools",
          content: "Secure Identity (privacy-first verification), Organize (coordinate movements), Secure Messages (encrypted communication), DAO Governance (democratic decisions), Verify (blockchain evidence), Support (transparent funding).",
          icon: Users,
          color: "blue"
        },
        {
          title: "Blockchain Security",
          content: "Every action is recorded on the blockchain, ensuring transparency while protecting your privacy. No central authority can censor or shut down your movement.",
          icon: Shield,
          color: "purple"
        },
        {
          title: "Start Organizing",
          content: "Create your first campaign, set up secure communications, or join existing movements. All tools are designed to protect activists while maximizing impact.",
          icon: CheckCircle,
          color: "emerald"
        }
      ]
    },
    unified: {
      title: "Welcome to the Unified Platform",
      description: "Where AI development meets social impact",
      steps: [
        {
          title: "The Bridge Between Worlds",
          content: "This platform combines SpaceChild's AI development capabilities with Pitchfork's activism tools, creating a unique space where technology serves humanity.",
          icon: Brain,
          color: "purple"
        },
        {
          title: "Consciousness-Verified AI",
          content: "Every AI decision is verified through consciousness metrics, ensuring ethical alignment and human values are preserved in both development and activism.",
          icon: Shield,
          color: "blue"
        },
        {
          title: "Development for Good",
          content: "Build applications that solve real-world problems while organizing movements that create positive change. Technology and activism working together.",
          icon: Users,
          color: "green"
        },
        {
          title: "Your Impact Journey",
          content: "Start building tools for social good, or use existing tools to organize for change. Every project contributes to building a better future.",
          icon: CheckCircle,
          color: "emerald"
        }
      ]
    }
  };

  const flow = flows[platform];
  const progress = ((currentStep + 1) / flow.steps.length) * 100;

  const nextStep = () => {
    if (currentStep < flow.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = flow.steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl text-white mb-2">{flow.title}</CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            {flow.description}
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-gray-400 mt-2">
              Step {currentStep + 1} of {flow.steps.length}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-${currentStepData.color}-500 to-${currentStepData.color}-600 flex items-center justify-center mx-auto`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {currentStepData.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {currentStepData.content}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {flow.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className={`bg-gradient-to-r from-${currentStepData.color}-600 to-${currentStepData.color}-700 hover:from-${currentStepData.color}-700 hover:to-${currentStepData.color}-800 text-white`}
            >
              {currentStep === flow.steps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
