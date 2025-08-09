import { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  monthlyCredits: number;
  features: string[];
  aiProviders: string[];
  maxProjects?: number;
  maxSandboxes?: number;
  priority: number;
  active: boolean;
  popular?: boolean;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const defaultPlans: PricingPlan[] = [
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
    icon: Star,
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
    popular: true,
    badge: 'Most Popular',
    icon: Zap,
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
    badge: 'Power User',
    icon: Crown,
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  // Query for subscription plans from API
  const { data: plans = defaultPlans, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/plans'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const filteredPlans = (plans as PricingPlan[]).filter((plan: PricingPlan) => plan.active && plan.billingPeriod === billingPeriod);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-white">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-60" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your AI-powered development journey. 
              All plans include our core features with credits that cover AI usage, 
              code execution, and advanced capabilities.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs value={billingPeriod} onValueChange={(value: string) => setBillingPeriod(value as 'monthly' | 'yearly')} className="mb-12">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="monthly" className="data-[state=active]:bg-cyan-600">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="data-[state=active]:bg-cyan-600">
                  Yearly
                  <Badge variant="secondary" className="ml-2 bg-green-500 text-white">
                    Save 20%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
        >
          {filteredPlans.sort((a: PricingPlan, b: PricingPlan) => a.priority - b.priority).map((plan: PricingPlan) => (
            <motion.div key={plan.id} variants={cardVariants}>
              <Card 
                className={`relative h-full ${
                  plan.popular 
                    ? 'border-2 border-cyan-500 bg-slate-800/90 backdrop-blur-sm shadow-2xl shadow-cyan-500/20' 
                    : 'border border-slate-700 bg-slate-800/60 backdrop-blur-sm hover:border-slate-600'
                } transition-all duration-300 hover:scale-105`}
                data-testid={`pricing-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                      <plan.icon className="h-8 w-8 text-cyan-400" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {plan.description}
                  </CardDescription>
                  <div className="pt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-white">
                        ${billingPeriod === 'yearly' ? Math.floor(plan.price * 0.8) : plan.price}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && plan.price > 0 && (
                      <p className="text-sm text-green-400 mt-1">
                        Save ${plan.price * 12 - Math.floor(plan.price * 0.8) * 12} annually
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="h-5 w-5 text-cyan-400" />
                      <span className="text-lg font-semibold text-cyan-400">
                        {plan.monthlyCredits.toLocaleString()} credits/month
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      For AI queries, code execution & more
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm font-medium text-gray-300 mb-2">AI Providers:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.aiProviders.map((provider: string) => (
                        <Badge
                          key={provider}
                          variant="outline"
                          className="text-xs border-slate-600 text-gray-300"
                        >
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                        : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                    } text-white transition-all duration-300`}
                    data-testid={`upgrade-button-${plan.id}`}
                  >
                    {plan.price === 0 ? 'Get Started' : 'Upgrade to ' + plan.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">What are credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Credits are our universal currency for platform usage. They cover AI queries, 
                  code execution in sandboxes, file operations, and advanced features like 
                  consciousness and superintelligence capabilities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Can I change plans?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                  immediately, and we'll prorate billing accordingly. Unused credits don't roll over.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">What if I exceed my credits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  We'll notify you when you're running low. Once exhausted, you can upgrade 
                  your plan or wait for your monthly reset. Critical features remain accessible 
                  with reduced quotas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Our Explorer plan is completely free forever with 100 monthly credits. 
                  It's perfect for trying out Space Child and building small projects without any commitment.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-r from-slate-800/90 to-purple-800/90 backdrop-blur-sm border border-purple-500/30 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Ready to build with AI?
              </CardTitle>
              <CardDescription className="text-gray-300">
                Start your journey with Space Child today. No credit card required for the Explorer plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                data-testid="get-started-cta"
              >
                Get Started Now
                <Sparkles className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}