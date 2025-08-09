import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PricingService, SubscriptionPlan, UserSubscription, CreditUsage } from '@/services/pricing';
import { useAuth } from './useAuth';

export interface UsePricingReturn {
  // Plans
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  plansError: Error | null;
  
  // User subscription
  subscription: UserSubscription | null;
  subscriptionLoading: boolean;
  subscriptionError: Error | null;
  
  // Credits
  credits: CreditUsage | null;
  creditsLoading: boolean;
  checkCredits: (action: string, metadata?: any) => Promise<CreditUsage>;
  
  // Actions
  canPerformAction: (action: string, metadata?: any) => Promise<boolean>;
  calculateActionCost: (action: string, metadata?: any) => number;
  
  // Helpers
  getCurrentPlan: () => SubscriptionPlan | null;
  isFreePlan: () => boolean;
  needsUpgrade: (requiredFeatures: string[]) => boolean;
}

export function usePricing(): UsePricingReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [credits, setCredits] = useState<CreditUsage | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  // Fetch subscription plans
  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError
  } = useQuery({
    queryKey: ['/api/subscriptions/plans'],
    queryFn: () => PricingService.getSubscriptionPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user subscription
  const {
    data: subscription = null,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useQuery({
    queryKey: ['/api/subscriptions/user', user?.id],
    queryFn: () => user?.id ? PricingService.getUserSubscription(user.id) : null,
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Check credits function
  const checkCredits = async (action: string, metadata?: any): Promise<CreditUsage> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setCreditsLoading(true);
    try {
      const cost = PricingService.calculateActionCost(action, metadata);
      const result = await PricingService.checkCredits(user.id, cost);
      setCredits(result);
      return result;
    } finally {
      setCreditsLoading(false);
    }
  };

  // Check if user can perform action
  const canPerformAction = async (action: string, metadata?: any): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const result = await PricingService.canPerformAction(user.id, action, metadata);
      return result.canPerform;
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  };

  // Calculate action cost
  const calculateActionCost = (action: string, metadata?: any): number => {
    return PricingService.calculateActionCost(action, metadata);
  };

  // Get current plan
  const getCurrentPlan = (): SubscriptionPlan | null => {
    if (!subscription || !plans.length) return null;
    return plans.find(plan => plan.id === subscription.planId) || null;
  };

  // Check if on free plan
  const isFreePlan = (): boolean => {
    return subscription?.planId === 'free' || !subscription;
  };

  // Check if upgrade is needed for features
  const needsUpgrade = (requiredFeatures: string[]): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return true;

    return requiredFeatures.some(feature => !currentPlan.features.includes(feature));
  };

  // Initial credit check
  useEffect(() => {
    if (user?.id && !credits && !creditsLoading) {
      checkCredits('ai_query_basic').catch(console.error);
    }
  }, [user?.id]);

  return {
    // Plans
    plans,
    plansLoading,
    plansError: plansError as Error | null,
    
    // User subscription
    subscription,
    subscriptionLoading,
    subscriptionError: subscriptionError as Error | null,
    
    // Credits
    credits,
    creditsLoading,
    checkCredits,
    
    // Actions
    canPerformAction,
    calculateActionCost,
    
    // Helpers
    getCurrentPlan,
    isFreePlan,
    needsUpgrade,
  };
}