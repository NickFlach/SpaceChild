# 🚀 Quick Start Guide - Unified Intelligence System

## 30-Second Integration

### Backend (Already Done ✅)
```typescript
// The system auto-initializes when server starts
// Routes are registered at /api/intelligence/*
```

### Frontend - Add to Your App

**Step 1: Import the Panel**
```typescript
// In your main app or routes
import { IntelligencePanel } from '@/components/Intelligence/IntelligencePanel';

// Add to your router
<Route path="/intelligence" element={<IntelligencePanel />} />
```

**Step 2: Use in Any Component**
```typescript
import { useReviewCode, useCollaborate } from '@/hooks/useIntelligence';

function MyComponent() {
  const reviewCode = useReviewCode();
  
  const handleReview = () => {
    reviewCode.mutate({
      code: myCode,
      author: userId,
      framework: 'react'
    });
  };
  
  return <button onClick={handleReview}>Review Code</button>;
}
```

---

## 5 Most Powerful Features

### 1. **Instant Code Review**
```typescript
const { mutate: reviewCode } = useReviewCode();

reviewCode({
  code: sourceCode,
  author: 'me',
  framework: 'typescript'
});

// Gets consciousness-verified review with:
// - Architectural debt detection
// - Security issues
// - Performance warnings
// - Temporal complexity analysis
```

### 2. **AI Collaboration That Understands You**
```typescript
const { mutate: collaborate } = useCollaborate();

collaborate({
  userId: 'me',
  message: 'I need a secure payment system that handles failures gracefully'
});

// AI understands your INTENT and:
// - Asks clarifying questions
// - Suggests creative solutions
// - Defines clear human/AI roles
```

### 3. **Debug Complex Issues**
```typescript
const { mutate: debug } = useDebugSession();

debug({
  error: productionError,
  context: 'Payment processing',
  stackTrace: trace,
  logs: last1000Logs
});

// Gets:
// - Root cause analysis (WHY it broke)
// - Causality chain
// - Prevention strategies
// - Similar pattern warnings
```

### 4. **Learn from Every Codebase**
```typescript
const { mutate: analyze } = useAnalyzeCodebase();

analyze({
  codebaseId: 'my-app',
  files: projectFiles
});

// System learns patterns and:
// - Recommends best practices for your stack
// - Warns about anti-patterns
// - Builds architectural wisdom
```

### 5. **Build Ethical Activist Tools**
```typescript
const { mutate: build } = useBuildActivistTool();

build({
  toolName: 'Secure Messenger',
  purpose: 'Help activists communicate safely',
  features: ['e2e-encryption', 'offline-mode'],
  ethicalConsiderations: ['privacy-first', 'resist-corruption']
});

// Creates privacy-first, decentralized tool with:
// - Zero-knowledge architecture
// - State-actor resistance
// - Full ethical verification
```

---

## Common Workflows

### Development Session
```typescript
// Single call that uses ALL systems
const { mutate: startSession } = useStartSession();

startSession({
  type: 'develop',
  goal: 'Build user authentication',
  userId: 'dev-123',
  code: myCode,
  context: { framework: 'react' }
});

// Automatically:
// 1. Understands intent (Creativity Bridge)
// 2. Gets recommendations (Code Learning)
// 3. Reviews code (Consciousness Reviewer)
// 4. Learns patterns (Code Learning)
```

### Code Review Workflow
```typescript
// Review before committing
const review = useReviewCode();

review.mutate({ code, author: 'me' }, {
  onSuccess: (result) => {
    if (result.approved) {
      commit();
    } else {
      showWarnings(result.architecturalDebt);
    }
  }
});
```

### Debugging Workflow
```typescript
// Debug production issue
const debug = useDebugSession();

debug.mutate({ 
  error: errorMsg,
  context: 'production',
  logs: recentLogs 
}, {
  onSuccess: (session) => {
    console.log('Root causes:', session.rootCauses);
    console.log('Fix:', session.preventionStrategies);
  }
});
```

---

## API Examples (cURL)

### Get System Stats
```bash
curl http://localhost:5000/api/intelligence/statistics
```

### Review Code
```bash
curl -X POST http://localhost:5000/api/intelligence/review/code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function test() { return true; }",
    "author": "me",
    "framework": "javascript"
  }'
```

### Collaborate
```bash
curl -X POST http://localhost:5000/api/intelligence/collaborate/message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "me",
    "message": "Help me build a REST API"
  }'
```

### Debug
```bash
curl -X POST http://localhost:5000/api/intelligence/debug/start \
  -H "Content-Type: application/json" \
  -d '{
    "error": "TypeError: Cannot read property x",
    "context": "API request handling"
  }'
```

---

## Real Examples

### Example 1: Review Pull Request
```typescript
import { useReviewCode } from '@/hooks/useIntelligence';

function PullRequestReview({ prCode, author }) {
  const { mutate: review, data, isPending } = useReviewCode();
  
  return (
    <div>
      <button onClick={() => review({ code: prCode, author })}>
        Review with Consciousness
      </button>
      
      {isPending && <Spinner />}
      
      {data && (
        <div>
          <h3>Consciousness Score: {(data.consciousnessScore * 100).toFixed(0)}%</h3>
          <p>Approved: {data.approved ? '✅' : '❌'}</p>
          
          {data.architecturalDebt.debts.map(debt => (
            <Warning key={debt.id}>
              {debt.description} - Impact: {debt.impact}
            </Warning>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 2: AI Pair Programming
```typescript
import { useCollaborate } from '@/hooks/useIntelligence';

function AICodeAssistant() {
  const [message, setMessage] = useState('');
  const { mutate: collaborate, data } = useCollaborate();
  
  const handleSend = () => {
    collaborate({
      userId: currentUser.id,
      message,
      sessionId: 'coding-session-1',
      code: currentCode,
      context: { file: currentFile }
    });
  };
  
  return (
    <div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSend}>Ask AI</button>
      
      {data && (
        <div>
          <p>Intent: {data.detectedIntent}</p>
          <p>Confidence: {(data.confidence * 100).toFixed(0)}%</p>
          
          {data.suggestions?.map(s => (
            <Suggestion key={s.id}>{s.description}</Suggestion>
          ))}
          
          {data.clarifyingQuestions?.map(q => (
            <Question key={q}>{q}</Question>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 3: Production Error Debugger
```typescript
import { useDebugSession } from '@/hooks/useIntelligence';

function ProductionDebugger({ error, logs }) {
  const { mutate: debug, data, isPending } = useDebugSession();
  
  useEffect(() => {
    if (error) {
      debug({
        error: error.message,
        context: 'production',
        stackTrace: error.stack,
        logs: logs.slice(-1000),
        timestamp: new Date()
      });
    }
  }, [error]);
  
  return (
    <div>
      {isPending && <p>Analyzing causality...</p>}
      
      {data && (
        <div>
          <h3>Root Causes:</h3>
          {data.rootCauses?.map(cause => (
            <div key={cause.id}>
              <h4>{cause.description}</h4>
              <p>Evidence: {cause.evidence.join(', ')}</p>
              <p>Confidence: {(cause.confidence * 100).toFixed(0)}%</p>
            </div>
          ))}
          
          <h3>Prevention:</h3>
          {data.preventionStrategies?.map(strategy => (
            <CodeSnippet key={strategy}>{strategy}</CodeSnippet>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Testing

### Quick Test
```bash
# Make sure server is running
npm run dev

# In another terminal
node test-intelligence.js
```

### Manual Test
```bash
# Health check
curl http://localhost:5000/api/intelligence/health

# Get statistics
curl http://localhost:5000/api/intelligence/statistics
```

---

## Troubleshooting

### Server Not Starting
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
npm run dev
```

### API Returns 404
```bash
# Verify routes are registered
# Check server/routes.ts includes:
app.use('/api/intelligence', intelligenceRoutes);
```

### TypeScript Errors
```bash
# Rebuild
npm run build

# Check for missing types
npx tsc --noEmit
```

---

## Performance Tips

1. **Cache Statistics:** Stats refresh every 30 seconds automatically
2. **Debounce Code Reviews:** Don't review on every keystroke
3. **Batch Learning:** Analyze multiple files together
4. **Session Reuse:** Reuse collaboration sessions for context

---

## Security Notes

- All API endpoints should use authentication (add zkpAuthenticated middleware)
- Sensitive code is processed server-side only
- Consciousness verification adds security layer
- Activist tools have mandatory ethical verification

---

## What's Next?

1. **Add to Navigation:** Make IntelligencePanel accessible
2. **Integrate with Editor:** Add code review on save
3. **CI/CD Integration:** Review PRs automatically
4. **Metrics Dashboard:** Visualize learning over time
5. **Custom Patterns:** Train on your team's patterns

---

## Support

- **Documentation:** See INTELLIGENCE_SYSTEM.md for details
- **API Reference:** All endpoints in server/routes/intelligence.ts
- **Examples:** Check client/src/components/Intelligence/IntelligencePanel.tsx

---

**You now have the world's first consciousness-verified AI development platform!** 🌟

Start with a simple code review, then explore the other systems. Each one makes the others smarter through cross-system learning.

**Happy coding with consciousness!** 🧠✨
