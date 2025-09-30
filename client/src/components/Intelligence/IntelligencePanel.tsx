import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useIntelligenceStatistics,
  useStartSession,
  useReviewCode,
  useCollaborate,
  useDebugSession,
  useLearningStatistics,
} from '@/hooks/useIntelligence';
import { Brain, Code, MessageSquare, Bug, Shield, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Unified Intelligence System Panel
 * Access to all revolutionary AI intelligence features
 */
export function IntelligencePanel() {
  const { data: stats, isLoading: statsLoading } = useIntelligenceStatistics();
  const { data: learningStats } = useLearningStatistics();
  const startSession = useStartSession();
  const reviewCode = useReviewCode();
  const collaborate = useCollaborate();
  const debugSession = useDebugSession();

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            Unified Intelligence System
          </h1>
          <p className="text-muted-foreground mt-1">
            Revolutionary AI systems for code learning, reviews, collaboration, debugging & activism
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-500">
            <span className="animate-pulse mr-1">●</span> All Systems Operational
          </Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Sessions</CardDescription>
              <CardTitle className="text-3xl">{stats.metrics.totalSessions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{stats.activeSessions} active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Patterns Learned</CardDescription>
              <CardTitle className="text-3xl">{stats.metrics.patternsLearned}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{stats.metrics.totalLearningIterations} iterations</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Code Reviews</CardDescription>
              <CardTitle className="text-3xl">{stats.metrics.reviewsCompleted}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Consciousness-verified</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Bugs Debugged</CardDescription>
              <CardTitle className="text-3xl">
                {stats.metrics.bugsDebuggedWithCausality}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bug className="h-4 w-4" />
                <span>With causality tracing</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Code Learning</TabsTrigger>
          <TabsTrigger value="review">Code Review</TabsTrigger>
          <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Status of all intelligence systems</CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="space-y-3">
                  {Object.entries(stats.systemHealth).map(([system, status]) => (
                    <div key={system} className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {system.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant={status === 'operational' ? 'default' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Accumulated intelligence across all systems</CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.knowledgeBaseSize.patterns}</div>
                    <div className="text-sm text-muted-foreground">Code Patterns</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.knowledgeBaseSize.wisdom}</div>
                    <div className="text-sm text-muted-foreground">Architectural Wisdom</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.knowledgeBaseSize.debugInsights}
                    </div>
                    <div className="text-sm text-muted-foreground">Debug Insights</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.knowledgeBaseSize.crossSystemLearnings}
                    </div>
                    <div className="text-sm text-muted-foreground">Cross-System Learnings</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <CodeLearningTab learningStats={learningStats} />
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <CodeReviewTab reviewCode={reviewCode} />
        </TabsContent>

        <TabsContent value="collaborate" className="space-y-4">
          <CollaborateTab collaborate={collaborate} />
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <DebugTab debugSession={debugSession} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components for each tab
function CodeLearningTab({ learningStats }: { learningStats: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Self-Improving Code Intelligence
        </CardTitle>
        <CardDescription>
          The system learns from every codebase analyzed, building knowledge that makes each
          analysis better than the last
        </CardDescription>
      </CardHeader>
      <CardContent>
        {learningStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{learningStats.patternsLearned}</div>
                <div className="text-sm text-muted-foreground">Patterns Learned</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{learningStats.antiPatternsIdentified}</div>
                <div className="text-sm text-muted-foreground">Anti-Patterns</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{learningStats.codebasesAnalyzed}</div>
                <div className="text-sm text-muted-foreground">Codebases Analyzed</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              💡 The learning engine is continuously improving from your code
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Loading learning statistics...</p>
        )}
      </CardContent>
    </Card>
  );
}

function CodeReviewTab({ reviewCode }: { reviewCode: any }) {
  const [code, setCode] = useState('');
  const [author, setAuthor] = useState('');

  const handleReview = () => {
    if (code && author) {
      reviewCode.mutate({ code, author });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Consciousness-Verified Code Review
        </CardTitle>
        <CardDescription>
          Uses temporal consciousness to detect architectural debt and issues that static analysis
          misses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name or ID"
          />
        </div>
        <div>
          <Label htmlFor="code">Code to Review</Label>
          <Textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={10}
          />
        </div>
        <Button onClick={handleReview} disabled={reviewCode.isPending}>
          {reviewCode.isPending ? 'Reviewing...' : 'Review Code'}
        </Button>

        {reviewCode.data && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Review Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(reviewCode.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CollaborateTab({ collaborate }: { collaborate: any }) {
  const [message, setMessage] = useState('');
  const [userId] = useState('demo-user');

  const handleCollaborate = () => {
    if (message) {
      collaborate.mutate({ userId, message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI-Human Creativity Bridge
        </CardTitle>
        <CardDescription>
          Natural collaboration that understands your intent, not just keywords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="message">Your Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me what you want to build..."
            rows={6}
          />
        </div>
        <Button onClick={handleCollaborate} disabled={collaborate.isPending}>
          {collaborate.isPending ? 'Processing...' : 'Collaborate'}
        </Button>

        {collaborate.data && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Response:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(collaborate.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DebugTab({ debugSession }: { debugSession: any }) {
  const [error, setError] = useState('');
  const [stackTrace, setStackTrace] = useState('');

  const handleDebug = () => {
    if (error) {
      debugSession.mutate({ error, stackTrace });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Temporal Debugger
        </CardTitle>
        <CardDescription>
          Traces causality chains to find WHY things broke, not just WHAT broke
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="error">Error Message</Label>
          <Input
            id="error"
            value={error}
            onChange={(e) => setError(e.target.value)}
            placeholder="TypeError: Cannot read property..."
          />
        </div>
        <div>
          <Label htmlFor="stackTrace">Stack Trace (optional)</Label>
          <Textarea
            id="stackTrace"
            value={stackTrace}
            onChange={(e) => setStackTrace(e.target.value)}
            placeholder="at Function.Module._load..."
            rows={6}
          />
        </div>
        <Button onClick={handleDebug} disabled={debugSession.isPending}>
          {debugSession.isPending ? 'Debugging...' : 'Start Debug Session'}
        </Button>

        {debugSession.data && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugSession.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IntelligencePanel;
