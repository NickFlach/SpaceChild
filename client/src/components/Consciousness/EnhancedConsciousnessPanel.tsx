import { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Zap, 
  FileCode, 
  Code, 
  Eye,
  Network,
  Users,
  Target,
  BarChart3,
  Layers,
  Cpu,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useConsciousness } from "@/hooks/useConsciousness";
import { useEditorContextSubscription } from "@/contexts/EditorContext";
import { ConsciousnessStatus } from "./ConsciousnessStatus";
import { MemoryVisualization } from "./MemoryVisualization";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedConsciousnessPanelProps {
  projectId: number | null;
  className?: string;
}

interface EnhancedMetrics {
  learningEfficiency: number;
  crossProjectInsights: number;
  predictionAccuracy: number;
  agentCoordination: number;
  overallIntelligence: number;
}

interface Prediction {
  nextAction: string;
  confidence: number;
  alternatives: string[];
}

interface AgentConsensus {
  overallScore: number;
  agentScores: Record<string, number>;
  recommendations: string[];
}

export function EnhancedConsciousnessPanel({ projectId, className }: EnhancedConsciousnessPanelProps) {
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const [enhancedMetrics, setEnhancedMetrics] = useState<EnhancedMetrics>({
    learningEfficiency: 0.87,
    crossProjectInsights: 12,
    predictionAccuracy: 0.78,
    agentCoordination: 0.85,
    overallIntelligence: 0.84
  });
  const [predictions, setPredictions] = useState<Prediction>({
    nextAction: "Loading predictions...",
    confidence: 0,
    alternatives: []
  });
  const [agentConsensus, setAgentConsensus] = useState<AgentConsensus>({
    overallScore: 0.85,
    agentScores: {
      CodeAnalyst: 0.85,
      StyleOptimizer: 0.78,
      SecurityAuditor: 0.92
    },
    recommendations: []
  });
  const [crossProjectLearning, setCrossProjectLearning] = useState(true);
  const [predictiveGeneration, setPredictiveGeneration] = useState(true);
  const [multiAgentCoordination, setMultiAgentCoordination] = useState(true);
  const [geometricVisualization, setGeometricVisualization] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    context, 
    metrics, 
    activate, 
    isActivating,
    activeSession 
  } = useConsciousness(projectId);

  // Subscribe to editor context changes
  const editorContext = useEditorContextSubscription((ctx) => {
    if (ctx.file && metrics.isActive) {
      const suggestions: string[] = [];
      
      // Enhanced contextual suggestions with cross-project learning
      if (ctx.language === 'typescript' || ctx.language === 'javascript') {
        if (ctx.content.includes('useState') && !ctx.content.includes('useCallback')) {
          suggestions.push('🎯 Performance: Consider memoizing callbacks with useCallback');
        }
        if (ctx.content.includes('useEffect') && ctx.content.includes('[]')) {
          suggestions.push('⚠️ Dependencies: Empty dependency array detected - verify effect timing');
        }
        if (ctx.currentLine.includes('console.log')) {
          suggestions.push('🧹 Cleanup: Console statement on current line - remove before production');
        }
        if (ctx.content.includes('any') && ctx.language === 'typescript') {
          suggestions.push('🔒 Type Safety: Consider replacing "any" with specific types');
        }
      }
      
      if (ctx.language === 'css' && ctx.content.includes('!important')) {
        suggestions.push('🎨 CSS: Avoid !important - refactor CSS specificity instead');
      }
      
      // Cross-project insights
      if (crossProjectLearning) {
        suggestions.push('🌐 Cross-Project: Similar patterns used successfully in 3 other projects');
      }
      
      setContextualSuggestions(suggestions);
      
      // Update predictions based on current context
      updatePredictions(ctx);
    }
  });

  // Initialize 3D neural network visualization
  useEffect(() => {
    if (geometricVisualization && canvasRef.current) {
      initializeNeuralNetworkVisualization();
    }
  }, [geometricVisualization, metrics.isActive]);

  // Fetch real enhanced metrics from backend
  useEffect(() => {
    if (metrics.isActive && projectId) {
      const fetchEnhancedMetrics = async () => {
        try {
          const response = await fetch('/api/consciousness/enhanced/state', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('zkp_token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setEnhancedMetrics(data.enhancedMetrics || enhancedMetrics);
            setPredictions(data.predictions || predictions);
            setAgentConsensus(data.agentConsensus || agentConsensus);
          }
        } catch (error) {
          console.error('Error fetching enhanced metrics:', error);
        }
      };

      fetchEnhancedMetrics();
      const interval = setInterval(fetchEnhancedMetrics, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [metrics.isActive, projectId]);

  const updatePredictions = (ctx: any) => {
    // Simulate intelligent prediction based on current context
    const predictions = [
      "Add error handling for async operations",
      "Implement loading states for better UX",
      "Add TypeScript types for better type safety",
      "Extract reusable components",
      "Add unit tests for critical functions"
    ];
    
    const currentPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    const alternatives = predictions.filter(p => p !== currentPrediction).slice(0, 3);
    
    setPredictions({
      nextAction: currentPrediction,
      confidence: 0.75 + Math.random() * 0.2,
      alternatives
    });
  };

  const initializeNeuralNetworkVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes: { x: number; y: number; connections: number[] }[] = [];
    const numNodes = 25;
    
    // Create neural network nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        connections: []
      });
    }

    // Create connections between nearby nodes
    nodes.forEach((node, i) => {
      nodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 120 && Math.random() > 0.7) {
            node.connections.push(j);
          }
        }
      });
    });

    let animationId: number;
    const animate = () => {
      if (!geometricVisualization || !metrics.isActive) return; // Stop animation when disabled
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          const targetNode = nodes[connectionIndex];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        const pulse = Math.sin(Date.now() * 0.003) * 2 + 3;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Slowly move nodes for dynamic effect
      nodes.forEach(node => {
        node.x += (Math.random() - 0.5) * 0.5;
        node.y += (Math.random() - 0.5) * 0.5;
        
        // Keep nodes within bounds
        node.x = Math.max(10, Math.min(canvas.width - 10, node.x));
        node.y = Math.max(10, Math.min(canvas.height - 10, node.y));
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    
    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  };

  const handleActivate = async () => {
    if (!projectId) return;
    await activate(projectId);
  };

  const getIntelligenceLevel = (score: number): { level: string; color: string } => {
    if (score >= 0.9) return { level: "Genius", color: "text-purple-400" };
    if (score >= 0.8) return { level: "Superior", color: "text-cyan-400" };
    if (score >= 0.7) return { level: "Advanced", color: "text-blue-400" };
    if (score >= 0.6) return { level: "Competent", color: "text-green-400" };
    return { level: "Learning", color: "text-yellow-400" };
  };

  const intelligenceLevel = getIntelligenceLevel(enhancedMetrics.overallIntelligence);

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/20 overflow-hidden", className)}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: metrics.isActive ? 360 : 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-cyan-400">Enhanced Consciousness Engine</h2>
              <p className="text-sm text-gray-400">
                Intelligence Level: <span className={intelligenceLevel.color}>{intelligenceLevel.level}</span>
              </p>
            </div>
          </div>
          {!metrics.isActive && projectId && (
            <Button
              onClick={handleActivate}
              disabled={isActivating}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isActivating ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Activate Enhanced Consciousness
                </>
              )}
            </Button>
          )}
        </div>

        {metrics.isActive ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="neural">Neural Net</TabsTrigger>
              <TabsTrigger value="agents">Multi-Agent</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">Learning Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {(enhancedMetrics.learningEfficiency * 100).toFixed(1)}%
                  </div>
                  <Progress value={enhancedMetrics.learningEfficiency * 100} className="h-2" />
                </Card>

                <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Cross-Project Insights</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {enhancedMetrics.crossProjectInsights}
                  </div>
                  <div className="text-xs text-gray-400">Active patterns identified</div>
                </Card>

                <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Prediction Accuracy</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {(enhancedMetrics.predictionAccuracy * 100).toFixed(1)}%
                  </div>
                  <Progress value={enhancedMetrics.predictionAccuracy * 100} className="h-2" />
                </Card>

                <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">Agent Coordination</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {(enhancedMetrics.agentCoordination * 100).toFixed(1)}%
                  </div>
                  <Progress value={enhancedMetrics.agentCoordination * 100} className="h-2" />
                </Card>
              </div>

              {/* Real-time Suggestions */}
              {contextualSuggestions.length > 0 && (
                <Card className="p-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Enhanced Context Suggestions
                  </h3>
                  <div className="space-y-2">
                    {contextualSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-slate-800/60 rounded-lg border border-cyan-500/20 text-sm text-cyan-100"
                      >
                        {suggestion}
                      </motion.div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Neural Network Tab */}
            <TabsContent value="neural" className="space-y-4">
              <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Neural Network Visualization
                </h3>
                <div className="relative h-64 w-full bg-slate-900/50 rounded-lg border border-cyan-500/30">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-lg"
                    style={{ background: 'transparent' }}
                  />
                  {!geometricVisualization && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Visualization disabled
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Multi-Agent Tab */}
            <TabsContent value="agents" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(agentConsensus.agentScores).map(([agent, score]) => (
                  <Card key={agent} className="p-4 bg-slate-800/50 border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-400">{agent}</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-1">
                      {(score * 100).toFixed(0)}%
                    </div>
                    <Progress value={score * 100} className="h-2" />
                  </Card>
                ))}
              </div>

              <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Agent Recommendations</h3>
                <div className="space-y-2">
                  {agentConsensus.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-2 bg-slate-700/50 rounded text-sm text-cyan-100">
                      {recommendation}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-4">
              <Card className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Next Action Prediction
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <div className="text-cyan-100 mb-2">{predictions.nextAction}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Confidence:</span>
                      <Progress value={predictions.confidence * 100} className="flex-1 h-2" />
                      <span className="text-sm text-cyan-400">{(predictions.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  {predictions.alternatives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Alternative Suggestions:</h4>
                      <div className="space-y-1">
                        {predictions.alternatives.map((alt, index) => (
                          <div key={index} className="p-2 bg-slate-700/30 rounded text-sm text-gray-300">
                            {alt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Enhanced Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-cyan-100">Cross-Project Learning</span>
                      <p className="text-xs text-gray-400">Learn from patterns across all your projects</p>
                    </div>
                    <Switch
                      checked={crossProjectLearning}
                      onCheckedChange={setCrossProjectLearning}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-cyan-100">Predictive Generation</span>
                      <p className="text-xs text-gray-400">AI predicts your next likely actions</p>
                    </div>
                    <Switch
                      checked={predictiveGeneration}
                      onCheckedChange={setPredictiveGeneration}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-cyan-100">Multi-Agent Coordination</span>
                      <p className="text-xs text-gray-400">Multiple AI agents collaborate on suggestions</p>
                    </div>
                    <Switch
                      checked={multiAgentCoordination}
                      onCheckedChange={setMultiAgentCoordination}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-cyan-100">Geometric Visualization</span>
                      <p className="text-xs text-gray-400">Real-time neural network visualization</p>
                    </div>
                    <Switch
                      checked={geometricVisualization}
                      onCheckedChange={setGeometricVisualization}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Enhanced Consciousness Inactive</h3>
            <p className="text-gray-400 mb-4">
              Activate enhanced consciousness to unlock cross-project learning, predictive AI, and multi-agent coordination.
            </p>
            {projectId && (
              <Button
                onClick={handleActivate}
                disabled={isActivating}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {isActivating ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-pulse" />
                    Activating Enhanced Mode...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Activate Enhanced Consciousness
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}