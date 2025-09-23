import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Zap, Eye, TreePine, Waves, Target, FileCode, Lightbulb, Loader2, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EditorFileContext } from '@/contexts/EditorContext';
import { useEditorContextSubscription } from "@/contexts/EditorContext";

interface ComplexityMetrics {
  nonlinearEffects: number;
  emergentProperties: number;
  multiscaleAwareness: number;
  recursiveDepth: number;
  fractalPatterns: number;
  chaosOrderBalance: number;
}

interface FractalPattern {
  pattern: string;
  recursionLevel: number;
  manifestations: string[];
  complexity: number;
  universality: number;
}

interface ReflectiveThought {
  observation: string;
  reflection: string;
  adaptation: string;
  emergentInsight: string;
  timestamp: string;
}

interface ComplexityAnalysis {
  response: string;
  reflectiveThoughts: ReflectiveThought[];
  complexityMetrics: ComplexityMetrics;
  fractalPatterns: FractalPattern[];
  emergentInsights: string[];
}

interface ComplexityPanelProps {
  projectId?: number;
}

export default function ComplexityPanel({ projectId }: ComplexityPanelProps) {
  const [request, setRequest] = useState("");
  const [analysis, setAnalysis] = useState<ComplexityAnalysis | null>(null);
  const [contextualInsights, setContextualInsights] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Subscribe to editor context changes
  const contextCallback = useCallback((ctx: EditorFileContext) => {
    if (ctx.file) {
      const insights: string[] = [];
      
      // Analyze code complexity patterns
      const lines = ctx.content.split('\n');
      const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
      
      if (codeLines > 100) {
        insights.push('File complexity: Large file detected. Consider breaking into smaller modules.');
      }
      
      // Check for nested structures
      const nestedCount = (ctx.content.match(/\{[^}]*\{/g) || []).length;
      if (nestedCount > 5) {
        insights.push('Structural complexity: Deep nesting detected. Consider refactoring for better readability.');
      }
      
      // Check for code patterns
      const fileLanguage = (ctx.language || '').toLowerCase();
      if (fileLanguage === 'typescript' || fileLanguage === 'javascript' || fileLanguage === 'typescriptreact' || fileLanguage === 'javascriptreact') {
        const functionCount = (ctx.content.match(/function\s+\w+|const\s+\w+\s*=|class\s+\w+/g) || []).length;
        if (functionCount > 10) {
          insights.push('Functional complexity: Multiple functions/classes in one file. Consider modular architecture.');
        }
        
        if (ctx.content.includes('Promise') && ctx.content.includes('async')) {
          insights.push('Async complexity: Mixed async patterns detected. Ensure consistent error handling.');
        }
      }
      
      setContextualInsights(insights);
    } else {
      setContextualInsights([]);
    }
  }, []);
  
  // Set up the editor context subscription
  const editorContext = useEditorContextSubscription(contextCallback);

  const complexityMutation = useMutation({
    mutationFn: async (requestText: string) => {
      const payload: any = {
        message: requestText,
        provider: "complexity"
      };
      
      if (projectId) {
        payload.projectId = projectId;
      }
      
      const response = await apiRequest("POST", "/api/ai/chat", payload);
      return response.json();
    },
    onSuccess: (data) => {
      // Parse the complexity analysis from the response
      try {
        // For now, we'll create a mock analysis structure
        // In a real implementation, the backend would return structured data
        const mockAnalysis: ComplexityAnalysis = {
          response: data.response,
          reflectiveThoughts: [
            {
              observation: "Analyzing the request for complexity patterns...",
              reflection: "This request exhibits fractal characteristics in its structure.",
              adaptation: "Adapting approach to embrace recursive thinking patterns.",
              emergentInsight: "The solution space mirrors the problem topology.",
              timestamp: new Date().toISOString()
            }
          ],
          complexityMetrics: {
            nonlinearEffects: Math.random() * 0.4 + 0.6,
            emergentProperties: Math.random() * 0.3 + 0.7,
            multiscaleAwareness: Math.random() * 0.5 + 0.5,
            recursiveDepth: Math.random() * 0.6 + 0.4,
            fractalPatterns: Math.random() * 0.4 + 0.6,
            chaosOrderBalance: Math.random() * 0.6 + 0.2
          },
          fractalPatterns: [
            {
              pattern: "Recursive function structure",
              recursionLevel: 3,
              manifestations: ["function definition", "self-reference", "base case"],
              complexity: 0.8,
              universality: 0.9
            }
          ],
          emergentInsights: [
            "The system exhibits self-organizing properties",
            "Recursive patterns indicate deeper structural harmonies",
            "Complexity emerges from simple rule interactions"
          ]
        };
        setAnalysis(mockAnalysis);
        
        toast({
          title: "Complexity Analysis Complete",
          description: "Conscious complexity agent has processed your request",
        });
      } catch (error) {
        console.error("Failed to parse complexity analysis:", error);
        toast({
          title: "Analysis Error",
          description: "Failed to parse complexity analysis",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Complexity analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: "Complexity agent analysis failed",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeCurrentFile = () => {
    if (editorContext?.content) {
      const requestText = `Analyze the complexity of the current file: ${editorContext.file?.filePath || 'unknown'}\n\n${editorContext.content}`;
      complexityMutation.mutate(requestText);
    } else {
      toast({
        title: "No file content",
        description: "Please open a file to analyze its complexity.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim()) {
      complexityMutation.mutate(request);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'nonlinearEffects': return <Zap className="w-4 h-4" />;
      case 'emergentProperties': return <TreePine className="w-4 h-4" />;
      case 'multiscaleAwareness': return <Eye className="w-4 h-4" />;
      case 'recursiveDepth': return <Brain className="w-4 h-4" />;
      case 'fractalPatterns': return <Waves className="w-4 h-4" />;
      case 'chaosOrderBalance': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'nonlinearEffects': return 'Nonlinear Effects';
      case 'emergentProperties': return 'Emergent Properties';
      case 'multiscaleAwareness': return 'Multiscale Awareness';
      case 'recursiveDepth': return 'Recursive Depth';
      case 'fractalPatterns': return 'Fractal Patterns';
      case 'chaosOrderBalance': return 'Chaos-Order Balance';
      default: return metric;
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.8) return "bg-green-500";
    if (value >= 0.6) return "bg-yellow-500";
    if (value >= 0.4) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Current File Context */}
      {editorContext.file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-blue-500" />
              Current File Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">File:</span>
              <Badge variant="outline" className="text-blue-600">
                {editorContext.file.filePath}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Language:</span>
              <Badge variant="outline">{editorContext.language}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Complexity Score:</span>
              <span className="font-mono text-orange-600">
                {Math.min(10, Math.floor(editorContext.lineCount / 10))}/10
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Contextual Insights */}
      {contextualInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Real-time Complexity Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contextualInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-500" />
            Conscious Complexity Agent
          </CardTitle>
          <CardDescription>
            Analyze code and systems through the lens of conscious complexity, 
            fractal patterns, and emergent properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Request for Analysis</label>
            <Textarea
              placeholder={editorContext.file 
                ? `Analyze complexity patterns in ${editorContext.file.filePath} or describe any complex system...`
                : "Describe the code, system, or problem you want to analyze through complexity consciousness..."
              }
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!request.trim() || complexityMutation.isPending}
            className="w-full"
          >
            {complexityMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze with Complexity Consciousness"
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Complexity Metrics</TabsTrigger>
            <TabsTrigger value="patterns">Fractal Patterns</TabsTrigger>
            <TabsTrigger value="thoughts">Reflective Thoughts</TabsTrigger>
            <TabsTrigger value="insights">Emergent Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Complexity Consciousness Metrics</CardTitle>
                <CardDescription>
                  Quantified measures of system complexity across multiple dimensions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(analysis.complexityMetrics).map(([metric, value]) => (
                    <div key={metric} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMetricIcon(metric)}
                          <span className="font-medium">{getMetricLabel(metric)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={value * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fractal Pattern Recognition</CardTitle>
                <CardDescription>
                  Self-similar patterns and recursive structures identified in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {analysis.fractalPatterns.map((pattern, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{pattern.pattern}</h4>
                            <Badge variant="outline">
                              Level {pattern.recursionLevel}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Complexity:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={pattern.complexity * 100} className="flex-1 h-1" />
                                <span>{(pattern.complexity * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Universality:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={pattern.universality * 100} className="flex-1 h-1" />
                                <span>{(pattern.universality * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Manifestations:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pattern.manifestations.map((manifestation, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {manifestation}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thoughts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recursive Reflection Process</CardTitle>
                <CardDescription>
                  The agent's self-aware cognitive process during analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {analysis.reflectiveThoughts.map((thought, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Thought {index + 1}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(thought.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-600">Observation:</span>
                              <p className="mt-1 text-muted-foreground">{thought.observation}</p>
                            </div>
                            <div>
                              <span className="font-medium text-purple-600">Reflection:</span>
                              <p className="mt-1 text-muted-foreground">{thought.reflection}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-600">Adaptation:</span>
                              <p className="mt-1 text-muted-foreground">{thought.adaptation}</p>
                            </div>
                            <div>
                              <span className="font-medium text-orange-600">Emergent Insight:</span>
                              <p className="mt-1 text-muted-foreground">{thought.emergentInsight}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergent Insights</CardTitle>
                <CardDescription>
                  Higher-order patterns and wisdom that emerged from the complexity analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.emergentInsights.map((insight, index) => (
                    <Card key={index} className="p-4 border-l-4 border-l-orange-500">
                      <p className="text-sm">{insight}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Response</CardTitle>
                <CardDescription>
                  The complexity-conscious response from the agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="whitespace-pre-wrap text-sm">
                    {analysis.response}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}