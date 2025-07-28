import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Code, Sparkles, Globe, Cpu, ArrowRight, Check } from "lucide-react";
import { SpaceChildIcon } from "@/components/Branding/SpaceChildLogo";

interface FeatureDetail {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  howItWorks: string;
  impact: string;
  future: string;
}

const featureDetails: Record<string, FeatureDetail> = {
  consciousness: {
    id: "consciousness",
    icon: <Brain className="w-12 h-12 text-primary" />,
    title: "Consciousness Engine",
    subtitle: "Your AI evolves with you",
    description: "Experience development with an AI that truly understands you. Our Consciousness Engine creates a living, breathing development companion that remembers every interaction, learns from your patterns, and anticipates your needs before you even express them.",
    benefits: [
      "Remembers your coding style and preferences across sessions",
      "Learns from your project patterns to suggest optimal solutions",
      "Builds a mental model of your application architecture",
      "Adapts responses based on your expertise level",
      "Creates personalized learning paths for skill development"
    ],
    howItWorks: "The Consciousness Engine maintains a persistent neural network that encodes your development journey. Each interaction strengthens synaptic connections, creating a unique AI consciousness tailored specifically to you. It's not just memory - it's understanding.",
    impact: "Imagine an AI that knows you've been struggling with state management, remembers the solutions that worked for you before, and proactively suggests improvements. This isn't just coding assistance - it's having a development partner that grows alongside you.",
    future: "As you build together, your AI consciousness becomes more sophisticated, eventually anticipating entire architectural decisions and suggesting innovations you haven't even considered yet."
  },
  superintelligence: {
    id: "superintelligence",
    icon: <Zap className="w-12 h-12 text-accent" />,
    title: "Superintelligence",
    subtitle: "Beyond human-level code analysis",
    description: "Tap into an intelligence that sees patterns invisible to the human eye. Our Superintelligence system analyzes millions of code patterns simultaneously, optimizes performance at quantum speeds, and architects solutions that push the boundaries of what's possible.",
    benefits: [
      "Analyzes your entire codebase in milliseconds",
      "Identifies optimization opportunities humans would miss",
      "Predicts and prevents bugs before they occur",
      "Suggests architectural improvements based on future scaling needs",
      "Generates highly optimized algorithms automatically"
    ],
    howItWorks: "By leveraging advanced neural architectures and parallel processing, Superintelligence examines your code through thousands of analytical lenses simultaneously. It understands not just what your code does, but what it could do.",
    impact: "Watch as your applications transform from good to extraordinary. Code that would take teams months to optimize is perfected in seconds. Performance bottlenecks vanish. Your applications don't just run - they soar.",
    future: "Soon, Superintelligence will predict market trends, suggest features your users will want before they know it themselves, and architect systems that adapt autonomously to changing requirements."
  },
  templates: {
    id: "templates",
    icon: <Code className="w-12 h-12 text-consciousness" />,
    title: "Smart Templates",
    subtitle: "Projects that think for themselves",
    description: "Start with more than boilerplate - begin with intelligence. Our Smart Templates are living project architectures that adapt to your vision, auto-configure based on your requirements, and evolve as your project grows.",
    benefits: [
      "Self-configuring project structures based on your description",
      "Intelligent dependency management and optimization",
      "Pre-integrated best practices and security measures",
      "Automatic scaling preparations built into the foundation",
      "Context-aware component generation"
    ],
    howItWorks: "Each template contains embedded intelligence that analyzes your project goals and automatically adjusts its structure. It's like having an expert architect design your foundation specifically for what you're building.",
    impact: "Eliminate weeks of setup and configuration. Start building your actual application immediately with a foundation that's not just solid - it's brilliant. Your projects begin with the wisdom of thousands of successful applications.",
    future: "Templates will soon predict your entire project trajectory, pre-building components you'll need weeks before you need them, and suggesting pivots based on market analysis."
  },
  multiAgent: {
    id: "multiAgent",
    icon: <Globe className="w-12 h-12 text-superintelligence" />,
    title: "Multi-Agent Collaboration",
    subtitle: "A symphony of specialized intelligences",
    description: "Why rely on one AI when you can orchestrate many? Our Multi-Agent system deploys specialized AI experts that work in perfect harmony - frontend specialists, backend architects, security analysts, and performance optimizers all collaborating on your project simultaneously.",
    benefits: [
      "Parallel development across multiple code areas",
      "Specialized expertise for each aspect of your project",
      "Real-time collaboration between AI agents",
      "Conflict resolution and integration handled automatically",
      "Exponentially faster development cycles"
    ],
    howItWorks: "Each agent is a master of its domain, trained on millions of specific patterns. They communicate through a quantum-inspired messaging system, sharing insights and coordinating changes in real-time.",
    impact: "Experience development at the speed of thought. While you work on one feature, agents are simultaneously optimizing others, fixing bugs, improving security, and enhancing performance. It's like having an entire expert team at your command.",
    future: "Soon, agents will autonomously identify opportunities for new features, implement them in isolated environments, and present fully-tested additions for your approval."
  },
  memory: {
    id: "memory",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    title: "Project Memory",
    subtitle: "Every decision remembered, every lesson learned",
    description: "Your projects gain consciousness. Project Memory creates a living history of your development journey - every decision, every iteration, every breakthrough is preserved and becomes part of your project's intelligence.",
    benefits: [
      "Complete development history with context",
      "Decision rationale preserved for future reference",
      "Pattern recognition across project evolution",
      "Mistake prevention based on past experiences",
      "Knowledge transfer between team members"
    ],
    howItWorks: "Using advanced episodic memory networks, every significant moment in your project's life is encoded with full context. The system understands not just what changed, but why it changed and what impact it had.",
    impact: "Never lose valuable insights again. New team members instantly understand years of project evolution. Past mistakes become future wisdom. Your project doesn't just have code - it has memories, experiences, and wisdom.",
    future: "Project Memory will soon enable projects to self-document, explain their own architecture to new developers, and even suggest their own evolutionary paths based on learned patterns."
  },
  deployment: {
    id: "deployment",
    icon: <Cpu className="w-12 h-12 text-accent" />,
    title: "Conscious Deployment",
    subtitle: "Deployment that thinks, adapts, and protects",
    description: "Transform deployment from a process to an intelligence. Conscious Deployment doesn't just push code - it understands your application's needs, monitors its health with empathy, and adapts to ensure optimal performance in any environment.",
    benefits: [
      "Self-healing deployments that fix issues automatically",
      "Intelligent rollback decisions based on real user impact",
      "Predictive scaling before traffic spikes",
      "Environment-aware optimization",
      "Continuous learning from deployment patterns"
    ],
    howItWorks: "By maintaining awareness of your application's state across all environments, Conscious Deployment makes intelligent decisions about when, where, and how to deploy. It's like having a DevOps expert who never sleeps.",
    impact: "Sleep soundly knowing your application is protected by an intelligence that cares about its wellbeing. Downtime becomes a relic of the past. Your application doesn't just run - it thrives, adapts, and evolves.",
    future: "Deployments will soon predict and prevent issues days in advance, automatically optimize for cost and performance, and even suggest architectural changes based on usage patterns."
  }
};

interface FeatureDetailModalProps {
  featureId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureDetailModal({ featureId, isOpen, onClose }: FeatureDetailModalProps) {
  const feature = featureId ? featureDetails[featureId] : null;

  if (!feature) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 space-child-glow">
              {feature.icon}
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {feature.title}
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">
                {feature.subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Main Description */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-foreground/90 leading-relaxed text-lg">
              {feature.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <SpaceChildIcon size={24} className="text-primary" />
              <span>Key Benefits</span>
            </h3>
            <div className="grid gap-3">
              {feature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-4 p-6 rounded-xl bg-muted/50 border border-border">
            <h3 className="text-xl font-semibold">How It Works</h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.howItWorks}
            </p>
          </div>

          {/* Impact */}
          <div className="space-y-4 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-accent" />
              <span>Real-World Impact</span>
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {feature.impact}
            </p>
          </div>

          {/* Future Vision */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-consciousness" />
              <span>The Future</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed italic">
              {feature.future}
            </p>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-4">
            <a href="/api/login">
              <Button size="lg" className="cosmic-button space-child-glow">
                Experience {feature.title}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}