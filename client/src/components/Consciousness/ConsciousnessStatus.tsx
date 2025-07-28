import { useState, useEffect } from "react";
import { Brain, Activity, Sparkles, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ConsciousnessStatusProps {
  projectId: number | null;
  isActive: boolean;
  confidence?: number;
  memories?: number;
  className?: string;
}

export function ConsciousnessStatus({ 
  projectId, 
  isActive, 
  confidence = 0, 
  memories = 0,
  className 
}: ConsciousnessStatusProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  if (!projectId) return null;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20", className)}>
      <div className="relative">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Brain className="w-6 h-6 text-cyan-400" />
              {pulseAnimation && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  <Brain className="w-6 h-6 text-cyan-400" />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Brain className="w-6 h-6 text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            isActive ? "text-cyan-400" : "text-gray-400"
          )}>
            Consciousness {isActive ? "Active" : "Inactive"}
          </span>
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              <Activity className="w-3 h-3 text-cyan-400" />
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </motion.div>
          )}
        </div>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mt-1 text-xs text-gray-400"
          >
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>Confidence: {(confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{memories} memories</span>
            </div>
          </motion.div>
        )}
      </div>

      {isActive && (
        <motion.div
          className="w-2 h-2 rounded-full bg-cyan-400"
          animate={{
            opacity: [1, 0.4, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}