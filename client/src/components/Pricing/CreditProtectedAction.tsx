import { useState, ReactNode } from 'react';
import { AlertTriangle, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { usePricing } from '@/hooks/usePricing';
import { motion } from 'framer-motion';

interface CreditProtectedActionProps {
  action: string;
  metadata?: any;
  children: ReactNode;
  requiredCredits?: number;
  onAction?: () => void | Promise<void>;
  disabled?: boolean;
}

export default function CreditProtectedAction({
  action,
  metadata,
  children,
  requiredCredits,
  onAction,
  disabled = false,
}: CreditProtectedActionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const { canPerformAction, calculateActionCost, credits, getCurrentPlan, isFreePlan } = usePricing();
  
  const actionCost = requiredCredits || calculateActionCost(action, metadata);
  const currentPlan = getCurrentPlan();
  const isFree = isFreePlan();

  const handleClick = async () => {
    if (disabled) return;
    
    try {
      setIsPerformingAction(true);
      const canPerform = await canPerformAction(action, metadata);
      
      if (!canPerform) {
        setIsDialogOpen(true);
        return;
      }
      
      // Perform the action
      if (onAction) {
        await onAction();
      }
    } catch (error) {
      console.error('Error checking action permission:', error);
      setIsDialogOpen(true);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleUpgrade = () => {
    // Navigate to pricing page or open upgrade modal
    window.location.href = '/pricing';
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className={`${disabled || isPerformingAction ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        data-testid="credit-protected-action"
      >
        {children}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Action Requires Credits
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              This action requires {actionCost} credit{actionCost !== 1 ? 's' : ''} but you don't have enough available.
            </DialogDescription>
          </DialogHeader>

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Current Status */}
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Action Cost:</span>
                <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                  <Zap className="h-3 w-3 mr-1" />
                  {actionCost} credits
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Available:</span>
                <span className="text-sm text-gray-400">
                  {credits?.availableCredits || 0} credits
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Current Plan:</span>
                <Badge variant="secondary">
                  {currentPlan?.name || 'Free'}
                </Badge>
              </div>
            </div>

            {/* Action Description */}
            <div className="text-sm text-gray-400">
              <p>This action ({action.replace('_', ' ')}) costs {actionCost} credit{actionCost !== 1 ? 's' : ''}.</p>
              {isFree && (
                <p className="mt-2 text-cyan-400">
                  Upgrade to get more credits and unlock advanced features.
                </p>
              )}
            </div>

            {/* Credit Usage Examples */}
            <div className="border-t border-slate-700 pt-3">
              <p className="text-xs text-gray-500 mb-2">Credit usage examples:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Basic AI query: 1 credit</li>
                <li>• Code generation: 2 credits</li>
                <li>• Advanced analysis: 5+ credits</li>
              </ul>
            </div>
          </motion.div>

          <DialogFooter className="space-x-2">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              data-testid="upgrade-button"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}