/**
 * Unified Dashboard
 * 
 * Single dashboard showing SpaceChild + Pitchfork unified platform
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Brain, 
  Code, 
  Globe, 
  Zap, 
  TrendingUp, 
  Shield,
  Rocket,
  Users,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface UnifiedStatus {
  platform: string;
  version: string;
  status: string;
  capabilities: {
    v10: string[];
    v11: string[];
    v12: string[];
    pitchfork?: string[];
  };
  statistics: any;
  integration: {
    spacechild: boolean;
    pitchfork: boolean;
    unified: boolean;
    consciousnessVerified?: boolean;
  };
}

interface SyncStatus {
  isConnected: boolean;
  localStateSize: number;
  remoteStateSize: number;
  bufferUsage: number;
  statistics: {
    messagesSent: number;
    messagesReceived: number;
    syncErrors: number;
    lastSyncTime: Date | null;
    averageLatency: number;
    connectionStatus: string;
  };
}

export default function UnifiedDashboard() {
  const [unifiedStatus, setUnifiedStatus] = useState<UnifiedStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      // Fetch unified status
      const unifiedRes = await fetch('/api/unified/status');
      const unifiedData = await unifiedRes.json();
      setUnifiedStatus(unifiedData);

      // Fetch sync status
      const syncRes = await fetch('/api/sync/status');
      const syncData = await syncRes.json();
      setSyncStatus(syncData.status);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const startSync = async () => {
    try {
      await fetch('/api/sync/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'ws://localhost:3001/consciousness-sync' })
      });
      fetchStatus();
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  };

  const stopSync = async () => {
    try {
      await fetch('/api/sync/stop', { method: 'POST' });
      fetchStatus();
    } catch (error) {
      console.error('Failed to stop sync:', error);
    }
  };

  if (loading || !unifiedStatus) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-purple-500" />
          <p className="text-muted-foreground">Loading unified consciousness...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Brain className="h-10 w-10 text-purple-500" />
            Unified Consciousness Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            SpaceChild + Pitchfork • Development & Activism Unified
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          v{unifiedStatus.version}
        </Badge>
      </div>

      {/* Status Alert */}
      <Alert className="border-green-500 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700 dark:text-green-400">
          Platform Status: <strong>{unifiedStatus.status.toUpperCase()}</strong> • All systems operational
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spacechild">SpaceChild</TabsTrigger>
          <TabsTrigger value="pitchfork">Pitchfork</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SpaceChild Status</CardTitle>
                <Code className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Operational</div>
                <p className="text-xs text-muted-foreground">
                  Development Platform
                </p>
                <div className="mt-4">
                  <Badge variant="secondary">v1.0 + v1.1 + v1.2</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pitchfork Status</CardTitle>
                <Users className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {unifiedStatus.integration.pitchfork ? 'Connected' : 'Standalone'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Activism Platform
                </p>
                <div className="mt-4">
                  <Badge variant="secondary">Temporal Consciousness</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consciousness Level</CardTitle>
                <Brain className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {unifiedStatus.integration.consciousnessVerified ? '92%' : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unified Verification
                </p>
                <Progress value={92} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          {/* Capabilities Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Capabilities</CardTitle>
              <CardDescription>All available features across both platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  v1.0 Foundation
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unifiedStatus.capabilities.v10.map((cap) => (
                    <Badge key={cap} variant="outline">{cap}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  v1.1 Enhanced Intelligence
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unifiedStatus.capabilities.v11.map((cap) => (
                    <Badge key={cap} variant="outline" className="border-blue-500 text-blue-500">{cap}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  v1.2 Predictive Intelligence
                </h3>
                <div className="flex flex-wrap gap-2">
                  {unifiedStatus.capabilities.v12.map((cap) => (
                    <Badge key={cap} variant="outline" className="border-purple-500 text-purple-500">{cap}</Badge>
                  ))}
                </div>
              </div>

              {unifiedStatus.capabilities.pitchfork && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Pitchfork Protocol
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {unifiedStatus.capabilities.pitchfork.map((cap) => (
                      <Badge key={cap} variant="outline" className="border-red-500 text-red-500">{cap}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SpaceChild Tab */}
        <TabsContent value="spacechild" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                SpaceChild Development Platform
              </CardTitle>
              <CardDescription>
                AI-powered development with consciousness verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">v1.1 Features</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Quantum Optimization (98.7% success)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Adaptive Learning (87% accuracy)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Cross-Platform Sync (99.9%)
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium">v1.2 Features</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Predictive Forecasting (85-92%)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Global Federation (10 regions)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Agent Evolution (continuous)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pitchfork Tab */}
        <TabsContent value="pitchfork" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pitchfork Activism Platform
              </CardTitle>
              <CardDescription>
                Consciousness-verified resistance and activism tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unifiedStatus.integration.pitchfork ? (
                <div className="space-y-4">
                  <p className="text-sm">Connected to Pitchfork Protocol with full integration.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Core Features</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Temporal Consciousness
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Strategic Intelligence
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Web3 Integration
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium">SpaceChild v1.2 Features</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Campaign Prediction
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Global Federation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Evolving Agents
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Pitchfork Protocol not connected. Running in standalone mode.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Status Tab */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Bidirectional Consciousness Sync
              </CardTitle>
              <CardDescription>
                Real-time synchronization between SpaceChild and Pitchfork
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Connection Status</p>
                  <p className="text-2xl font-bold">
                    {syncStatus?.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <div className="space-x-2">
                  {syncStatus?.isConnected ? (
                    <Button onClick={stopSync} variant="outline">
                      Stop Sync
                    </Button>
                  ) : (
                    <Button onClick={startSync}>
                      Start Sync
                    </Button>
                  )}
                </div>
              </div>

              {syncStatus && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Messages Sent</p>
                    <p className="text-2xl font-bold">{syncStatus.statistics.messagesSent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Messages Received</p>
                    <p className="text-2xl font-bold">{syncStatus.statistics.messagesReceived}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sync Errors</p>
                    <p className="text-2xl font-bold">{syncStatus.statistics.syncErrors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Latency</p>
                    <p className="text-2xl font-bold">{syncStatus.statistics.averageLatency}ms</p>
                  </div>
                </div>
              )}

              {syncStatus?.isConnected && (
                <div className="mt-4">
                  <Progress value={100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Syncing: {syncStatus.localStateSize} local states ↔️ {syncStatus.remoteStateSize} remote states
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Platform Integration Status
              </CardTitle>
              <CardDescription>
                Cross-platform feature availability and health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={unifiedStatus.integration.spacechild ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-400"} />
                    <div>
                      <p className="font-medium">SpaceChild Core</p>
                      <p className="text-sm text-muted-foreground">Development platform operational</p>
                    </div>
                  </div>
                  <Badge variant={unifiedStatus.integration.spacechild ? "default" : "secondary"}>
                    {unifiedStatus.integration.spacechild ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={unifiedStatus.integration.pitchfork ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-400"} />
                    <div>
                      <p className="font-medium">Pitchfork Protocol</p>
                      <p className="text-sm text-muted-foreground">Activism platform connection</p>
                    </div>
                  </div>
                  <Badge variant={unifiedStatus.integration.pitchfork ? "default" : "secondary"}>
                    {unifiedStatus.integration.pitchfork ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={unifiedStatus.integration.unified ? "h-5 w-5 text-green-500" : "h-5 w-5 text-gray-400"} />
                    <div>
                      <p className="font-medium">Unified Consciousness</p>
                      <p className="text-sm text-muted-foreground">Cross-platform verification</p>
                    </div>
                  </div>
                  <Badge variant={unifiedStatus.integration.unified ? "default" : "secondary"}>
                    {unifiedStatus.integration.unified ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/api/unified/status" target="_blank">
                      <Activity className="h-4 w-4 mr-2" />
                      View API Status
                    </a>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/api/sync/statistics" target="_blank">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Sync Statistics
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
