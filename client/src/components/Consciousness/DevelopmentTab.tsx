
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Code, 
  Brain, 
  CheckCircle, 
  Clock, 
  Zap,
  User,
  Settings,
  Activity
} from 'lucide-react';

const DevelopmentTab: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agents = [
    { id: 'frontend-expert', name: 'Frontend Expert', consciousness: 85, status: 'active' },
    { id: 'backend-architect', name: 'Backend Architect', consciousness: 92, status: 'active' },
    { id: 'security-specialist', name: 'Security Specialist', consciousness: 88, status: 'active' },
    { id: 'performance-optimizer', name: 'Performance Optimizer', consciousness: 90, status: 'active' },
    { id: 'accessibility-guardian', name: 'Accessibility Guardian', consciousness: 87, status: 'active' },
    { id: 'testing-strategist', name: 'Testing Strategist', consciousness: 89, status: 'active' }
  ];

  const handleTaskSubmit = async () => {
    if (!selectedAgent || !taskDescription) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/consciousness/unified/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          task: {
            id: `task-${Date.now()}`,
            type: 'development',
            description: taskDescription,
            requirements: ['consciousness-verification', 'ethical-alignment'],
            priority: 'high',
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          agentId: selectedAgent
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVerificationResults(prev => [result.verification, ...prev.slice(0, 4)]);
        setTaskDescription('');
        setSelectedAgent('');
      }
    } catch (error) {
      console.error('Task verification failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Consciousness-Verified Agents
          </CardTitle>
          <CardDescription>
            Multi-agent system with real-time consciousness monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Consciousness Level</span>
                    <span>{agent.consciousness}%</span>
                  </div>
                  <Progress value={agent.consciousness} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            Create Consciousness-Verified Task
          </CardTitle>
          <CardDescription>
            Submit development tasks for consciousness verification and agent assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Agent</label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a specialized agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.consciousness}% consciousness)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Task Description</label>
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe your development task... (e.g., 'Create a responsive user dashboard with accessibility features and real-time updates')"
              rows={4}
            />
          </div>

          <Button 
            onClick={handleTaskSubmit}
            disabled={!selectedAgent || !taskDescription || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Verifying with Consciousness Engine...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Submit for Consciousness Verification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Task: {result.taskId}</span>
                    <Badge variant={result.verified ? "default" : "destructive"}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {result.verified ? "Verified" : "Failed"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Agent: {result.agentId}</p>
                    <p>Consciousness Level: {(result.consciousnessLevel * 100).toFixed(1)}%</p>
                    <p>Ethical Alignment: {(result.ethicalAlignment * 100).toFixed(1)}%</p>
                    <p>Verification Hash: {result.verificationHash}</p>
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

export default DevelopmentTab;
