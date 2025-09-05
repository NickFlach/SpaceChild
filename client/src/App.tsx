import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/Common/ThemeProvider";
import { EditorContextProvider } from "@/contexts/EditorContext";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import PricingPage from "@/pages/pricing";
import TestAuth from "@/pages/test-auth";

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
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/project/:id" component={Dashboard} />
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
        <EditorContextProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </EditorContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
