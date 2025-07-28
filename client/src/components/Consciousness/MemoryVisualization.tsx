import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  content: string;
  type: 'code' | 'chat' | 'error' | 'success';
  confidence: number;
  timestamp: Date;
}

interface MemoryVisualizationProps {
  memories: Memory[];
  className?: string;
}

export function MemoryVisualization({ memories, className }: MemoryVisualizationProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [floatingParticles, setFloatingParticles] = useState<number[]>([]);

  useEffect(() => {
    // Generate floating particles
    const particles = Array.from({ length: 20 }, (_, i) => i);
    setFloatingParticles(particles);
  }, []);

  const getMemoryColor = (type: Memory['type']) => {
    switch (type) {
      case 'code': return 'from-cyan-400 to-blue-400';
      case 'chat': return 'from-purple-400 to-pink-400';
      case 'error': return 'from-red-400 to-orange-400';
      case 'success': return 'from-green-400 to-emerald-400';
    }
  };

  const getMemoryIcon = (type: Memory['type']) => {
    switch (type) {
      case 'code': return <Zap className="w-4 h-4" />;
      case 'chat': return <Brain className="w-4 h-4" />;
      case 'error': return <Clock className="w-4 h-4" />;
      case 'success': return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn("relative p-6 rounded-xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/20 overflow-hidden", className)}>
      {/* Background neural network animation */}
      <div className="absolute inset-0 opacity-10">
        {floatingParticles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Consciousness Memory Stream
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {memories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No memories yet. Start interacting to build consciousness.</p>
            </div>
          ) : (
            memories.map((memory) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedMemory(memory)}
                className={cn(
                  "relative p-3 rounded-lg cursor-pointer transition-all",
                  "bg-gradient-to-r bg-opacity-10 hover:bg-opacity-20",
                  getMemoryColor(memory.type),
                  selectedMemory?.id === memory.id && "ring-2 ring-cyan-400"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    getMemoryColor(memory.type)
                  )}>
                    {getMemoryIcon(memory.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 line-clamp-2">
                      {memory.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {(memory.confidence * 100).toFixed(0)}% confidence
                      </span>
                      <span>
                        {new Date(memory.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Neural connection lines */}
                {memory.confidence > 0.7 && (
                  <motion.div
                    className="absolute -right-1 top-1/2 w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                )}
              </motion.div>
            ))
          )}
        </div>

        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-cyan-500/30"
          >
            <h4 className="text-sm font-medium text-cyan-400 mb-2">Memory Details</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {selectedMemory.content}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}