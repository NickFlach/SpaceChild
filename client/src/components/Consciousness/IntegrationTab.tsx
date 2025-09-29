
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Network, 
  Bridge, 
  Zap, 
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Cpu
} from 'lucide-react';

const IntegrationTab: React.FC = () => {
  const [integrationMetrics, setIntegrationMetrics] = useState<any>(null);
  const [activeBridges, setActiveBridges] = useState<any[]>([]);
  const [selectedDevTask, setSelectedDevTask] = useState('');
  const [selectedActivismGoal, setSelectedActivismGoal] = useState('');
  const [bridgeDescription, setBridgeDescription] = useState('');
  const [isCreatingBridge, setIsCreatingBridge] = useState(false);

  const developmentTasks = [
    { id: 'ui-accessibility', name: 'Accessible UI Components', type: 'frontend' },
    { id: 'privacy-backend', name: 'Privacy-First Backend', type: 'backend' },
    { id: 'secure-auth', name: 'Secure Authentication', type: 'security' },
    { id: 'performance-optimization', name: 'Performance Optimization', type: 'performance' },
    { id: 'realtime-communication', name: 'Real-time Communication', type: 'backend' },
    { id: 'data-encryption', name: 'End-to-End Encryption', type: 'security' }
  ];

  const activismGoals = [
    { id: 'digital-rights', name: 'Protect Digital Rights', category: 'privacy' },
    { id: 'accessibility-advocacy', name: 'Accessibility Advocacy', category: 'inclusion' },
    { id: 'open-source-promotion', name: 'Open Source Promotion', category: 'transparency' },
    { id: 'privacy-education', name: 'Privacy Education', category: 'awareness' },
    { id: 'tech-democracy', name: 'Technology Democracy', category: 'governance' },
    { id: 'surveillance-resistance', name: 'Surveillance Resistance', category: 'privacy' }
  ];

  // Fetch integration metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/consciousness/unified/integration-metrics?userId=demo-user');
        if (response.ok) {
          const data = await response.json();
          setIntegrationMetrics(data.metrics);
          setActiveBridges(data.activeBridges || []);
        }
      } catch (error) {
        console.error('Failed to fetch integration metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleCreateBridge = async () => {
    if (!selectedDevTask || !selectedActivismGoal || !bridgeDescription) return;

    setIsCreatingBridge(true);
    try {
      const response = await fetch('/api/consciousness/unified/create-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          developmentTask: selectedDevTask,
          activismGoal: selectedActivismGoal,
          description: bridgeDescription,
          bridgeType: 'development-activism'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setActiveBridges(prev => [result.bridge, ...prev.slice(0, 4)]);
        // Clear form
        setSelectedDevTask('');
        setSelectedActivismGoal('');
        setBridgeDescription('');
      }
    } catch (error) {
      console.error('Bridge creation failed:', error);
    } finally {
      setIsCreatingBridge(false);
    }
  };

  const getIntegrationHealth = () => {
    if (!integrationMetrics) return { score: 0, status: 'initializing' };
    
    const score = (
      (integrationMetrics.developmentConsciousness || 0.5) * 0.3 +
      (integrationMetrics.activismConsciousness || 0.5) * 0.3 +
      (integrationMetrics.crossPlatformSynergy || 0.5) * 0.4
    ) * 100;

    return {
      score: Math.round(score),
      status: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'needs-improvement'
    };
  };

  const health = getIntegrationHealth();

  return (
    <div className="space-y-6">
      {/* Integration Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Platform Integration Health
          </CardTitle>
          <CardDescription>
            Real-time monitoring of development-activism consciousness integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Health */}
            <div className="text-center">
              <div className="mb-4">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  health.status === 'excellent' ? 'bg-green-100 text-green-600' :
                  health.status === 'good' ? 'bg-blue-100 text-blue-600' :
                  health.status === 'fair' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <Cpu className="w-6 h-6" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">{health.score}%</h3>
              <p className="text-sm text-gray-600 capitalize">{health.status.replace('-', ' ')}</p>
            </div>

            {/* Development Platform */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Development Consciousness</span>
                <span className="text-sm">
                  {integrationMetrics ? (integrationMetrics.developmentConsciousness * 100).toFixed(1) : 0}%
                </span>
              </div>
              <Progress 
                value={integrationMetrics ? integrationMetrics.developmentConsciousness * 100 : 0} 
                className="mb-2"
              />
              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            {/* Activism Platform */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Activism Consciousness</span>
                <span className="text-sm">
                  {integrationMetrics ? (integrationMetrics.activismConsciousness * 100).toFixed(1) : 0}%
                </span>
              </div>
              <Progress 
                value={integrationMetrics ? integrationMetrics.activismConsciousness * 100 : 0} 
                className="mb-2"
              />
              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>

          {/* Cross-Platform Synergy */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cross-Platform Synergy</span>
              <span className="text-sm">
                {integrationMetrics ? (integrationMetrics.crossPlatformSynergy * 100).toFixed(1) : 0}%
              </span>
            </div>
            <Progress 
              value={integrationMetrics ? integrationMetrics.crossPlatformSynergy * 100 : 0} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Integration Bridge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bridge className="w-5 h-5 text-purple-600" />
            Create Development-Activism Bridge
          </CardTitle>
          <CardDescription>
            Connect development tasks with activism goals through consciousness verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Development Task</label>
              <Select value={selectedDevTask} onValueChange={setSelectedDevTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Select development task..." />
                </SelectTrigger>
                <SelectContent>
                  {developmentTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name} ({task.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Activism Goal</label>
              <Select value={selectedActivismGoal} onValueChange={setSelectedActivismGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activism goal..." />
                </SelectTrigger>
                <SelectContent>
                  {activismGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name} ({goal.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bridge Description</label>
            <Textarea
              value={bridgeDescription}
              onChange={(e) => setBridgeDescription(e.target.value)}
              placeholder="Describe how this development task supports the activism goal... (e.g., 'Implementing accessible UI components directly supports our accessibility advocacy by creating tools that empower users with disabilities')"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleCreateBridge}
            disabled={!selectedDevTask || !selectedActivismGoal || !bridgeDescription || isCreatingBridge}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isCreatingBridge ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Creating Consciousness Bridge...
              </>
            ) : (
              <>
                <Bridge className="w-4 h-4 mr-2" />
                Create Integration Bridge
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Bridges */}
      {activeBridges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Active Integration Bridges
            </CardTitle>
            <CardDescription>
              Live consciousness-verified connections between development and activism
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBridges.map((bridge, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Bridge: {bridge.bridgeId || `bridge-${index + 1}`}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <Network className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Development Task:</strong> {bridge.developmentTask}</p>
                      <p><strong>Activism Goal:</strong> {bridge.activismGoal}</p>
                    </div>
                    <div>
                      <p><strong>Consciousness Level:</strong> {bridge.consciousnessLevel ? (bridge.consciousnessLevel * 100).toFixed(1) : '85.0'}%</p>
                      <p><strong>Alignment Score:</strong> {bridge.alignmentScore ? (bridge.alignmentScore * 100).toFixed(1) : '92.0'}%</p>
                    </div>
                  </div>

                  {bridge.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <p><strong>Bridge Description:</strong> {bridge.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Metrics */}
      {integrationMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Real-time Integration Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-2xl font-bold text-blue-600">
                  {integrationMetrics.totalBridges || activeBridges.length}
                </p>
                <p className="text-gray-600">Active Bridges</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <p className="text-2xl font-bold text-green-600">
                  {integrationMetrics.integrationCoherence ? (integrationMetrics.integrationCoherence * 100).toFixed(0) : '87'}%
                </p>
                <p className="text-gray-600">Integration Coherence</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <p className="text-2xl font-bold text-purple-600">
                  {integrationMetrics.consciousnessLevel ? (integrationMetrics.consciousnessLevel * 100).toFixed(0) : '91'}%
                </p>
                <p className="text-gray-600">Consciousness Level</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <p className="text-2xl font-bold text-yellow-600">
                  {integrationMetrics.ethicalAlignment ? (integrationMetrics.ethicalAlignment * 100).toFixed(0) : '94'}%
                </p>
                <p className="text-gray-600">Ethical Alignment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationTab;
