import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Sparkles, 
  Code2, 
  Zap, 
  FileSearch,
  Bug,
  Cpu,
  Network,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@shared/schema";

interface SuperintelligencePanelProps {
  project: Project;
  className?: string;
}

interface CodeAnalysis {
  complexity: number;
  maintainability: number;
  performance: number;
  security: number;
  suggestions: string[];
  metrics: {
    lines: number;
    functions: number;
    classes: number;
    dependencies: number;
  };
}

interface Optimization {
  type: 'performance' | 'memory' | 'readability' | 'security';
  description: string;
  impact: 'high' | 'medium' | 'low';
  code?: string;
}

interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  implementation?: string;
}

interface AnalysesResponse {
  analyses: Array<{
    id: number;
    projectId: number;
    fileId?: string;
    code: string;
    analysis: CodeAnalysis;
    language?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface OptimizationsResponse {
  optimizations: Array<{
    id: number;
    projectId: number;
    analysisId: number;
    optimizations: Optimization[];
    applied: boolean;
    createdAt: string;
  }>;
}

interface RecommendationsResponse {
  recommendations: Array<{
    id: number;
    projectId: number;
    projectType: string;
    recommendations: Recommendation[];
    confidence: number;
    createdAt: string;
  }>;
}

interface BugPrediction {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location?: {
    line: number;
    column: number;
  };
  suggestion?: string;
}

export function SuperintelligencePanel({ project, className }: SuperintelligencePanelProps) {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [activeTab, setActiveTab] = useState('analysis');

  // Fetch project analyses
  const { data: analyses, isLoading: analysesLoading } = useQuery<AnalysesResponse>({
    queryKey: ['/api/superintelligence/analyses', project.id],
    enabled: !!project.id
  });

  // Fetch project optimizations
  const { data: optimizations, isLoading: optimizationsLoading } = useQuery<OptimizationsResponse>({
    queryKey: ['/api/superintelligence/optimizations', project.id],
    enabled: !!project.id
  });

  // Fetch project recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<RecommendationsResponse>({
    queryKey: ['/api/superintelligence/recommendations', project.id],
    enabled: !!project.id
  });

  // Analyze code mutation
  const analyzeCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest('POST', '/api/superintelligence/analyze', {
        projectId: project.id,
        fileId: selectedFile,
        code,
        language: 'typescript'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/superintelligence/analyses', project.id] });
    }
  });

  // Generate optimizations mutation
  const generateOptimizationsMutation = useMutation({
    mutationFn: async (analysis: CodeAnalysis) => {
      const res = await apiRequest('POST', '/api/superintelligence/optimize', {
        projectId: project.id,
        analysis
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/superintelligence/optimizations', project.id] });
    }
  });

  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/superintelligence/recommend', {
        projectId: project.id,
        projectType: 'fullstack-web',
        currentStructure: {}
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/superintelligence/recommendations', project.id] });
    }
  });

  // Predict bugs mutation
  const predictBugsMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest('POST', '/api/superintelligence/predict-bugs', {
        projectId: project.id,
        code
      });
      return res.json();
    }
  });

  const isLoading = analysesLoading || optimizationsLoading || recommendationsLoading;

  return (
    <Card className={cn("bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200/30 dark:border-purple-800/30", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Superintelligence Engine
            </CardTitle>
            <CardDescription>Advanced code analysis, optimization, and architecture insights</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="bugs" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Bug Detection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Code Analysis</h3>
                <Button
                  onClick={() => analyzeCodeMutation.mutate('// Sample code')}
                  disabled={analyzeCodeMutation.isPending}
                >
                  <FileSearch className="h-4 w-4 mr-2" />
                  Analyze Project
                </Button>
              </div>

              {analyses?.analyses && analyses.analyses.length > 0 ? (
                <ScrollArea className="h-[400px] rounded-lg border border-purple-200/30 p-4">
                  {analyses.analyses.map((analysis: any, index: number) => (
                    <div key={index} className="mb-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{analysis.fileId || 'Project Analysis'}</span>
                        <Badge variant="secondary">{new Date(analysis.createdAt).toLocaleDateString()}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{analysis.analysis.complexity || 0}</div>
                          <div className="text-xs text-muted-foreground">Complexity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{analysis.analysis.maintainability || 0}%</div>
                          <div className="text-xs text-muted-foreground">Maintainability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{analysis.analysis.performance || 0}%</div>
                          <div className="text-xs text-muted-foreground">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{analysis.analysis.security || 0}%</div>
                          <div className="text-xs text-muted-foreground">Security</div>
                        </div>
                      </div>

                      {analysis.analysis.suggestions && (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">Suggestions:</div>
                          {analysis.analysis.suggestions.map((suggestion: string, i: number) => (
                            <div key={i} className="text-sm text-muted-foreground pl-4">• {suggestion}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    No analyses yet. Click "Analyze Project" to start code analysis.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Performance Optimizations</h3>
                <Button
                  onClick={() => {
                    if (analyses?.analyses?.[0]) {
                      generateOptimizationsMutation.mutate(analyses.analyses[0].analysis);
                    }
                  }}
                  disabled={generateOptimizationsMutation.isPending || !analyses?.analyses?.[0]}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Optimizations
                </Button>
              </div>

              {optimizations?.optimizations && optimizations.optimizations.length > 0 ? (
                <ScrollArea className="h-[400px] rounded-lg border border-blue-200/30 p-4">
                  {optimizations.optimizations.map((opt: any, index: number) => (
                    <div key={index} className="mb-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Optimization #{index + 1}</span>
                        </div>
                        <Badge 
                          variant={opt.applied ? "default" : "secondary"}
                          className={opt.applied ? "bg-green-500" : ""}
                        >
                          {opt.applied ? "Applied" : "Pending"}
                        </Badge>
                      </div>
                      
                      {opt.optimizations?.map((optimization: Optimization, i: number) => (
                        <div key={i} className="mb-2 p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{optimization.type}</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                optimization.impact === 'high' && "border-red-500 text-red-500",
                                optimization.impact === 'medium' && "border-yellow-500 text-yellow-500",
                                optimization.impact === 'low' && "border-green-500 text-green-500"
                              )}
                            >
                              {optimization.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{optimization.description}</p>
                          {optimization.code && (
                            <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                              <code>{optimization.code}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    No optimizations yet. Analyze your code first, then generate optimizations.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Architecture Recommendations</h3>
                <Button
                  onClick={() => generateRecommendationsMutation.mutate()}
                  disabled={generateRecommendationsMutation.isPending}
                >
                  <Network className="h-4 w-4 mr-2" />
                  Get Recommendations
                </Button>
              </div>

              {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                <ScrollArea className="h-[400px] rounded-lg border border-green-200/30 p-4">
                  {recommendations.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="mb-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{rec.projectType}</span>
                        <Badge variant="secondary">
                          Confidence: {(rec.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      {rec.recommendations?.map((recommendation: Recommendation, i: number) => (
                        <div key={i} className="mb-3 p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{recommendation.title}</span>
                            </div>
                            <Badge 
                              variant="outline"
                              className={cn(
                                recommendation.priority === 'critical' && "border-red-500 text-red-500",
                                recommendation.priority === 'high' && "border-orange-500 text-orange-500",
                                recommendation.priority === 'medium' && "border-yellow-500 text-yellow-500",
                                recommendation.priority === 'low' && "border-green-500 text-green-500"
                              )}
                            >
                              {recommendation.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{recommendation.description}</p>
                          {recommendation.implementation && (
                            <div className="text-xs text-muted-foreground italic">
                              Implementation: {recommendation.implementation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <Alert>
                  <Network className="h-4 w-4" />
                  <AlertDescription>
                    No architecture recommendations yet. Click "Get Recommendations" to analyze your project structure.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bugs" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Predictive Bug Detection</h3>
                <Button
                  onClick={() => predictBugsMutation.mutate('// Sample code for bug detection')}
                  disabled={predictBugsMutation.isPending}
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Scan for Bugs
                </Button>
              </div>

              {predictBugsMutation.data && predictBugsMutation.data.predictions ? (
                <ScrollArea className="h-[400px] rounded-lg border border-red-200/30 p-4">
                  {(predictBugsMutation.data as { predictions: BugPrediction[] }).predictions.map((bug: BugPrediction, index: number) => (
                    <div key={index} className="mb-3 p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-600">{bug.type}</span>
                        <Badge variant="destructive" className="ml-auto">
                          {bug.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{bug.description}</p>
                      {bug.location && (
                        <div className="text-xs text-muted-foreground">
                          Location: Line {bug.location.line}, Column {bug.location.column}
                        </div>
                      )}
                      {bug.suggestion && (
                        <div className="mt-2 p-2 bg-green-50/50 dark:bg-green-950/20 rounded text-sm">
                          <span className="font-medium text-green-600">Fix: </span>
                          {bug.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    No bug predictions yet. Click "Scan for Bugs" to analyze your code for potential issues.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Status indicator */}
        {(analyzeCodeMutation.isPending || generateOptimizationsMutation.isPending || 
          generateRecommendationsMutation.isPending || predictBugsMutation.isPending) && (
          <div className="mt-4 p-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm font-medium">Processing with superintelligence...</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}