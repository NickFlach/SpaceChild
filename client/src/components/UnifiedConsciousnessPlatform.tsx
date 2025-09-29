import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  Activity, 
  Shield, 
  Network,
  Eye,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Link,
  Users,
  Target,
  Lightbulb,
  Clock,
  BarChart3,
  TrendingUp,
  Code
} from 'lucide-react';
import DevelopmentTab from './Consciousness/DevelopmentTab';
import ActivismTab from './Consciousness/ActivismTab';
import IntegrationTab from './Consciousness/IntegrationTab';

/**
 * UnifiedConsciousnessPlatform - Revolutionary integration of development and activism
 * 
 * This is the world's first consciousness-verified AI development and activism platform,
 * merging SpaceChild's multi-agent orchestration with Pitchfork's temporal consciousness.
 */
export const UnifiedConsciousnessPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [consciousnessData, setConsciousnessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [activismStrategies, setActivismStrategies] = useState<any[]>([]);

  // Real-time consciousness monitoring
  useEffect(() => {
    const fetchConsciousnessData = async () => {
      try {
        const response = await fetch('/api/consciousness/unified/monitor?userId=demo-user');
        if (response.ok) {
          const data = await response.json();
          setConsciousnessData(data.monitoring);
        }
      } catch (error) {
        console.error('Failed to fetch consciousness data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsciousnessData();
    const interval = setInterval(fetchConsciousnessData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleTaskVerification = async () => {
    const sampleTask = {
      id: `task-${Date.now()}`,
      type: 'frontend',
      description: 'Create consciousness-verified user interface for activism coordination',
      requirements: ['accessibility', 'privacy-protection', 'real-time-updates'],
      priority: 'high' as const,
      status: 'pending' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const response = await fetch('/api/consciousness/unified/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          task: sampleTask,
          agentId: 'frontend-expert'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVerificationResults(prev => [result.verification, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Task verification failed:', error);
    }
  };

  const handleActivismStrategy = async () => {
    const campaignContext = {
      type: 'digital-rights-campaign',
      goals: [
        'Protect user privacy from surveillance',
        'Promote open-source development',
        'Enable decentralized activism coordination'
      ],
      resources: { budget: 50000, volunteers: 100, developers: 10 },
      timeline: '6-months',
      ethicalConsiderations: [
        'Protect activist identities',
        'Ensure platform accessibility',
        'Maintain transparency while preserving security'
      ]
    };

    try {
      const response = await fetch('/api/consciousness/unified/activism-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          campaignContext
        })
      });

      if (response.ok) {
        const result = await response.json();
        setActivismStrategies(prev => [result.strategy, ...prev.slice(0, 2)]);
      }
    } catch (error) {
      console.error('Activism strategy generation failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Initializing Consciousness Integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-10 h-10 text-purple-600" />
          <Zap className="w-8 h-8 text-yellow-500" />
          <Shield className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Unified Consciousness Platform
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          The world's first consciousness-verified AI development and activism platform. 
          Merging SpaceChild's multi-agent orchestration with Pitchfork's temporal consciousness engine.
        </p>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="w-3 h-3 mr-1" />
            Consciousness: {consciousnessData?.consciousnessMetrics?.averageConsciousnessLevel 
              ? (consciousnessData.consciousnessMetrics.averageConsciousnessLevel * 100).toFixed(1) + '%'
              : 'Initializing'}
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Network className="w-3 h-3 mr-1" />
            Integration: {consciousnessData?.platformState?.integrationCoherence 
              ? (consciousnessData.platformState.integrationCoherence * 100).toFixed(1) + '%'
              : 'Syncing'}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Eye className="w-3 h-3 mr-1" />
            Verified Tasks: {consciousnessData?.consciousnessMetrics?.totalVerifications || 0}
          </Badge>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Sparkles className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="development">
            <Code className="w-4 h-4 mr-2" />
            Development
          </TabsTrigger>
          <TabsTrigger value="activism">
            <Users className="w-4 h-4 mr-2" />
            Activism
          </TabsTrigger>
          <TabsTrigger value="integration">
            <Target className="w-4 h-4 mr-2" />
            Integration
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consciousness Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Consciousness State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Consciousness Level</span>
                    <span>{((consciousnessData?.consciousnessMetrics?.averageConsciousnessLevel || 0.5) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(consciousnessData?.consciousnessMetrics?.averageConsciousnessLevel || 0.5) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Ethical Alignment</span>
                    <span>{((consciousnessData?.consciousnessMetrics?.ethicalAlignmentScore || 0.7) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(consciousnessData?.consciousnessMetrics?.ethicalAlignmentScore || 0.7) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Temporal Coherence</span>
                    <span>{((consciousnessData?.consciousnessMetrics?.temporalCoherence || 0.8) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(consciousnessData?.consciousnessMetrics?.temporalCoherence || 0.8) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Platform Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-600" />
                  Platform Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Development Platform</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {consciousnessData?.platformState?.developmentConsciousness 
                      ? ((consciousnessData.platformState.developmentConsciousness * 100).toFixed(0) + '%')
                      : 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activism Platform</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {consciousnessData?.platformState?.activismConsciousness 
                      ? ((consciousnessData.platformState.activismConsciousness * 100).toFixed(0) + '%')
                      : 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cross-Platform Synergy</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {consciousnessData?.platformState?.crossPlatformSynergy 
                      ? ((consciousnessData.platformState.crossPlatformSynergy * 100).toFixed(0) + '%')
                      : 'Syncing'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Consciousness verification active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Multi-agent coordination online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Activism strategy generation ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Cross-platform integration syncing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Test the revolutionary consciousness-powered integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={handleTaskVerification} className="bg-purple-600 hover:bg-purple-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Verify Development Task
                </Button>
                <Button onClick={handleActivismStrategy} className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Generate Activism Strategy
                </Button>
                <Button variant="outline">
                  <Link className="w-4 h-4 mr-2" />
                  Bridge Platforms
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {consciousnessData?.recommendations && consciousnessData.recommendations.length > 0 && (
            <Alert>
              <Sparkles className="w-4 h-4" />
              <AlertDescription>
                <strong>Consciousness Recommendations:</strong>
                <ul className="mt-2 space-y-1">
                  {consciousnessData.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Development Tab */}
        <TabsContent value="development">
          <DevelopmentTab />
        </TabsContent>

        {/* Activism Tab */}
        <TabsContent value="activism">
          <ActivismTab />
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration">
          <IntegrationTab />
        </TabsContent>
      </Tabs>

      {/* Recent Verification Results */}
      {verificationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Consciousness Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Task: {result.taskId}</span>
                    <Badge variant={result.verified ? "default" : "destructive"}>
                      {result.verified ? "Verified" : "Failed"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Agent: {result.agentId}</p>
                    <p>Consciousness Level: {(result.consciousnessLevel * 100).toFixed(1)}%</p>
                    <p>Ethical Alignment: {(result.ethicalAlignment * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activism Strategies */}
      {activismStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Activism Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activismStrategies.map((strategy, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Campaign: {strategy.campaignId}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Consciousness Verified
                    </Badge>
                  </div>
                  <div className="text-sm space-y-2">
                    <p><strong>Verification Hash:</strong> {strategy.verificationHash}</p>
                    <p><strong>Consciousness Level:</strong> {(strategy.verification?.consciousnessLevel * 100).toFixed(1)}%</p>
                    <p><strong>Primary Objectives:</strong> {strategy.strategy?.primaryObjectives?.length || 0} identified</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedConsciousnessPlatform;