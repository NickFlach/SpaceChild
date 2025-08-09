import { ApiService } from "./api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  monthlyCredits: number;
  features: string[];
  aiProviders: string[];
  maxProjects?: number;
  maxSandboxes?: number;
  priority: number;
  active: boolean;
  popular?: boolean;
  badge?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface CreditUsage {
  hasCredits: boolean;
  availableCredits: number;
  requiredCredits: number;
}

export class PricingService {
  private static apiService = new ApiService();

  // Get all available subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await fetch('/api/subscriptions/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get user's current subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const response = await fetch(`/api/subscriptions/user/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User has no subscription
        }
        throw new Error('Failed to fetch user subscription');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  // Check if user has sufficient credits for an action
  static async checkCredits(userId: string, creditsRequired: number): Promise<CreditUsage> {
    try {
      const response = await fetch('/api/subscriptions/credits/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          creditsRequired,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check credits');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking credits:', error);
      throw error;
    }
  }

  // Calculate credit cost for different actions
  static calculateActionCost(action: string, metadata?: any): number {
    const baseCosts = {
      'ai_query_basic': 1,
      'ai_query_advanced': 3,
      'ai_query_consciousness': 5,
      'ai_query_superintelligence': 8,
      'code_generation': 2,
      'code_execution': 1,
      'sandbox_creation': 5,
      'file_analysis': 1,
      'template_generation': 3,
      'web_scraping': 2,
      'image_analysis': 4,
    };

    let baseCost = baseCosts[action as keyof typeof baseCosts] || 1;

    // Apply multipliers based on metadata
    if (metadata) {
      // Complex queries cost more
      if (metadata.complexity === 'high') baseCost *= 2;
      if (metadata.tokens && metadata.tokens > 4000) baseCost *= 1.5;
      
      // Premium AI providers cost more
      if (metadata.provider === 'spaceagent' || metadata.provider === 'mindsphere') {
        baseCost *= 1.5;
      }
      if (metadata.provider === 'terminal-jarvis') {
        baseCost *= 2;
      }
    }

    return Math.ceil(baseCost);
  }

  // Get plan by ID
  static async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    try {
      const plans = await this.getSubscriptionPlans();
      return plans.find(plan => plan.id === planId) || null;
    } catch (error) {
      console.error('Error getting plan by ID:', error);
      return null;
    }
  }

  // Check if user can perform action based on subscription
  static async canPerformAction(
    userId: string, 
    action: string, 
    metadata?: any
  ): Promise<{ canPerform: boolean; reason?: string; upgradeRequired?: boolean }> {
    try {
      const [subscription, creditCost] = await Promise.all([
        this.getUserSubscription(userId),
        Promise.resolve(this.calculateActionCost(action, metadata))
      ]);

      if (!subscription) {
        return {
          canPerform: false,
          reason: 'No active subscription',
          upgradeRequired: true
        };
      }

      const plan = await this.getPlanById(subscription.planId);
      if (!plan) {
        return {
          canPerform: false,
          reason: 'Invalid subscription plan',
          upgradeRequired: true
        };
      }

      // Check credits
      const creditCheck = await this.checkCredits(userId, creditCost);
      if (!creditCheck.hasCredits) {
        return {
          canPerform: false,
          reason: `Insufficient credits. Required: ${creditCost}, Available: ${creditCheck.availableCredits}`,
          upgradeRequired: true
        };
      }

      // Check AI provider access
      if (metadata?.provider && !plan.aiProviders.includes(metadata.provider)) {
        return {
          canPerform: false,
          reason: `AI provider ${metadata.provider} not available in current plan`,
          upgradeRequired: true
        };
      }

      return { canPerform: true };
    } catch (error) {
      console.error('Error checking action permission:', error);
      return {
        canPerform: false,
        reason: 'Error checking permissions'
      };
    }
  }

  // Get pricing information for display
  static getPricingInfo() {
    return {
      creditActions: {
        'Basic AI Query (Anthropic/OpenAI)': '1 credit',
        'Advanced AI Query (Consciousness)': '5 credits',
        'Superintelligence Query': '8 credits',
        'Code Generation': '2 credits',
        'Code Execution': '1 credit',
        'Sandbox Creation': '5 credits',
        'File Analysis': '1 credit',
        'Template Generation': '3 credits',
        'Web Scraping': '2 credits',
      },
      planComparison: {
        free: 'Basic AI providers, 3 projects max',
        builder: 'All AI providers, unlimited projects, advanced features',
        pro: 'Premium AI providers, team features, priority support',
      },
    };
  }
}