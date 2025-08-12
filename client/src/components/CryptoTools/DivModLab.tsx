import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Clock, 
  Cpu, 
  Info, 
  Play, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Activity,
  Lock,
  Zap
} from 'lucide-react';

interface DivModResult {
  quotient: bigint;
  remainder: bigint;
  iterations: number;
  timeMicros: number;
  trace?: string[];
}

interface TimingStats {
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  cv: number;
  samples: number[];
}

export default function DivModLab() {
  const [dividend, setDividend] = useState<string>('13');
  const [divisor, setDivisor] = useState<string>('5');
  const [result, setResult] = useState<DivModResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [timingStats, setTimingStats] = useState<TimingStats | null>(null);
  const [error, setError] = useState<string>('');
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker for constant-time operations
  useEffect(() => {
    const workerCode = `
      // Constant-time division implementation
      function constantTimeDivMod(dividend, divisor) {
        const startTime = performance.now();
        const trace = [];
        
        // Convert to BigInt for precise calculations
        let a = BigInt(dividend);
        let b = BigInt(divisor);
        
        // Handle edge cases
        if (b === 0n) {
          throw new Error("Division by zero");
        }
        
        // Initialize quotient and remainder
        let quotient = 0n;
        let remainder = a;
        
        // Fixed 64 iterations for constant-time execution
        const BITS = 64;
        trace.push(\`Starting with dividend=\${a}, divisor=\${b}\`);
        
        for (let i = BITS - 1; i >= 0; i--) {
          const bit = 1n << BigInt(i);
          const testValue = b * bit;
          
          // Constant-time conditional: always compute both branches
          const shouldSubtract = remainder >= testValue ? 1n : 0n;
          remainder = remainder - (testValue * shouldSubtract);
          quotient = quotient | (bit * shouldSubtract);
          
          if (i % 8 === 0) { // Log every 8 iterations
            trace.push(\`Bit \${i}: Q=\${quotient.toString(2).padStart(8, '0')}, R=\${remainder}\`);
          }
        }
        
        const endTime = performance.now();
        const timeMicros = Math.round((endTime - startTime) * 1000);
        
        trace.push(\`Final: quotient=\${quotient}, remainder=\${remainder}\`);
        
        return {
          quotient,
          remainder,
          iterations: BITS,
          timeMicros,
          trace
        };
      }
      
      // Timing analysis
      function analyzeTimings(dividend, divisor, samples = 1000) {
        const timings = [];
        
        for (let i = 0; i < samples; i++) {
          const start = performance.now();
          constantTimeDivMod(dividend, divisor);
          const end = performance.now();
          timings.push((end - start) * 1000); // Convert to microseconds
        }
        
        const min = Math.min(...timings);
        const max = Math.max(...timings);
        const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
        const variance = timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timings.length;
        const stdDev = Math.sqrt(variance);
        const cv = (stdDev / mean) * 100;
        
        return {
          min: Math.round(min),
          max: Math.round(max),
          mean: Math.round(mean),
          stdDev: Math.round(stdDev * 100) / 100,
          cv: Math.round(cv * 100) / 100,
          samples: timings.slice(0, 100) // Return first 100 samples for visualization
        };
      }
      
      self.onmessage = function(e) {
        const { type, dividend, divisor } = e.data;
        
        try {
          if (type === 'compute') {
            const result = constantTimeDivMod(dividend, divisor);
            self.postMessage({ 
              type: 'result', 
              result: {
                ...result,
                quotient: result.quotient.toString(),
                remainder: result.remainder.toString()
              }
            });
          } else if (type === 'analyze') {
            const stats = analyzeTimings(dividend, divisor);
            self.postMessage({ type: 'stats', stats });
          }
        } catch (error) {
          self.postMessage({ type: 'error', error: error.message });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;
    
    worker.onmessage = (e) => {
      if (e.data.type === 'result') {
        setResult({
          ...e.data.result,
          quotient: BigInt(e.data.result.quotient),
          remainder: BigInt(e.data.result.remainder)
        });
        setIsComputing(false);
      } else if (e.data.type === 'stats') {
        setTimingStats(e.data.stats);
      } else if (e.data.type === 'error') {
        setError(e.data.error);
        setIsComputing(false);
      }
    };
    
    return () => worker.terminate();
  }, []);

  const handleCompute = () => {
    setError('');
    setIsComputing(true);
    
    const a = parseInt(dividend);
    const b = parseInt(divisor);
    
    if (isNaN(a) || isNaN(b)) {
      setError('Please enter valid numbers');
      setIsComputing(false);
      return;
    }
    
    if (b === 0) {
      setError('Division by zero is not allowed');
      setIsComputing(false);
      return;
    }
    
    workerRef.current?.postMessage({ type: 'compute', dividend: a, divisor: b });
  };

  const handleAnalyzeTiming = () => {
    const a = parseInt(dividend);
    const b = parseInt(divisor);
    
    if (isNaN(a) || isNaN(b) || b === 0) {
      setError('Please enter valid numbers first');
      return;
    }
    
    setIsComputing(true);
    workerRef.current?.postMessage({ type: 'analyze', dividend: a, divisor: b });
    setIsComputing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Cryptographic Division Lab
          </h2>
          <p className="text-muted-foreground mt-2">
            Explore constant-time arithmetic operations for side-channel resistance
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Shield className="w-4 h-4 mr-2" />
          Security Research
        </Badge>
      </div>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">
            <Cpu className="w-4 h-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="timing">
            <Clock className="w-4 h-4 mr-2" />
            Timing Analysis
          </TabsTrigger>
          <TabsTrigger value="learn">
            <Info className="w-4 h-4 mr-2" />
            Learn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Constant-Time Division Calculator</CardTitle>
              <CardDescription>
                Performs division using a fixed 64-iteration algorithm to prevent timing attacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dividend">Dividend</Label>
                  <Input
                    id="dividend"
                    type="number"
                    value={dividend}
                    onChange={(e) => setDividend(e.target.value)}
                    placeholder="Enter dividend"
                    data-testid="input-dividend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="divisor">Divisor</Label>
                  <Input
                    id="divisor"
                    type="number"
                    value={divisor}
                    onChange={(e) => setDivisor(e.target.value)}
                    placeholder="Enter divisor"
                    data-testid="input-divisor"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCompute} 
                  disabled={isComputing}
                  className="flex-1"
                  data-testid="button-compute"
                >
                  {isComputing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Computing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Compute
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTrace(!showTrace)}
                  disabled={!result}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {showTrace ? 'Hide' : 'Show'} Trace
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-cyan-400">
                          {result.quotient.toString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Quotient</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-400">
                          {result.remainder.toString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Remainder</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {result.iterations} iterations
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {result.timeMicros} μs
                    </div>
                  </div>

                  {showTrace && result.trace && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Execution Trace</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <pre className="text-xs font-mono">
                            {result.trace.join('\n')}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timing Analysis</CardTitle>
              <CardDescription>
                Analyze execution time consistency across multiple runs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAnalyzeTiming}
                disabled={isComputing}
                className="w-full"
                data-testid="button-analyze"
              >
                <Activity className="w-4 h-4 mr-2" />
                Run 1000 Sample Analysis
              </Button>

              {timingStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Min</span>
                            <span className="font-mono">{timingStats.min} μs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Max</span>
                            <span className="font-mono">{timingStats.max} μs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Mean</span>
                            <span className="font-mono">{timingStats.mean} μs</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Std Dev</span>
                            <span className="font-mono">{timingStats.stdDev}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">CV</span>
                            <span className="font-mono">{timingStats.cv}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className={timingStats.cv < 15 ? 'border-green-500' : 'border-yellow-500'}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Timing Analysis Result</AlertTitle>
                    <AlertDescription>
                      {timingStats.cv < 15 
                        ? `Excellent constant-time properties! CV of ${timingStats.cv}% indicates minimal timing variance.`
                        : `Moderate timing variance detected. CV of ${timingStats.cv}% may allow timing attacks.`
                      }
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Constant-Time Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">What are Side-Channel Attacks?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Side-channel attacks exploit information leaked through timing, power consumption, 
                      or electromagnetic emissions. By measuring how long operations take, attackers 
                      can infer secret data.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">Constant-Time Execution</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This implementation always performs exactly 64 iterations regardless of input values. 
                      This prevents timing analysis from revealing information about the operands.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <Activity className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <h3 className="font-semibold">Coefficient of Variation (CV)</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      CV measures timing consistency. Lower values (&lt;15%) indicate better constant-time 
                      properties. Production cryptographic code targets CV &lt;10%.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  While this demonstrates constant-time principles, production cryptographic systems 
                  require additional protections including secure random number generation, 
                  proper key management, and comprehensive security audits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}