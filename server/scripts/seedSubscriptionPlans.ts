import { getIStorage } from "../storage.ts";
import type { InsertSubscriptionPlan } from "../../shared/schema.ts";

const subscriptionPlans: InsertSubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Explorer',
    description: 'Perfect for trying out Space Child and small experiments',
    price: '0',
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
    price: '29.00',
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
    price: '99.00',
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
  // Yearly plans with 20% discount
  {
    id: 'builder-yearly',
    name: 'Builder',
    description: 'For serious developers building amazing applications (Annual)',
    price: '278.40', // 29 * 12 * 0.8
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
    price: '950.40', // 99 * 12 * 0.8
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

export async function seedSubscriptionPlans() {
  const storage = getIStorage();
  
  console.log('Seeding subscription plans...');
  
  for (const plan of subscriptionPlans) {
    try {
      await storage.createSubscriptionPlan(plan);
      console.log(`✓ Created plan: ${plan.name} (${plan.billingPeriod})`);
    } catch (error) {
      console.log(`✓ Plan already exists: ${plan.name} (${plan.billingPeriod})`);
    }
  }
  
  console.log('Subscription plans seeding completed.');
}