import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/Common/ThemeProvider";
import { EditorContextProvider } from "@/contexts/EditorContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { GitHubProvider } from "@/providers/GitHubProvider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import GitHubPage from "@/pages/GitHubPage";
import NotFound from "@/pages/not-found";
import PricingPage from "@/pages/pricing";
import TestAuth from "@/pages/test-auth";
import DocsPage from "@/pages/docs";
import { ConsciousnessDevPlatform } from "@/components/ConsciousnessPlatform/ConsciousnessDevPlatform";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center neural-network-bg relative">
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent space-child-glow"></div>
          <p className="text-muted-foreground space-child-text-glow">Loading Space Child...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/test-auth" component={TestAuth} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/docs" component={DocsPage} />
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/project/:id" component={Dashboard} />
          <Route path="/github" component={GitHubPage} />
          <Route path="/consciousness" component={ConsciousnessDevPlatform} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GitHubProvider>
        <EditorContextProvider>
          <CollaborationProvider autoConnect={true}>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CollaborationProvider>
        </EditorContextProvider>
        </GitHubProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
