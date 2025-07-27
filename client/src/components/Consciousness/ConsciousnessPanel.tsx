import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConsciousness } from "@/hooks/useConsciousness";
import { Brain, Zap, TrendingUp, Clock, AlertCircle } from "lucide-react";
import type { Project } from "@shared/schema";

interface ConsciousnessPanelProps {
  project: Project | null;
  isEnabled: boolean;
}

export default function ConsciousnessPanel({ project, isEnabled }: ConsciousnessPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    context,
    memories,
    isLoading,
    activate,
    isActivating,
  } = useConsciousness(project?.id);

  const handleActivate = async () => {
    if (!project) return;
    try {
      await activate(project.id);
    } catch (error) {
      console.error("Failed to activate consciousness:", error);
    }
  };

  if (!project) {
    return (
      <div className="p-4 border-t border-border">
        <div className="text-center text-muted-foreground text-sm">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No project selected</p>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="p-4 border-t border-border">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h4 className="font-medium mb-2">Consciousness Disabled</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Enable consciousness in project settings for context-aware AI assistance.
              </p>
              <Button
                size="sm"
                onClick={handleActivate}
                disabled={isActivating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isActivating ? "Activating..." : "Enable Consciousness"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contextRetention = context ? Math.round((context.relevanceScore || 0.94) * 100) : 94;
  const memoryCount = memories?.length || 0;

  return (
    <div className="border-t border-border">
      <div className="p-4">
        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-purple-700 dark:text-purple-300">Consciousness Active</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-auto"
              >
                {isExpanded ? "−" : "+"}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
              Learning your coding patterns and project context...
            </p>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Context Retention</span>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {contextRetention}%
                  </span>
                </div>
                <Progress 
                  value={contextRetention} 
                  className="h-1 bg-purple-100 dark:bg-purple-900/50"
                />
              </div>
              
              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-purple-200 dark:border-purple-800">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">Learning Phase</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      Active
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Brain className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">Memories</span>
                    </div>
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {memoryCount}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">Last Active</span>
                    </div>
                    <span className="text-muted-foreground">
                      {context?.lastInteraction 
                        ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
                            .format(Math.ceil((new Date(context.lastInteraction).getTime() - Date.now()) / (1000 * 60)), 'minute')
                        : "Now"
                      }
                    </span>
                  </div>
                  
                  {memories && memories.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Recent Memories
                      </h5>
                      <ScrollArea className="h-20">
                        <div className="space-y-1">
                          {memories.slice(0, 3).map((memory, index) => (
                            <div key={index} className="text-xs p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded">
                              <div className="flex items-center space-x-1 mb-1">
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {memory.memoryType}
                                </Badge>
                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                  {Math.round((memory.relevanceScore || 1) * 100)}%
                                </span>
                              </div>
                              <p className="text-muted-foreground truncate">
                                {typeof memory.memoryContent === 'object' 
                                  ? (memory.memoryContent as any)?.query || "Memory content"
                                  : memory.memoryContent
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                    <Zap className="h-3 w-3" />
                    <span>
                      Processing {context?.contextData?.interactionCount || 0} interactions
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
