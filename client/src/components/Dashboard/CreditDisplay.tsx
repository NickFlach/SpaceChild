import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PricingService } from '@/services/pricing';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface CreditDisplayProps {
  className?: string;
}

export default function CreditDisplay({ className }: CreditDisplayProps) {
  const { user } = useAuth();
  const [creditData, setCreditData] = useState({
    availableCredits: 0,
    totalCredits: 100,
    usedCredits: 0,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
      const totalCredits = user.monthlyCredits || 100;
      const usedCredits = user.usedCredits || 0;
      const availableCredits = totalCredits - usedCredits;
      const resetDate = user.creditResetDate ? new Date(user.creditResetDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      setCreditData({
        availableCredits,
        totalCredits,
        usedCredits,
        resetDate,
      });
    }
  }, [user]);

  const usagePercentage = (creditData.usedCredits / creditData.totalCredits) * 100;
  const isLowCredits = creditData.availableCredits < creditData.totalCredits * 0.2;
  const daysUntilReset = Math.ceil((creditData.resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (isLoading) {
    return (
      <Card className={`bg-slate-800/60 backdrop-blur-sm border-slate-700 ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`bg-slate-800/60 backdrop-blur-sm border-slate-700 ${className} ${
          isLowCredits ? 'border-orange-500/50' : ''
        }`}
        data-testid="credit-display"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              Credits
            </CardTitle>
            {isLowCredits && (
              <Badge variant="destructive" className="bg-orange-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low
              </Badge>
            )}
          </div>
          <CardDescription className="text-gray-300">
            Monthly usage and remaining credits
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Credit Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">
                {creditData.availableCredits.toLocaleString()} / {creditData.totalCredits.toLocaleString()} remaining
              </span>
              <span className="text-gray-400">
                {Math.round(usagePercentage)}% used
              </span>
            </div>
            <Progress
              value={usagePercentage}
              className="h-2 bg-slate-700"
              data-testid="credit-progress"
            />
          </div>

          {/* Reset Information */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>Resets in {daysUntilReset} days</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
              data-testid="view-usage-button"
            >
              View Usage
            </Button>
          </div>

          {/* Low Credit Warning */}
          {isLowCredits && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-400">
                    Running Low on Credits
                  </p>
                  <p className="text-xs text-orange-300">
                    Consider upgrading your plan to continue using advanced features.
                  </p>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white mt-2"
                    data-testid="upgrade-plan-button"
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Credit Actions Info */}
          <div className="text-xs text-gray-500 pt-2 border-t border-slate-700">
            <p>Credits are used for AI queries, code execution, and advanced features.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}