import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface PricingCardProps {
  plan: {
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
  };
  billingPeriod: 'monthly' | 'yearly';
  onUpgrade?: (planId: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PricingCard({ plan, billingPeriod, onUpgrade }: PricingCardProps) {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(plan.id);
    } else {
      // Default behavior - could integrate with payment system
      console.log(`Upgrading to ${plan.name} plan`);
    }
  };

  const displayPrice = billingPeriod === 'yearly' && plan.price > 0 
    ? Math.floor(plan.price * 0.8) 
    : plan.price;

  return (
    <motion.div variants={cardVariants}>
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
                ${displayPrice}
              </span>
              <span className="text-gray-400 ml-2">
                /{billingPeriod === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            {billingPeriod === 'yearly' && plan.price > 0 && (
              <p className="text-sm text-green-400 mt-1">
                Save ${plan.price * 12 - displayPrice * 12} annually
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2">
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
            onClick={handleUpgrade}
            data-testid={`upgrade-button-${plan.id}`}
          >
            {plan.price === 0 ? 'Get Started' : 'Upgrade to ' + plan.name}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}