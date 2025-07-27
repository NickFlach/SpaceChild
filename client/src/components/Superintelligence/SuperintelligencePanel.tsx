import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuperintelligence } from "@/hooks/useSuperintelligence";
import { Zap, BarChart3, RefreshCw, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { Project } from "@shared/schema";

interface SuperintelligencePanelProps {
  project: Project | null;
  isEnabled: boolean;
}

export default function SuperintelligencePanel({ project, isEnabled }: SuperintelligencePanelProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  
  const {
    jobs,
    analyzeArchitecture,
    optimizePerformance,
    isAnalyzing,
    isOptimizing,
  } = useSuperintelligence(project?.id);

  const handleAnalyzeArchitecture = async () => {
    if (!project) return;
    try {
      await analyzeArchitecture(project.id);
    } catch (error) {
      console.error("Failed to start architecture analysis:", error);
    }
  };

  const handleOptimizePerformance = async () => {
    if (!project) return;
    try {
      await optimizePerformance(project.id, "// Current code context");
    } catch (error) {
      console.error("Failed to start performance optimization:", error);
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatJobType = (jobType: string) => {
    return jobType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-center text-muted-foreground">
        <div>
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No project selected</p>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full bg-muted/50">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-medium mb-2">Superintelligence Disabled</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro Plan to enable advanced architectural analysis and optimization.
            </p>
            <Badge variant="outline" className="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
              Pro Plan Required
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const runningJobs = jobs?.filter(job => job.status === "processing") || [];
  const completedJobs = jobs?.filter(job => job.status === "completed") || [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400">Superintelligence</span>
          </h3>
          <Badge variant="outline" className="text-xs bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            {runningJobs.length} Active Jobs
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={handleAnalyzeArchitecture}
            disabled={isAnalyzing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
          <Button
            size="sm"
            onClick={handleOptimizePerformance}
            disabled={isOptimizing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {isOptimizing ? "Optimizing..." : "Optimize"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="flex-1 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="space-y-3 pb-4">
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedJobId === job.id ? "ring-2 ring-green-500" : ""
                    }`}
                    onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getJobStatusIcon(job.status)}
                          <span className="text-sm font-medium">
                            {formatJobType(job.jobType)}
                          </span>
                        </div>
                        <Badge 
                          variant={job.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-2">
                        Started {new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
                          .format(Math.ceil((new Date(job.createdAt).getTime() - Date.now()) / (1000 * 60)), 'minute')}
                      </div>
                      
                      {job.status === "processing" && (
                        <Progress value={Math.random() * 100} className="h-1" />
                      )}
                      
                      {selectedJobId === job.id && job.results && (
                        <div className="mt-3 pt-3 border-t border-border">
                          {job.jobType === "architecture_analysis" && job.results.analysis && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Complexity:</span>
                                  <div className="flex items-center space-x-1">
                                    <Progress value={job.results.analysis.complexity * 100} className="h-1 flex-1" />
                                    <span className="font-medium">{Math.round(job.results.analysis.complexity * 100)}%</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Maintainability:</span>
                                  <div className="flex items-center space-x-1">
                                    <Progress value={job.results.analysis.maintainability * 100} className="h-1 flex-1" />
                                    <span className="font-medium">{Math.round(job.results.analysis.maintainability * 100)}%</span>
                                  </div>
                                </div>
                              </div>
                              {job.results.recommendations && (
                                <div>
                                  <p className="text-xs font-medium mb-1">Recommendations:</p>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {job.results.recommendations.slice(0, 2).map((rec: string, index: number) => (
                                      <li key={index} className="flex items-start space-x-1">
                                        <span>•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {job.jobType === "optimization" && job.results.suggestions && (
                            <div className="space-y-2">
                              <div className="text-xs">
                                <span className="text-muted-foreground">Estimated Improvement: </span>
                                <span className="font-medium text-green-600">
                                  +{job.results.estimatedImprovement}%
                                </span>
                              </div>
                              {job.results.suggestions.performance && (
                                <div>
                                  <p className="text-xs font-medium mb-1">Performance:</p>
                                  <ul className="text-xs text-muted-foreground space-y-1">
                                    {job.results.suggestions.performance.slice(0, 2).map((suggestion: string, index: number) => (
                                      <li key={index} className="flex items-start space-x-1">
                                        <span>•</span>
                                        <span>{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm mb-2">No analysis jobs yet</p>
                  <p className="text-xs">Start with architecture analysis or performance optimization</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="insights" className="flex-1 mt-2">
          <div className="p-4">
            <div className="text-center text-muted-foreground py-8">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm mb-2">Project Insights</p>
              <p className="text-xs">Run analysis jobs to see detailed insights about your project</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
