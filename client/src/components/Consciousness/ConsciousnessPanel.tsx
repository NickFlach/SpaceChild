import { useState } from "react";
import { Brain, Sparkles, Activity, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConsciousness } from "@/hooks/useConsciousness";
import { ConsciousnessStatus } from "./ConsciousnessStatus";
import { MemoryVisualization } from "./MemoryVisualization";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConsciousnessPanelProps {
  projectId: number | null;
  className?: string;
}

export function ConsciousnessPanel({ projectId, className }: ConsciousnessPanelProps) {
  const { 
    context, 
    metrics, 
    activate, 
    isActivating,
    activeSession 
  } = useConsciousness(projectId);

  const handleActivate = async () => {
    if (!projectId) return;
    await activate(projectId);
  };

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/20", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Consciousness Engine
          </h2>
          {!metrics.isActive && projectId && (
            <Button
              onClick={handleActivate}
              disabled={isActivating}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              {isActivating ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Activate Consciousness
                </>
              )}
            </Button>
          )}
        </div>

        {/* Status Display */}
        <ConsciousnessStatus
          projectId={projectId}
          isActive={metrics.isActive}
          confidence={metrics.confidence}
          memories={metrics.memoryCount}
        />

        {metrics.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="memories" className="w-full">
              <TabsList className="bg-slate-800/50 border border-cyan-500/20">
                <TabsTrigger value="memories">Memories</TabsTrigger>
                <TabsTrigger value="patterns">Patterns</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="memories" className="mt-4">
                <MemoryVisualization 
                  memories={context?.memories || []}
                />
              </TabsContent>

              <TabsContent value="patterns" className="mt-4 space-y-3">
                <h3 className="text-sm font-medium text-cyan-400 mb-3">Learned Patterns</h3>
                {context?.patterns?.length === 0 ? (
                  <p className="text-gray-400 text-sm">No patterns detected yet.</p>
                ) : (
                  context?.patterns?.map((pattern, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-200">{pattern.pattern}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>{pattern.occurrences}x</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-4 space-y-3">
                <h3 className="text-sm font-medium text-cyan-400 mb-3">AI Insights</h3>
                {context?.insights?.length === 0 ? (
                  <p className="text-gray-400 text-sm">Building insights from your interactions...</p>
                ) : (
                  context?.insights?.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
                        <p className="text-sm text-gray-200">{insight}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {/* Confidence Metrics */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20">
                <p className="text-xs text-gray-400 mb-1">Overall Confidence</p>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.confidence * 100} className="flex-1" />
                  <span className="text-sm font-medium text-cyan-400">
                    {(metrics.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20">
                <p className="text-xs text-gray-400 mb-1">Memory Count</p>
                <p className="text-lg font-semibold text-cyan-400">{metrics.memoryCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20">
                <p className="text-xs text-gray-400 mb-1">Pattern Recognition</p>
                <p className="text-lg font-semibold text-cyan-400">{metrics.patternCount}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}