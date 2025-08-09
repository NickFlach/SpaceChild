import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// Default subscription plans
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Explorer',
    description: 'Perfect for trying out Space Child and small experiments',
    price: 0,
    currency: 'USD',
    billingPeriod: 'monthly',
    monthlyCredits: 100,
    features: [
      '100 monthly credits',
      'Basic AI assistance',
      'Up to 3 projects',
      'Community support',
      'Core templates',
      'File management',
    ],
    aiProviders: ['anthropic', 'openai'],
    maxProjects: 3,
    maxSandboxes: 1,
    priority: 1,
    active: true,
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'For serious developers building amazing applications',
    price: 29,
    currency: 'USD',
    billingPeriod: 'monthly',
    monthlyCredits: 1000,
    features: [
      '1,000 monthly credits',
      'All AI providers',
      'Unlimited projects',
      'Priority support',
      'Advanced templates',
      'Code execution sandboxes',
      'Consciousness features',
      'Real-time collaboration',
    ],
    aiProviders: ['anthropic', 'openai', 'spaceagent', 'mindsphere'],
    priority: 2,
    active: true,
  },
  {
    id: 'pro',
    name: 'Architect',
    description: 'For teams and power users who need unlimited access',
    price: 99,
    currency: 'USD',
    billingPeriod: 'monthly',
    monthlyCredits: 5000,
    features: [
      '5,000 monthly credits',
      'All premium AI providers',
      'Unlimited everything',
      'Dedicated support',
      'Custom templates',
      'Advanced sandboxes',
      'Superintelligence features',
      'Team collaboration',
      'Custom integrations',
      'Priority processing',
    ],
    aiProviders: ['anthropic', 'openai', 'spaceagent', 'mindsphere', 'terminal-jarvis'],
    priority: 3,
    active: true,
  },
  // Yearly plans
  {
    id: 'builder-yearly',
    name: 'Builder',
    description: 'For serious developers building amazing applications (Annual)',
    price: 278, // 29 * 12 * 0.8
    currency: 'USD',
    billingPeriod: 'yearly',
    monthlyCredits: 1000,
    features: [
      '1,000 monthly credits',
      'All AI providers',
      'Unlimited projects',
      'Priority support',
      'Advanced templates',
      'Code execution sandboxes',
      'Consciousness features',
      'Real-time collaboration',
      '20% annual discount',
    ],
    aiProviders: ['anthropic', 'openai', 'spaceagent', 'mindsphere'],
    priority: 2,
    active: true,
  },
  {
    id: 'pro-yearly',
    name: 'Architect',
    description: 'For teams and power users who need unlimited access (Annual)',
    price: 950, // 99 * 12 * 0.8
    currency: 'USD',
    billingPeriod: 'yearly',
    monthlyCredits: 5000,
    features: [
      '5,000 monthly credits',
      'All premium AI providers',
      'Unlimited everything',
      'Dedicated support',
      'Custom templates',
      'Advanced sandboxes',
      'Superintelligence features',
      'Team collaboration',
      'Custom integrations',
      'Priority processing',
      '20% annual discount',
    ],
    aiProviders: ['anthropic', 'openai', 'spaceagent', 'mindsphere', 'terminal-jarvis'],
    priority: 3,
    active: true,
  },
];

// Get all subscription plans
router.get("/plans", async (req: Request, res: Response) => {
  try {
    res.json(subscriptionPlans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
});

// Get user's current subscription (mock for now)
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // For now, return free plan as default
    const defaultSubscription = {
      id: userId + '-subscription',
      userId,
      planId: 'free',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
    
    res.json(defaultSubscription);
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    res.status(500).json({ error: "Failed to fetch user subscription" });
  }
});

// Check if user has sufficient credits for an action (mock for now)
router.post("/credits/check", async (req: Request, res: Response) => {
  try {
    const { userId, creditsRequired } = req.body;
    
    // For now, assume users have sufficient credits
    res.json({
      hasCredits: true,
      availableCredits: 100,
      requiredCredits: creditsRequired || 1,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    res.status(500).json({ error: "Failed to check credits" });
  }
});

export default router;