import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Sparkles, 
  Loader2, 
  Shield, 
  Zap, 
  Users,
  Code,
  Database,
  Brain,
  CheckCircle2,
  Info,
  X
} from "lucide-react";
import type { Project } from "@shared/schema";

interface SmartTemplateCreatorProps {
  onProjectCreated?: (project: Project) => void;
  onCancel?: () => void;
}

interface AnalysisResult {
  recommendedTemplate: any;
  customizations: {
    dependencies: string[];
    securityFeatures: string[];
    architecturePatterns: string[];
    fileStructure: Array<{ path: string; content: string; purpose: string }>;
  };
  optimizations: {
    performance: string[];
    scalability: string[];
    security: string[];
  };
  confidence: number;
}

export default function SmartTemplateCreator({ onProjectCreated, onCancel }: SmartTemplateCreatorProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [scalability, setScalability] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [securityLevel, setSecurityLevel] = useState<'basic' | 'standard' | 'high' | 'critical'>('standard');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState("");
  const [currentFeature, setCurrentFeature] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("configure");
  const { toast } = useToast();

  // Analyze project requirements
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/templates/analyze", {
        projectDescription: description,
        targetAudience,
        preferredTechStack: techStack,
        requiredFeatures: features,
        scalabilityNeeds: scalability,
        securityLevel
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setActiveTab("review");
      toast({
        title: "Analysis Complete",
        description: `Found the perfect template with ${Math.round(data.confidence * 100)}% confidence`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze project requirements",
        variant: "destructive",
      });
    }
  });

  // Create smart project
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/templates/smart-create", {
        config: {
          projectDescription: description,
          targetAudience,
          preferredTechStack: techStack,
          requiredFeatures: features,
          scalabilityNeeds: scalability,
          securityLevel
        },
        projectName
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Project Created!",
        description: "Your intelligent project has been set up successfully",
      });
      if (onProjectCreated) {
        onProjectCreated(data.project);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Creation Failed",
        description: "Failed to create smart project",
        variant: "destructive",
      });
    }
  });

  const addTech = () => {
    if (currentTech && !techStack.includes(currentTech)) {
      setTechStack([...techStack, currentTech]);
      setCurrentTech("");
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const addFeature = () => {
    if (currentFeature && !features.includes(currentFeature)) {
      setFeatures([...features, currentFeature]);
      setCurrentFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const getScalabilityIcon = () => {
    switch (scalability) {
      case 'small': return <Users className="h-4 w-4" />;
      case 'medium': return <Zap className="h-4 w-4" />;
      case 'large': return <Database className="h-4 w-4" />;
      case 'enterprise': return <Brain className="h-4 w-4" />;
    }
  };

  const getSecurityIcon = () => {
    return <Shield className={`h-4 w-4 ${
      securityLevel === 'critical' ? 'text-red-500' :
      securityLevel === 'high' ? 'text-orange-500' :
      securityLevel === 'standard' ? 'text-blue-500' :
      'text-gray-500'
    }`} />;
  };

  const canAnalyze = projectName && description;
  const canCreate = analysis && projectName;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-consciousness" />
          Smart Project Creator
        </CardTitle>
        <CardDescription>
          Describe your project and let AI configure everything intelligently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="review" disabled={!analysis}>Review & Create</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome App"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your project does, its main features, and goals..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Small businesses, developers, general public"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label>Preferred Technologies (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  placeholder="e.g., React, Node.js, PostgreSQL"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                />
                <Button onClick={addTech} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    {tech}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTech(tech)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Required Features */}
            <div className="space-y-2">
              <Label>Required Features (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  placeholder="e.g., Authentication, Payment processing, Real-time chat"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button onClick={addFeature} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature) => (
                  <Badge key={feature} variant="outline" className="flex items-center gap-1">
                    {feature}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFeature(feature)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scalability">Scalability Needs</Label>
                <Select value={scalability} onValueChange={(v: any) => setScalability(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (less than 1K users)</SelectItem>
                    <SelectItem value="medium">Medium (1K - 100K users)</SelectItem>
                    <SelectItem value="large">Large (100K - 1M users)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (over 1M users)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="security">Security Level</Label>
                <Select value={securityLevel} onValueChange={(v: any) => setSecurityLevel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (Public data)</SelectItem>
                    <SelectItem value="standard">Standard (User accounts)</SelectItem>
                    <SelectItem value="high">High (Sensitive data)</SelectItem>
                    <SelectItem value="critical">Critical (Financial/Medical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-end gap-2 pt-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={!canAnalyze || analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Requirements
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-6 mt-6">
            {analysis && (
              <>
                {/* Template Selection */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    AI analyzed your requirements with {Math.round(analysis.confidence * 100)}% confidence
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommended Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{analysis.recommendedTemplate.name}</p>
                      <p className="text-sm text-muted-foreground">{analysis.recommendedTemplate.description}</p>
                      <div className="flex gap-2 mt-2">
                        {analysis.recommendedTemplate.techStack.map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Customizations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Dependencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {analysis.customizations.dependencies.slice(0, 5).map((dep) => (
                          <div key={dep} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {dep}
                          </div>
                        ))}
                        {analysis.customizations.dependencies.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{analysis.customizations.dependencies.length - 5} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getSecurityIcon()}
                        Security Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {analysis.customizations.securityFeatures.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <Shield className="h-3 w-3 text-blue-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Optimizations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Intelligent Optimizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="performance">
                      <TabsList>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="scalability">Scalability</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                      </TabsList>
                      <TabsContent value="performance" className="space-y-2 mt-4">
                        {analysis.optimizations.performance.map((opt, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">{idx + 1}</span>
                            </div>
                            <p className="text-sm">{opt}</p>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="scalability" className="space-y-2 mt-4">
                        {analysis.optimizations.scalability.map((opt, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">{idx + 1}</span>
                            </div>
                            <p className="text-sm">{opt}</p>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="security" className="space-y-2 mt-4">
                        {analysis.optimizations.security.map((opt, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs">{idx + 1}</span>
                            </div>
                            <p className="text-sm">{opt}</p>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* File Structure Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generated File Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {analysis.customizations.fileStructure.slice(0, 10).map((file) => (
                        <div key={file.path} className="flex items-center gap-2 text-sm">
                          <Code className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono">{file.path}</span>
                          <span className="text-muted-foreground text-xs">- {file.purpose}</span>
                        </div>
                      ))}
                      {analysis.customizations.fileStructure.length > 10 && (
                        <p className="text-xs text-muted-foreground">
                          +{analysis.customizations.fileStructure.length - 10} more files
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Create Button */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    {getScalabilityIcon()}
                    <span className="text-sm text-muted-foreground">
                      Configured for {scalability} scale
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("configure")}>
                      Back to Configure
                    </Button>
                    <Button
                      onClick={() => createMutation.mutate()}
                      disabled={!canCreate || createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Smart Project
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}