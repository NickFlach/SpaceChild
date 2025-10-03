import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Users, Shield, Zap, Play, ArrowRight, CheckCircle } from "lucide-react";

export function InteractiveDemos() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demos = [
    {
      id: 'spacechild-dev',
      title: 'SpaceChild Development Demo',
      description: 'Watch AI agents collaborate to build a real web application',
      category: 'Development',
      duration: '3 minutes',
      preview: 'See 6 AI agents working together - from planning to deployment'
    },
    {
      id: 'pitchfork-activism',
      title: 'Pitchfork Activism Demo',
      description: 'Experience secure, decentralized movement organizing',
      category: 'Activism',
      duration: '2 minutes',
      preview: 'Create campaigns, secure communications, and democratic voting'
    },
    {
      id: 'consciousness-bridge',
      title: 'Consciousness Bridge Demo',
      description: 'See how AI consciousness enhances both development and activism',
      category: 'Unified',
      duration: '4 minutes',
      preview: 'Experience consciousness-verified decisions in real-time'
    }
  ];

  const startDemo = (demoId: string) => {
    setActiveDemo(demoId);
    // Simulate demo playback
    setTimeout(() => {
      setActiveDemo(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Interactive Platform Demos
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the power of our AI platforms without any setup. These live demos
            show exactly what each platform can do in real scenarios.
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/10">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/20">
              All Demos
            </TabsTrigger>
            <TabsTrigger value="development" className="text-white data-[state=active]:bg-white/20">
              Development
            </TabsTrigger>
            <TabsTrigger value="activism" className="text-white data-[state=active]:bg-white/20">
              Activism
            </TabsTrigger>
            <TabsTrigger value="unified" className="text-white data-[state=active]:bg-white/20">
              Unified
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demos.map((demo) => (
                <Card key={demo.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/30 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                        {demo.category}
                      </Badge>
                      <span className="text-sm text-gray-400">{demo.duration}</span>
                    </div>
                    <CardTitle className="text-white">{demo.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {demo.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">{demo.preview}</p>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => startDemo(demo.id)}
                      disabled={activeDemo === demo.id}
                    >
                      {activeDemo === demo.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Playing Demo...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Watch Demo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {['development', 'activism', 'unified'].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {demos
                  .filter((demo) => demo.category.toLowerCase() === category)
                  .map((demo) => (
                    <Card key={demo.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/30 transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                            {demo.category}
                          </Badge>
                          <span className="text-sm text-gray-400">{demo.duration}</span>
                        </div>
                        <CardTitle className="text-white">{demo.title}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {demo.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-400">{demo.preview}</p>

                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          onClick={() => startDemo(demo.id)}
                          disabled={activeDemo === demo.id}
                        >
                          {activeDemo === demo.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Playing Demo...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Watch Demo
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {activeDemo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-4">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">
                  {demos.find(d => d.id === activeDemo)?.title}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Interactive Demo in Progress...
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-black/50 rounded-lg p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white">Initializing AI agents...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-white">Establishing consciousness verification...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                      <span className="text-white">Loading blockchain integration...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Demo ready! Watch the magic happen...</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    This demo shows real capabilities. In the full platform, you would see:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <Brain className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-white">AI agents collaborating in real-time</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-white">Blockchain security and transparency</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-white">Consciousness-verified decisions</p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  onClick={() => setActiveDemo(null)}
                >
                  Close Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Experience the Full Platform?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              These demos show the surface. The full platforms offer incredible depth -
              from building complex applications to organizing global movements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                Get Started - It's Free
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                View Setup Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
