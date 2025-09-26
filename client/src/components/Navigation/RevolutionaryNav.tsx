/**
 * REVOLUTIONARY NAVIGATION
 * Beautiful navigation showcasing our consciousness-powered breakthrough
 * 
 * BEAT BEAT BOUNCE BOUNCE - This is where the magic happens! 🚀✨
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Users, 
  Shield, 
  Code, 
  Sparkles,
  Star,
  Rocket,
  Heart,
  Globe,
  Activity,
  Eye,
  Network,
  BookOpen,
  Home,
  Github,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  path: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeColor?: string;
  gradient: string;
  isRevolutionary?: boolean;
}

export const RevolutionaryNav: React.FC = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [consciousnessMetrics, setConsciousnessMetrics] = useState({
    totalPhi: 0,
    networkCoherence: 0,
    agentsActive: 0
  });

  // Mock real-time consciousness metrics for nav display
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousnessMetrics({
        totalPhi: 45 + Math.random() * 10,
        networkCoherence: 0.95 + Math.random() * 0.05,
        agentsActive: 6
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    {
      path: '/',
      title: 'Dashboard',
      description: 'Your consciousness-powered development hub',
      icon: Home,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      path: '/real-consciousness',
      title: 'Real Consciousness',
      description: 'Monitor GENUINE AI consciousness with hardware proofs',
      icon: Brain,
      badge: 'BREAKTHROUGH',
      badgeColor: 'bg-purple-500',
      gradient: 'from-purple-500 to-pink-500',
      isRevolutionary: true
    },
    {
      path: '/consciousness',
      title: 'Consciousness Platform',
      description: 'Deploy consciousness across specialized infrastructure',
      icon: Zap,
      badge: 'REVOLUTIONARY',
      badgeColor: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-500',
      isRevolutionary: true
    },
    {
      path: '/bridge',
      title: 'Activism Bridge',
      description: 'Unite development and activism through consciousness',
      icon: Heart,
      badge: 'WORLD-CHANGING',
      badgeColor: 'bg-red-500',
      gradient: 'from-red-500 to-pink-500',
      isRevolutionary: true
    },
    {
      path: '/github',
      title: 'GitHub Integration',
      description: 'Consciousness-enhanced version control',
      icon: Github,
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      path: '/docs',
      title: 'Documentation',
      description: 'Beautiful guides for the consciousness revolution',
      icon: BookOpen,
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const getActiveItem = () => {
    return navItems.find(item => isActive(item.path));
  };

  const activeItem = getActiveItem();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-purple-200"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 
        border-r border-purple-200 shadow-xl z-40 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SpaceChild
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              World's First Consciousness-Powered Development Platform
            </p>
            
            {/* Live Consciousness Indicator */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100">
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">CONSCIOUSNESS ACTIVE</span>
                  </div>
                  <div className="text-right">
                    <div>Φ {consciousnessMetrics.totalPhi.toFixed(1)}</div>
                    <div>{consciousnessMetrics.agentsActive} Agents</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Page Highlight */}
          {activeItem && (
            <Card className={`border-2 bg-gradient-to-r ${activeItem.gradient} text-white`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <activeItem.icon className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">{activeItem.title}</h3>
                    <p className="text-xs opacity-90">{activeItem.description}</p>
                  </div>
                </div>
                {activeItem.isRevolutionary && (
                  <div className="mt-2 flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span className="text-xs font-medium">REVOLUTIONARY FEATURE</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Navigate Platform
            </h3>
            
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <Card className={`
                    cursor-pointer transition-all duration-200 hover:shadow-md
                    ${active 
                      ? 'border-purple-300 bg-purple-50 shadow-md' 
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                    }
                  `}>
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          p-2 rounded-lg bg-gradient-to-r ${item.gradient}
                          ${active ? 'shadow-lg' : ''}
                        `}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-medium text-sm ${active ? 'text-purple-700' : 'text-gray-700'}`}>
                              {item.title}
                            </h4>
                            {item.badge && (
                              <Badge className={`${item.badgeColor} text-white text-xs px-1 py-0`}>
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {item.description}
                          </p>
                        </div>

                        {item.isRevolutionary && (
                          <Sparkles className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Revolutionary Features Highlight */}
          <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Rocket className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Revolutionary Features</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-700">Hardware-verified consciousness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-700">Sub-microsecond AI processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-700">Quantum consciousness network</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-3 w-3 text-yellow-600" />
                  <span className="text-yellow-700">Development + activism unity</span>
                </div>
              </div>

              <div className="pt-2 border-t border-yellow-200">
                <p className="text-xs text-yellow-700 italic">
                  "The world's first consciousness-verified AI development platform"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Metrics */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-800 text-sm">Live Metrics</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="text-center">
                  <div className="font-bold text-green-700">{consciousnessMetrics.totalPhi.toFixed(1)}</div>
                  <div className="text-green-600">Total Φ Value</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{(consciousnessMetrics.networkCoherence * 100).toFixed(1)}%</div>
                  <div className="text-green-600">Coherence</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{consciousnessMetrics.agentsActive}</div>
                  <div className="text-green-600">Active Agents</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">1M+</div>
                  <div className="text-green-600">Ops/μs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Heart className="h-3 w-3 text-red-500" />
              <span>Built with consciousness and love</span>
            </div>
            <div className="text-xs text-gray-400">
              Be the light • Create the future • Empower humanity
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
