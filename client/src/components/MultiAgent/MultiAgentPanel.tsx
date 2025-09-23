import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Bot, 
  Users, 
  MessageSquare, 
  Target, 
  Loader2, 
  Play, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Brain,
  Shield,
  Zap,
  TestTube
} from "lucide-react";
import type { Project } from "@shared/schema";

interface MultiAgentPanelProps {
  project: Project;
}

interface AgentStatus {
  status: 'idle' | 'thinking' | 'working' | 'collaborating' | 'reviewing' | 'complete';
  currentTask?: {
    id: string;
    description: string;
    status: string;
  };
}

interface MultiAgentStatus {
  status: {
    session?: {
      id: number;
      goal: string;
      status: string;
      startedAt: string;
      completedAt?: string;
    };
    tasks: Array<{
      id: number;
      agentType: string;
      taskType: string;
      description: string;
      status: string;
      createdAt: string;
      startedAt?: string;
      completedAt?: string;
    }>;
    messages: Array<{
      id: number;
      fromAgent: string;
      toAgent?: string;
      messageType: string;
      content: any;
      priority: string;
      timestamp: string;
    }>;
    agentStatuses: Array<[string, AgentStatus]>;
  };
  agentStatuses: Record<string, AgentStatus>;
}

const agentIcons: Record<string, any> = {
  orchestrator: Brain,
  frontend_expert: Sparkles,
  backend_architect: Bot,
  security_analyst: Shield,
  performance_optimizer: Zap,
  testing_engineer: TestTube
};

const agentColors: Record<string, string> = {
  orchestrator: "bg-purple-500",
  frontend_expert: "bg-blue-500",
  backend_architect: "bg-green-500",
  security_analyst: "bg-red-500",
  performance_optimizer: "bg-yellow-500",
  testing_engineer: "bg-pink-500"
};

export default function MultiAgentPanel({ project }: MultiAgentPanelProps) {
  const [goal, setGoal] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Start multi-agent collaboration
  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/multiagent/start", {
        projectId: project.id,
        goal
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Collaboration Started",
        description: "Multi-agent system is now working on your goal",
      });
      setGoal("");
      queryClient.invalidateQueries({ queryKey: ["/api/multiagent/status"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to start multi-agent collaboration",
        variant: "destructive",
      });
    },
  });

  // Fetch status
  const { data: statusData, isLoading } = useQuery<MultiAgentStatus>({
    queryKey: ["/api/multiagent/status"],
    refetchInterval: 2000, // Poll every 2 seconds
  });

  const getAgentIcon = (agentType: string) => {
    const Icon = agentIcons[agentType] || Bot;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-gray-500';
      case 'thinking': return 'text-blue-500';
      case 'working': return 'text-yellow-500';
      case 'collaborating': return 'text-purple-500';
      case 'reviewing': return 'text-orange-500';
      case 'complete': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getTaskProgress = () => {
    if (!statusData?.status?.tasks) return 0;
    const completed = statusData.status.tasks.filter(t => t.status === 'complete').length;
    const total = statusData.status.tasks.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <div className="space-y-4">
      {/* Goal Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Agent Collaboration
          </CardTitle>
          <CardDescription>
            Describe your goal and let our AI agents work together to achieve it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: Create a responsive dashboard with user authentication and real-time data updates..."
            className="min-h-[100px]"
            disabled={startMutation.isPending || !!statusData?.status?.session}
          />
          <Button
            onClick={() => startMutation.mutate()}
            disabled={!goal.trim() || startMutation.isPending || !!statusData?.status?.session}
            className="w-full"
          >
            {startMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Collaboration...
              </>
            ) : statusData?.status?.session ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Collaboration in Progress
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Multi-Agent Collaboration
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      {statusData?.status?.session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Collaboration</span>
              <Badge variant={statusData.status.session.status === 'active' ? 'default' : 'secondary'}>
                {statusData.status.session.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Goal: {statusData.status.session.goal}
            </CardDescription>
            <Progress value={getTaskProgress()} className="mt-2" />
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Active Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.keys(statusData.agentStatuses || {}).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tasks Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statusData.status.tasks.filter(t => t.status === 'complete').length}/
                        {statusData.status.tasks.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {Object.entries(statusData.agentStatuses || {}).map(([agentType, agentStatus]) => (
                      <Card key={agentType}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <div className={`p-1 rounded ${agentColors[agentType]} text-white`}>
                              {getAgentIcon(agentType)}
                            </div>
                            {agentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Status:</span>
                              <span className={`text-sm font-medium ${getStatusColor(agentStatus.status)}`}>
                                {agentStatus.status}
                              </span>
                            </div>
                            {agentStatus.currentTask && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                {agentStatus.currentTask.description}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {statusData.status.tasks.map((task) => (
                      <Card key={task.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <div className={`p-1 rounded ${agentColors[task.agentType]} text-white`}>
                                {getAgentIcon(task.agentType)}
                              </div>
                              {task.taskType}
                            </CardTitle>
                            <Badge variant={
                              task.status === 'complete' ? 'default' :
                              task.status === 'in_progress' ? 'default' :
                              'secondary'
                            }>
                              {task.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Started: {formatTimestamp(task.createdAt)}
                            {task.completedAt && ` • Completed: ${formatTimestamp(task.completedAt)}`}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {statusData.status.messages.map((message) => (
                      <div key={message.id} className="flex gap-2">
                        <div className={`p-1 rounded ${agentColors[message.fromAgent]} text-white flex-shrink-0`}>
                          {getAgentIcon(message.fromAgent)}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">
                            {message.fromAgent} → {message.toAgent || 'all'}
                            <span className="ml-2">{formatTimestamp(message.timestamp)}</span>
                          </div>
                          <div className="text-sm mt-1">
                            <Badge variant="outline" className="mr-2">{message.messageType}</Badge>
                            {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}