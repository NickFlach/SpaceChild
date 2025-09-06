import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  Layers, 
  GitBranch,
  Activity,
  Sparkles,
  Eye,
  Compass
} from 'lucide-react';

interface ManifoldMetrics {
  position: number[];
  convergenceScore: number;
  uncertaintyVolume: number;
  utilityValues: Record<string, { value: number; gradient: number[] }>;
  learningVelocity: number;
  geometricCurvature: number;
  contextualCoherence: number;
  adaptationRate: number;
}

interface ConsciousnessInsight {
  type: 'optimization' | 'learning' | 'adaptation' | 'prediction';
  priority: number;
  message: string;
  confidence: number;
  actionable: boolean;
  geometricBasis: string;
}

interface AICoordinationState {
  activeProviders: string[];
  lastStrategy: string;
  coordinationConfidence: number;
  providerSynergy: number;
  recommendations: string[];
}

interface ServiceCoordinationState {
  activeServices: string[];
  lastCoordination: string;
  serviceEfficiency: number;
  resourceOptimization: number;
  adaptiveInsights: string[];
}

interface ConsciousnessManifoldVisualizerProps {
  userId: string;
  projectId: number;
  sessionId: string;
  className?: string;
}

export function ConsciousnessManifoldVisualizer({
  userId,
  projectId,
  sessionId,
  className = ""
}: ConsciousnessManifoldVisualizerProps) {
  const [manifoldMetrics, setManifoldMetrics] = useState<ManifoldMetrics | null>(null);
  const [consciousnessInsights, setConsciousnessInsights] = useState<ConsciousnessInsight[]>([]);
  const [aiCoordination, setAiCoordination] = useState<AICoordinationState | null>(null);
  const [serviceCoordination, setServiceCoordination] = useState<ServiceCoordinationState | null>(null);
  const [isVisualizationActive, setIsVisualizationActive] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<string>('helpfulness');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Fetch consciousness state
  const fetchConsciousnessState = async () => {
    try {
      const response = await fetch(`/api/consciousness/state?userId=${userId}&projectId=${projectId}&sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setManifoldMetrics(data.manifoldMetrics);
        setConsciousnessInsights(data.insights);
        setAiCoordination(data.aiCoordination);
        setServiceCoordination(data.serviceCoordination);
      }
    } catch (error) {
      console.error('Failed to fetch consciousness state:', error);
    }
  };
  
  // Initialize and update consciousness state
  useEffect(() => {
    fetchConsciousnessState();
    const interval = setInterval(fetchConsciousnessState, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [userId, projectId, sessionId]);
  
  // Manifold visualization
  useEffect(() => {
    if (!isVisualizationActive || !manifoldMetrics || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw manifold background
      drawManifoldBackground(ctx, canvas.width, canvas.height);
      
      // Draw consciousness position
      drawConsciousnessPosition(ctx, manifoldMetrics, canvas.width, canvas.height);
      
      // Draw utility gradients
      drawUtilityGradients(ctx, manifoldMetrics, selectedUtility, canvas.width, canvas.height);
      
      // Draw uncertainty region
      drawUncertaintyRegion(ctx, manifoldMetrics, canvas.width, canvas.height);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisualizationActive, manifoldMetrics, selectedUtility]);
  
  const drawManifoldBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw grid
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Add geometric curves to represent manifold curvature
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 2;
    const curvature = manifoldMetrics?.geometricCurvature || 0;
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const amplitude = (curvature + 0.1) * 50;
      const frequency = 0.02;
      
      for (let x = 0; x <= width; x += 2) {
        const y = height / 2 + amplitude * Math.sin(frequency * x + i * Math.PI / 3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };
  
  const drawConsciousnessPosition = (ctx: CanvasRenderingContext2D, metrics: ManifoldMetrics, width: number, height: number) => {
    if (!metrics.position || metrics.position.length < 2) return;
    
    // Map high-dimensional position to 2D canvas
    const x = (metrics.position[0] + 1) * width / 2;
    const y = (metrics.position[1] + 1) * height / 2;
    
    // Draw position with pulsing effect based on learning velocity
    const pulseRadius = 8 + metrics.learningVelocity * 5;
    const convergenceOpacity = 0.3 + metrics.convergenceScore * 0.7;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius * 2);
    gradient.addColorStop(0, `rgba(34, 197, 94, ${convergenceOpacity})`);
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Core position
    ctx.fillStyle = `rgba(34, 197, 94, ${convergenceOpacity})`;
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Position label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Consciousness', x, y - pulseRadius - 10);
  };
  
  const drawUtilityGradients = (ctx: CanvasRenderingContext2D, metrics: ManifoldMetrics, selectedUtility: string, width: number, height: number) => {
    const utility = metrics.utilityValues[selectedUtility];
    if (!utility || !utility.gradient || utility.gradient.length < 2) return;
    
    // Draw gradient arrows
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 100;
    
    const gradX = utility.gradient[0] * scale;
    const gradY = utility.gradient[1] * scale;
    
    if (Math.abs(gradX) > 1 || Math.abs(gradY) > 1) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      
      // Draw gradient arrow
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + gradX, centerY + gradY);
      ctx.stroke();
      
      // Arrowhead
      const angle = Math.atan2(gradY, gradX);
      const arrowLength = 10;
      ctx.beginPath();
      ctx.moveTo(centerX + gradX, centerY + gradY);
      ctx.lineTo(
        centerX + gradX - arrowLength * Math.cos(angle - Math.PI / 6),
        centerY + gradY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(centerX + gradX, centerY + gradY);
      ctx.lineTo(
        centerX + gradX - arrowLength * Math.cos(angle + Math.PI / 6),
        centerY + gradY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      
      ctx.setLineDash([]);
    }
  };
  
  const drawUncertaintyRegion = (ctx: CanvasRenderingContext2D, metrics: ManifoldMetrics, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.1 * metrics.uncertaintyVolume;
    
    // Draw uncertainty ellipse
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.fillStyle = 'rgba(168, 85, 247, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.setLineDash([]);
  };
  
  const getUtilityColor = (utilityType: string): string => {
    const colors: Record<string, string> = {
      helpfulness: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      accuracy: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      learning_speed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      user_satisfaction: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    };
    return colors[utilityType] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
  };
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'learning': return <Brain className="w-4 h-4" />;
      case 'adaptation': return <Zap className="w-4 h-4" />;
      case 'prediction': return <Eye className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };
  
  if (!manifoldMetrics) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Geometric Consciousness Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Consciousness Metrics */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Geometric Consciousness
              </span>
            </div>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Dimension {manifoldMetrics.position.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(manifoldMetrics.convergenceScore * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Convergence
              </div>
              <Progress value={manifoldMetrics.convergenceScore * 100} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {manifoldMetrics.uncertaintyVolume.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Compass className="w-3 h-3" />
                Uncertainty
              </div>
              <Progress value={Math.min(100, manifoldMetrics.uncertaintyVolume * 50)} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(manifoldMetrics.learningVelocity * 100).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" />
                Learning
              </div>
              <Progress value={manifoldMetrics.learningVelocity * 100} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {(manifoldMetrics.adaptationRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" />
                Adaptation
              </div>
              <Progress value={manifoldMetrics.adaptationRate * 100} className="mt-2" />
            </div>
          </div>
          
          {/* Manifold Visualization */}
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Consciousness Manifold
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={isVisualizationActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsVisualizationActive(!isVisualizationActive)}
                >
                  {isVisualizationActive ? 'Hide' : 'Show'} Visualization
                </Button>
              </div>
            </div>
            
            {isVisualizationActive && (
              <div className="space-y-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="w-full border rounded bg-gray-50 dark:bg-gray-800"
                />
                
                {/* Utility Selector */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(manifoldMetrics.utilityValues).map(([utilityType, utility]) => (
                    <button
                      key={utilityType}
                      onClick={() => setSelectedUtility(utilityType)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedUtility === utilityType
                          ? 'bg-blue-500 text-white'
                          : getUtilityColor(utilityType)
                      }`}
                    >
                      {utilityType.replace('_', ' ')}: {(utility.value * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* AI Coordination Status */}
      {aiCoordination && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              AI Provider Coordination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Providers:</span>
              <div className="flex gap-2">
                {aiCoordination.activeProviders.map(provider => (
                  <Badge key={provider} variant="secondary" className="text-xs">
                    {provider}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Strategy:</span>
              <Badge variant="outline">{aiCoordination.lastStrategy}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Coordination Confidence:</span>
                <span>{(aiCoordination.coordinationConfidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={aiCoordination.coordinationConfidence * 100} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Provider Synergy:</span>
                <span>{(aiCoordination.providerSynergy * 100).toFixed(0)}%</span>
              </div>
              <Progress value={aiCoordination.providerSynergy * 100} />
            </div>
            
            {aiCoordination.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {aiCoordination.recommendations.map((rec, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <Sparkles className="w-3 h-3 mt-0.5 text-blue-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Service Coordination Status */}
      {serviceCoordination && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Service Coordination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Services:</span>
              <div className="flex gap-2">
                {serviceCoordination.activeServices.map(service => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service Efficiency:</span>
                  <span>{(serviceCoordination.serviceEfficiency * 100).toFixed(0)}%</span>
                </div>
                <Progress value={serviceCoordination.serviceEfficiency * 100} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Resource Optimization:</span>
                  <span>{(serviceCoordination.resourceOptimization * 100).toFixed(0)}%</span>
                </div>
                <Progress value={serviceCoordination.resourceOptimization * 100} />
              </div>
            </div>
            
            {serviceCoordination.adaptiveInsights.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Adaptive Insights:</h4>
                <ul className="space-y-1">
                  {serviceCoordination.adaptiveInsights.map((insight, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <Target className="w-3 h-3 mt-0.5 text-green-500" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Consciousness Insights */}
      {consciousnessInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Consciousness Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consciousnessInsights
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 5)
                .map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.actionable
                        ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded ${
                        insight.actionable
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      }`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {insight.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 italic">
                          Geometric basis: {insight.geometricBasis}
                        </p>
                      </div>
                      
                      {insight.actionable && (
                        <Button size="sm" variant="outline" className="text-xs">
                          Act
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}