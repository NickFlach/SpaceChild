import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Rocket, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
  Server,
  RotateCcw,
  Zap,
  Shield,
  DollarSign,
  AlertCircle,
  BarChart2
} from "lucide-react";
import type { Project } from "@shared/schema";

interface DeploymentPanelProps {
  project: Project;
}

interface DeploymentAnalytics {
  deployments: Array<{
    id: number;
    version: string;
    environment: string;
    status: string;
    deployedAt: string;
    completedAt?: string;
    healthStatus?: string;
  }>;
  currentDeployment?: {
    id: number;
    version: string;
    environment: string;
    status: string;
    healthStatus?: string;
    scalingConfig?: {
      minInstances: number;
      maxInstances: number;
      targetCPU: number;
      targetMemory: number;
    };
  };
  metrics: Array<{
    id: number;
    metricType: string;
    value: number;
    metadata?: any;
    timestamp: string;
  }>;
  issues: Array<{
    id: number;
    issueType: string;
    severity: string;
    description: string;
    detectedAt: string;
    status: string;
  }>;
  optimizations: Array<{
    id: number;
    optimizationType: string;
    description: string;
    impact: string;
    appliedAt: string;
    status: string;
  }>;
  insights: {
    successRate: number;
    avgDeployTime: number;
    avgResponseTime: number;
    issueCount: number;
    recommendations: string[];
  };
}

export default function DeploymentPanel({ project }: DeploymentPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [environment, setEnvironment] = useState<'development' | 'staging' | 'production'>('development');
  const [version, setVersion] = useState("");
  const [features, setFeatures] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deployment analytics
  const { data: analytics, isLoading } = useQuery<DeploymentAnalytics>({
    queryKey: [`/api/deployments/${project.id}/analytics`],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/deployments/deploy", {
        projectId: project.id,
        environment,
        version,
        features: features.split(',').map(f => f.trim()).filter(Boolean)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deployment Started",
        description: "Your intelligent deployment is in progress",
      });
      setVersion("");
      setFeatures("");
      queryClient.invalidateQueries({ queryKey: [`/api/deployments/${project.id}/analytics`] });
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
        title: "Deployment Failed",
        description: "Failed to start deployment",
        variant: "destructive",
      });
    },
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (deploymentId: number) => {
      const response = await apiRequest("POST", "/api/deployments/rollback", {
        deploymentId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rollback Started",
        description: "Rolling back to previous version",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/deployments/${project.id}/analytics`] });
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
        title: "Rollback Failed",
        description: "Failed to rollback deployment",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'deploying': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'rolled_back': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health?: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-4">
      {/* Deployment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Intelligent Deployment
          </CardTitle>
          <CardDescription>
            Deploy with self-healing capabilities and predictive optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={(v: any) => setEnvironment(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., v1.2.3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Input
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g., user-auth, payment-integration, dark-mode"
            />
          </div>
          <Button
            onClick={() => deployMutation.mutate()}
            disabled={!version || deployMutation.isPending}
            className="w-full"
          >
            {deployMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy with Intelligence
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 space-y-4">
              {/* Current Deployment Status */}
              {analytics?.currentDeployment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Deployment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Version</p>
                        <p className="font-medium">{analytics.currentDeployment.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Environment</p>
                        <Badge variant="outline">{analytics.currentDeployment.environment}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(analytics.currentDeployment.status)}`} />
                          <span className="capitalize">{analytics.currentDeployment.status}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Health</p>
                        <span className={`font-medium ${getHealthColor(analytics.currentDeployment.healthStatus)}`}>
                          {analytics.currentDeployment.healthStatus || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    {analytics.currentDeployment.status === 'active' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => rollbackMutation.mutate(analytics.currentDeployment!.id)}
                        disabled={rollbackMutation.isPending}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Rollback
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Success Metrics */}
              {analytics?.insights && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{(analytics.insights.successRate * 100).toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{formatDuration(analytics.insights.avgDeployTime)}</div>
                      <p className="text-xs text-muted-foreground">Avg Deploy Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{analytics.insights.avgResponseTime.toFixed(0)}ms</div>
                      <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{analytics.insights.issueCount}</div>
                      <p className="text-xs text-muted-foreground">Total Issues</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="p-6">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {analytics?.metrics.map((metric) => (
                    <Card key={metric.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{metric.metricType}</p>
                            <p className="text-sm text-muted-foreground">{formatTime(metric.timestamp)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{metric.value.toFixed(2)}</p>
                            {metric.metadata && (
                              <p className="text-xs text-muted-foreground">
                                {JSON.stringify(metric.metadata)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="health" className="p-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Health Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.currentDeployment?.scalingConfig && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Instances</span>
                            <span className="text-sm font-medium">
                              {analytics.currentDeployment.scalingConfig.minInstances} - {analytics.currentDeployment.scalingConfig.maxInstances}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Target CPU</span>
                              <span className="text-sm font-medium">{analytics.currentDeployment.scalingConfig.targetCPU}%</span>
                            </div>
                            <Progress value={analytics.currentDeployment.scalingConfig.targetCPU} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Target Memory</span>
                              <span className="text-sm font-medium">{analytics.currentDeployment.scalingConfig.targetMemory}%</span>
                            </div>
                            <Progress value={analytics.currentDeployment.scalingConfig.targetMemory} />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Optimizations */}
                {analytics?.optimizations && analytics.optimizations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Recent Optimizations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {analytics?.optimizations.map((opt) => (
                            <div key={opt.id} className="flex items-start gap-2 py-2 border-b last:border-0">
                              {opt.optimizationType === 'traffic_spike' && <TrendingUp className="h-4 w-4 mt-1" />}
                              {opt.optimizationType === 'security_risk' && <Shield className="h-4 w-4 mt-1" />}
                              {opt.optimizationType === 'cost_spike' && <DollarSign className="h-4 w-4 mt-1" />}
                              {opt.optimizationType === 'performance_degradation' && <Zap className="h-4 w-4 mt-1" />}
                              <div className="flex-1">
                                <p className="text-sm">{opt.description}</p>
                                <p className="text-xs text-muted-foreground">{formatTime(opt.appliedAt)}</p>
                              </div>
                              <Badge variant={opt.impact === 'high' || opt.impact === 'critical' ? 'destructive' : 'secondary'}>
                                {opt.impact}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="issues" className="p-6">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {analytics?.issues.map((issue) => (
                    <Card key={issue.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`h-4 w-4 mt-1 ${
                            issue.severity === 'critical' || issue.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{issue.issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                              <Badge variant={getSeverityColor(issue.severity)}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">Detected: {formatTime(issue.detectedAt)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {analytics?.issues.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No issues detected</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="insights" className="p-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart2 className="h-5 w-5" />
                      AI-Powered Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics?.insights.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">{idx + 1}</span>
                          </div>
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Deployment History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deployment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {analytics?.deployments.map((deployment) => (
                          <div key={deployment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">{deployment.version}</p>
                              <p className="text-xs text-muted-foreground">{formatTime(deployment.deployedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{deployment.environment}</Badge>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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