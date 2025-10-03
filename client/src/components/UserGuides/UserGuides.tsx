import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ArrowRight, Code, Users, Lightbulb, Zap } from "lucide-react";

export function UserGuides() {
  const guides = [
    {
      category: "For Developers",
      icon: Code,
      color: "blue",
      guides: [
        {
          title: "Build a Web App with AI",
          description: "Create a full-stack application with AI agents handling the complex parts",
          difficulty: "Beginner",
          time: "30 minutes",
          steps: [
            "Describe your app idea in plain English",
            "Watch AI agents create the basic structure",
            "Customize the design and features",
            "Add your business logic",
            "Deploy with one click"
          ]
        },
        {
          title: "Fix Bugs Automatically",
          description: "Let AI agents find and fix issues in your existing codebase",
          difficulty: "Intermediate",
          time: "15 minutes",
          steps: [
            "Upload your project files",
            "AI scans for bugs and vulnerabilities",
            "Review suggested fixes",
            "Apply patches automatically",
            "Test the improvements"
          ]
        },
        {
          title: "Optimize Performance",
          description: "Make your app faster with AI-powered performance analysis",
          difficulty: "Advanced",
          time: "20 minutes",
          steps: [
            "Run performance analysis",
            "Identify bottlenecks",
            "Apply AI optimizations",
            "Monitor improvements",
            "Scale as needed"
          ]
        }
      ]
    },
    {
      category: "For Activists",
      icon: Users,
      color: "green",
      guides: [
        {
          title: "Start a Campaign",
          description: "Launch a grassroots movement with secure, decentralized tools",
          difficulty: "Beginner",
          time: "10 minutes",
          steps: [
            "Define your cause and goals",
            "Set up secure communications",
            "Create fundraising campaigns",
            "Build your supporter network",
            "Track progress transparently"
          ]
        },
        {
          title: "Organize Events",
          description: "Coordinate protests, meetings, and actions with privacy protection",
          difficulty: "Beginner",
          time: "15 minutes",
          steps: [
            "Create event details",
            "Set up encrypted planning",
            "Coordinate participants",
            "Manage logistics securely",
            "Document everything on blockchain"
          ]
        },
        {
          title: "Democratic Decision Making",
          description: "Make group decisions with transparent, tamper-proof voting",
          difficulty: "Intermediate",
          time: "20 minutes",
          steps: [
            "Set up your organization",
            "Propose decisions",
            "Secure voting process",
            "Transparent results",
            "Implement outcomes"
          ]
        }
      ]
    },
    {
      category: "For Everyone",
      icon: Lightbulb,
      color: "purple",
      guides: [
        {
          title: "Research & Analysis",
          description: "Get AI help with research, data analysis, and insights",
          difficulty: "Beginner",
          time: "25 minutes",
          steps: [
            "Describe your research question",
            "AI gathers relevant information",
            "Analyzes patterns and trends",
            "Generates insights",
            "Presents findings clearly"
          ]
        },
        {
          title: "Creative Projects",
          description: "Get AI assistance with writing, design, and creative work",
          difficulty: "Beginner",
          time: "30 minutes",
          steps: [
            "Share your creative vision",
            "AI generates ideas and drafts",
            "Collaborate on improvements",
            "Refine and finalize",
            "Share your creation"
          ]
        },
        {
          title: "Learn New Skills",
          description: "Master new technologies with personalized AI tutoring",
          difficulty: "Beginner",
          time: "Ongoing",
          steps: [
            "Choose what you want to learn",
            "AI creates learning path",
            "Interactive practice sessions",
            "Track your progress",
            "Get certified achievements"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Step-by-Step User Guides
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Simple, practical guides to help you accomplish real tasks with our AI platforms.
            No technical jargon, just clear steps to get things done.
          </p>
        </div>

        <Tabs defaultValue="developers" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            {guides.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger
                  key={category.category}
                  value={category.category.toLowerCase()}
                  className="flex items-center space-x-2 text-white data-[state=active]:bg-white/20"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.category}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {guides.map((category) => (
            <TabsContent key={category.category} value={category.category.toLowerCase()}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.guides.map((guide, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className={`border-${category.color}-500/50 text-${category.color}-300`}>
                          {guide.difficulty}
                        </Badge>
                        <Badge variant="outline" className="border-gray-500/50 text-gray-300">
                          {guide.time}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg">{guide.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {guide.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start space-x-2">
                            <CheckCircle className={`w-4 h-4 text-${category.color}-400 mt-0.5 flex-shrink-0`} />
                            <span className="text-sm text-gray-300">{step}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full bg-gradient-to-r from-${category.color}-600 to-${category.color}-700 hover:from-${category.color}-700 hover:to-${category.color}-800 text-white`}
                      >
                        Start This Guide
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Need Something Else?
              </h3>
              <p className="text-gray-300 mb-6">
                These are just the most common use cases. Our AI platforms can help with virtually any task.
                Describe what you want to accomplish and we'll guide you through it.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Describe Your Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
