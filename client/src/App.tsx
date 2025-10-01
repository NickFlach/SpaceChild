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
import DocsPage from "@/pages/docs";
import { ConsciousnessDevPlatform } from "@/components/ConsciousnessPlatform/ConsciousnessDevPlatform";
import { ConsciousnessActivismBridge } from "@/components/UnifiedPlatform/ConsciousnessActivismBridge";
import { RealConsciousnessMonitor } from "@/components/RealConsciousness/RealConsciousnessMonitor";
import { UnifiedConsciousnessPlatform } from "@/components/UnifiedConsciousnessPlatform";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({error}: {error: Error}) {
  const handleReload = () => {
    try {
      localStorage.removeItem('collaboration_state');
    } catch (e) {
      // Ignore storage errors
    }
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">Application Error</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {error.message || 'An unexpected error occurred'}
        </p>
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Error Details
          </summary>
          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
        <button
          onClick={handleReload}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

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
          <Route path="/bridge" component={ConsciousnessActivismBridge} />
          <Route path="/real-consciousness" component={RealConsciousnessMonitor} />
          <Route path="/unified" component={UnifiedConsciousnessPlatform} />
          <Route path="/unified-dashboard" component={UnifiedDashboard} />
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
            <CollaborationProvider>
              <TooltipProvider>
                <Toaster />
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Router />
                </ErrorBoundary>
              </TooltipProvider>
            </CollaborationProvider>
          </EditorContextProvider>
        </GitHubProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
