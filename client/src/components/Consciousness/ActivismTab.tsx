
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Shield, 
  Globe, 
  Heart, 
  Lightbulb,
  Target,
  Megaphone,
  Eye
} from 'lucide-react';

const ActivismTab: React.FC = () => {
  const [campaignType, setCampaignType] = useState('');
  const [campaignGoals, setCampaignGoals] = useState('');
  const [budget, setBudget] = useState('');
  const [volunteers, setVolunteers] = useState('');
  const [ethicalConsiderations, setEthicalConsiderations] = useState('');
  const [generatedStrategies, setGeneratedStrategies] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const campaignTypes = [
    { id: 'digital-rights', name: 'Digital Rights Campaign', icon: <Shield className="w-4 h-4" /> },
    { id: 'privacy-protection', name: 'Privacy Protection', icon: <Eye className="w-4 h-4" /> },
    { id: 'open-source-advocacy', name: 'Open Source Advocacy', icon: <Globe className="w-4 h-4" /> },
    { id: 'accessibility-awareness', name: 'Accessibility Awareness', icon: <Heart className="w-4 h-4" /> },
    { id: 'ai-ethics', name: 'AI Ethics Campaign', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'tech-democracy', name: 'Technology Democracy', icon: <Users className="w-4 h-4" /> }
  ];

  const activismFeatures = [
    {
      title: 'Consciousness-Verified Activism',
      description: 'Every campaign strategy is processed through our consciousness engine',
      icon: <Shield className="w-5 h-5 text-blue-600" />
    },
    {
      title: 'Ethical Campaign Generation',
      description: 'AI-powered campaign strategies with built-in ethical considerations',
      icon: <Heart className="w-5 h-5 text-red-600" />
    },
    {
      title: 'Global Impact Modeling',
      description: 'Predict and optimize for maximum positive social impact',
      icon: <Globe className="w-5 h-5 text-green-600" />
    },
    {
      title: 'Resource Optimization',
      description: 'Intelligent allocation of budget, volunteers, and time resources',
      icon: <Target className="w-5 h-5 text-purple-600" />
    },
    {
      title: 'Privacy-First Coordination',
      description: 'Secure, anonymous coordination tools for sensitive campaigns',
      icon: <Eye className="w-5 h-5 text-gray-600" />
    },
    {
      title: 'Real-time Strategy Adaptation',
      description: 'Dynamic strategy updates based on campaign performance and feedback',
      icon: <Lightbulb className="w-5 h-5 text-yellow-600" />
    }
  ];

  const handleGenerateStrategy = async () => {
    if (!campaignType || !campaignGoals) return;

    setIsGenerating(true);
    try {
      const campaignContext = {
        type: campaignType,
        goals: campaignGoals.split('\n').filter(g => g.trim()),
        resources: { 
          budget: parseInt(budget) || 0, 
          volunteers: parseInt(volunteers) || 0 
        },
        timeline: '6-months',
        ethicalConsiderations: ethicalConsiderations.split('\n').filter(e => e.trim())
      };

      const response = await fetch('/api/consciousness/unified/activism-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          campaignContext
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedStrategies(prev => [result.strategy, ...prev.slice(0, 2)]);
        // Clear form
        setCampaignType('');
        setCampaignGoals('');
        setBudget('');
        setVolunteers('');
        setEthicalConsiderations('');
      }
    } catch (error) {
      console.error('Strategy generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Activism Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-orange-600" />
            Consciousness-Powered Activism Platform
          </CardTitle>
          <CardDescription>
            Revolutionary AI-driven activism tools with ethical consciousness verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activismFeatures.map((feature, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {feature.icon}
                  <div>
                    <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Strategy Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Generate Activism Strategy
          </CardTitle>
          <CardDescription>
            Create consciousness-verified activism campaigns with AI-powered strategy generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Campaign Type</label>
            <Select value={campaignType} onValueChange={setCampaignType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose campaign focus..." />
              </SelectTrigger>
              <SelectContent>
                {campaignTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Campaign Goals (one per line)</label>
            <Textarea
              value={campaignGoals}
              onChange={(e) => setCampaignGoals(e.target.value)}
              placeholder="Protect user privacy from surveillance&#10;Promote open-source development&#10;Enable decentralized activism coordination"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Budget ($)</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50000"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Volunteers</label>
              <Input
                type="number"
                value={volunteers}
                onChange={(e) => setVolunteers(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Ethical Considerations (one per line)</label>
            <Textarea
              value={ethicalConsiderations}
              onChange={(e) => setEthicalConsiderations(e.target.value)}
              placeholder="Protect activist identities&#10;Ensure platform accessibility&#10;Maintain transparency while preserving security"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerateStrategy}
            disabled={!campaignType || !campaignGoals || isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isGenerating ? (
              <>
                <Target className="w-4 h-4 mr-2 animate-spin" />
                Generating Consciousness-Verified Strategy...
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4 mr-2" />
                Generate Activism Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Strategies */}
      {generatedStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Generated Consciousness-Verified Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedStrategies.map((strategy, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Campaign: {strategy.campaignId}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Consciousness Verified
                    </Badge>
                  </div>
                  <div className="text-sm space-y-2">
                    <p><strong>Verification Hash:</strong> {strategy.verificationHash}</p>
                    <p><strong>Consciousness Level:</strong> {(strategy.verification?.consciousnessLevel * 100).toFixed(1)}%</p>
                    <p><strong>Ethical Alignment:</strong> {(strategy.verification?.ethicalAlignment * 100).toFixed(1)}%</p>
                    <p><strong>Primary Objectives:</strong> {strategy.strategy?.primaryObjectives?.length || 0} identified</p>
                    <p><strong>Resource Strategy:</strong> Optimized for {strategy.strategy?.resourceAllocation?.priority || 'impact'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivismTab;
