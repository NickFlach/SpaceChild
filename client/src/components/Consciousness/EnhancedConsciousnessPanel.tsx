
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Zap, 
  Activity, 
  Shield, 
  Network,
  Eye,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EnhancedConsciousnessState {
  baseState: any;
  crossProjectInsights: any;
  predictiveCapabilities: any;
  multiAgentStatus: any;
  enhancedMetrics: {
    learningEfficiency: number;
    crossProjectInsights: number;
    predictionAccuracy: number;
    agentCoordination: number;
    overallIntelligence: number;
  };
}

interface EnhancedConsciousnessPanelProps {
  projectId: number | null;
}

export const EnhancedConsciousnessPanel: React.FC<EnhancedConsciousnessPanelProps> = ({ 
  projectId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [consciousnessState, setConsciousnessState] = useState<EnhancedConsciousnessState | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const fetchConsciousnessState = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/consciousness/enhanced/state?projectId=${projectId}&sessionId=${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setConsciousnessState(data.enhancedState);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Failed to fetch consciousness state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const configureEnhancedFeatures = async (config: any) => {
    if (!projectId) return;
    
    try {
      const response = await fetch('/api/consciousness/enhanced/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sessionId,
          config
        })
      });
      
      if (response.ok) {
        await fetchConsciousnessState();
      }
    } catch (error) {
      console.error('Failed to configure enhanced consciousness:', error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchConsciousnessState();
    }
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="p-6 text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          Select a project to access Enhanced Consciousness
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Enhanced Consciousness</h2>
            {isActive && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Active
              </Badge>
            )}
          </div>
          <Button 
            onClick={fetchConsciousnessState}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="prediction">Prediction</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {consciousnessState?.enhancedMetrics && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Learning Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={consciousnessState.enhancedMetrics.learningEfficiency * 100} 
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {(consciousnessState.enhancedMetrics.learningEfficiency * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Intelligence Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={consciousnessState.enhancedMetrics.overallIntelligence * 100} 
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {(consciousnessState.enhancedMetrics.overallIntelligence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Prediction Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={consciousnessState.enhancedMetrics.predictionAccuracy * 100} 
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {(consciousnessState.enhancedMetrics.predictionAccuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Agent Coordination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={consciousnessState.enhancedMetrics.agentCoordination * 100} 
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {(consciousnessState.enhancedMetrics.agentCoordination * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Enhanced Consciousness provides cross-project learning, predictive capabilities, 
                and multi-agent coordination for superior AI performance.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => configureEnhancedFeatures({ crossProjectLearning: true })}
              >
                <Network className="w-4 h-4 mr-1" />
                Cross-Project
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => configureEnhancedFeatures({ predictiveGeneration: true })}
              >
                <Eye className="w-4 h-4 mr-1" />
                Prediction
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => configureEnhancedFeatures({ multiAgentCoordination: true })}
              >
                <Shield className="w-4 h-4 mr-1" />
                Coordination
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Cross-Project Insights
                </CardTitle>
                <CardDescription>
                  Insights gathered from {consciousnessState?.enhancedMetrics?.crossProjectInsights || 0} related projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Pattern recognition improved by 23% based on similar project structures
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Code optimization suggestions from 5 related codebases
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Predictive Capabilities
                </CardTitle>
                <CardDescription>
                  AI-powered predictions and suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Next likely user action: Code refactoring</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Potential issue: Memory optimization needed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Multi-Agent Status
                </CardTitle>
                <CardDescription>
                  Coordination status across AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Code Agent</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Design Agent</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Testing Agent</span>
                    <Badge variant="secondary">Standby</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedConsciousnessPanel;
