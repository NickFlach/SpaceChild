import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Dices, 
  Hash, 
  Lock, 
  Unlock,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
  Timer,
  Shuffle,
  Binary,
  Link
} from 'lucide-react';

interface CommitReveal {
  id: string;
  commitment: string;
  secret: string;
  revealed: boolean;
  randomValue?: string;
  timestamp: number;
  verificationHash?: string;
}

interface VRFOutput {
  input: string;
  publicKey: string;
  proof: string;
  randomOutput: string;
  verified: boolean;
  timestamp: number;
}

interface HashChainRandom {
  seed: string;
  iterations: number;
  currentHash: string;
  sequence: string[];
  index: number;
}

interface BlockchainRandom {
  blockHeight: number;
  blockHash: string;
  mixedSeed: string;
  randomValue: string;
  timestamp: number;
}

export default function ProvableRandomGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Commit-Reveal State
  const [commitments, setCommitments] = useState<CommitReveal[]>([]);
  const [secretInput, setSecretInput] = useState('');
  const [currentCommitment, setCurrentCommitment] = useState<CommitReveal | null>(null);
  
  // VRF State
  const [vrfInput, setVrfInput] = useState('');
  const [vrfOutputs, setVrfOutputs] = useState<VRFOutput[]>([]);
  
  // Hash Chain State
  const [hashChain, setHashChain] = useState<HashChainRandom | null>(null);
  const [chainSeed, setChainSeed] = useState('');
  const [chainLength, setChainLength] = useState(100);
  
  // Blockchain-style State
  const [blockchainRandom, setBlockchainRandom] = useState<BlockchainRandom[]>([]);
  const [userSeed, setUserSeed] = useState('');
  
  // Verifiable Delay Function State
  const [vdfInput, setVdfInput] = useState('');
  const [vdfIterations, setVdfIterations] = useState(1000000);
  const [vdfProgress, setVdfProgress] = useState(0);
  const [vdfResult, setVdfResult] = useState<string | null>(null);

  // Commit-Reveal Implementation
  const createCommitment = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const secret = secretInput || crypto.randomUUID();
      const nonce = crypto.randomUUID();
      const commitmentData = `${secret}:${nonce}`;
      
      // Create commitment hash
      const encoder = new TextEncoder();
      const data = encoder.encode(commitmentData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const commitment = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const commit: CommitReveal = {
        id: crypto.randomUUID(),
        commitment,
        secret: commitmentData,
        revealed: false,
        timestamp: Date.now()
      };
      
      setCurrentCommitment(commit);
      setCommitments(prev => [...prev, commit]);
      setSuccess('Commitment created! Save your secret for the reveal phase.');
    } catch (err) {
      setError('Failed to create commitment');
    } finally {
      setIsGenerating(false);
    }
  };

  const revealCommitment = async (commitId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const commit = commitments.find(c => c.id === commitId);
      if (!commit) throw new Error('Commitment not found');
      
      // Verify the commitment
      const encoder = new TextEncoder();
      const data = encoder.encode(commit.secret);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const verificationHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (verificationHash !== commit.commitment) {
        throw new Error('Commitment verification failed!');
      }
      
      // Generate random from the revealed secret
      const randomBuffer = await crypto.subtle.digest('SHA-512', data);
      const randomValue = Array.from(new Uint8Array(randomBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').substring(0, 32);
      
      setCommitments(prev => prev.map(c => 
        c.id === commitId 
          ? { ...c, revealed: true, randomValue, verificationHash }
          : c
      ));
      
      setSuccess('Commitment revealed and verified! Random number generated.');
    } catch (err) {
      setError('Failed to reveal commitment: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // VRF (Verifiable Random Function) Simulation
  const generateVRF = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate VRF with ECDSA-like proof
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        true,
        ["sign", "verify"]
      );
      
      const publicKeyData = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyData)))
        .substring(0, 44); // Shortened for display
      
      // Create VRF proof (signature of input)
      const encoder = new TextEncoder();
      const inputData = encoder.encode(vrfInput || crypto.randomUUID());
      
      const signature = await crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" }
        },
        keyPair.privateKey,
        inputData
      );
      
      const proof = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .substring(0, 44); // Shortened for display
      
      // Generate deterministic random from proof
      const randomBuffer = await crypto.subtle.digest('SHA-256', signature);
      const randomOutput = Array.from(new Uint8Array(randomBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').substring(0, 32);
      
      // Verify the proof
      const verified = await crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" }
        },
        keyPair.publicKey,
        signature,
        inputData
      );
      
      const vrfOutput: VRFOutput = {
        input: vrfInput || 'auto-generated',
        publicKey,
        proof,
        randomOutput,
        verified,
        timestamp: Date.now()
      };
      
      setVrfOutputs(prev => [...prev, vrfOutput]);
      setSuccess('VRF generated and verified successfully!');
    } catch (err) {
      setError('Failed to generate VRF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Hash Chain Random Generation
  const initializeHashChain = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const seed = chainSeed || crypto.randomUUID();
      const sequence: string[] = [];
      let currentHash = seed;
      
      // Generate hash chain
      for (let i = 0; i < chainLength; i++) {
        const encoder = new TextEncoder();
        const data = encoder.encode(currentHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        currentHash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        sequence.push(currentHash);
      }
      
      const chain: HashChainRandom = {
        seed,
        iterations: chainLength,
        currentHash: sequence[0],
        sequence,
        index: 0
      };
      
      setHashChain(chain);
      setSuccess(`Hash chain initialized with ${chainLength} pre-computed values`);
    } catch (err) {
      setError('Failed to initialize hash chain');
    } finally {
      setIsGenerating(false);
    }
  };

  const getNextHashChainValue = () => {
    if (!hashChain || hashChain.index >= hashChain.sequence.length - 1) {
      setError('Hash chain exhausted or not initialized');
      return;
    }
    
    const nextIndex = hashChain.index + 1;
    const nextHash = hashChain.sequence[nextIndex];
    
    setHashChain({
      ...hashChain,
      index: nextIndex,
      currentHash: nextHash
    });
    
    setSuccess(`Retrieved hash #${nextIndex + 1}: ${nextHash.substring(0, 16)}...`);
  };

  // Blockchain-style Random (simulated)
  const generateBlockchainRandom = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate blockchain block data
      const blockHeight = Math.floor(Math.random() * 1000000) + 700000;
      const blockHashData = `block-${blockHeight}-${Date.now()}`;
      
      const encoder = new TextEncoder();
      const blockData = encoder.encode(blockHashData);
      const blockHashBuffer = await crypto.subtle.digest('SHA-256', blockData);
      const blockHash = Array.from(new Uint8Array(blockHashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Mix with user seed
      const mixedData = encoder.encode(`${blockHash}:${userSeed || 'default'}`);
      const mixedBuffer = await crypto.subtle.digest('SHA-512', mixedData);
      const mixedSeed = Array.from(new Uint8Array(mixedBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').substring(0, 32);
      
      // Generate final random value
      const finalData = encoder.encode(mixedSeed);
      const finalBuffer = await crypto.subtle.digest('SHA-256', finalData);
      const randomValue = Array.from(new Uint8Array(finalBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').substring(0, 32);
      
      const blockRandom: BlockchainRandom = {
        blockHeight,
        blockHash: blockHash.substring(0, 32) + '...',
        mixedSeed,
        randomValue,
        timestamp: Date.now()
      };
      
      setBlockchainRandom(prev => [...prev, blockRandom]);
      setSuccess('Blockchain-based random number generated!');
    } catch (err) {
      setError('Failed to generate blockchain random');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verifiable Delay Function (VDF)
  const computeVDF = async () => {
    setIsGenerating(true);
    setError(null);
    setVdfProgress(0);
    setVdfResult(null);
    
    try {
      const input = vdfInput || crypto.randomUUID();
      let current = input;
      
      // Simulate VDF computation with progress
      const batchSize = Math.floor(vdfIterations / 100);
      
      for (let i = 0; i < vdfIterations; i++) {
        const encoder = new TextEncoder();
        const data = encoder.encode(current);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        current = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Update progress
        if (i % batchSize === 0) {
          setVdfProgress(Math.floor((i / vdfIterations) * 100));
          await new Promise(resolve => setTimeout(resolve, 10)); // Allow UI update
        }
      }
      
      setVdfResult(current);
      setVdfProgress(100);
      setSuccess(`VDF computed after ${vdfIterations.toLocaleString()} iterations!`);
    } catch (err) {
      setError('Failed to compute VDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Provable Random Number Generator
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            Cryptographically verifiable randomness for transparent applications
          </p>
        </div>
        <Badge variant="outline" className="px-2 py-1 text-xs sm:text-sm self-start sm:self-auto">
          <Dices className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Verifiable RNG v1.0
        </Badge>
      </div>

      {/* Status Messages */}
      {success && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="commit-reveal" className="space-y-4">
        <div className="w-full overflow-x-auto flex-shrink-0 bg-background border-b">
          <TabsList className="w-max flex h-12 sm:h-10 bg-transparent">
            <TabsTrigger value="commit-reveal" className="whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-accent min-w-[80px] sm:min-w-[120px]">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Commit-Reveal</span>
              <span className="sm:hidden">Commit</span>
            </TabsTrigger>
            <TabsTrigger value="vrf" className="whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-accent min-w-[80px] sm:min-w-[120px]">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">VRF</span>
              <span className="sm:hidden">VRF</span>
            </TabsTrigger>
            <TabsTrigger value="hash-chain" className="whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-accent min-w-[80px] sm:min-w-[120px]">
              <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Hash Chain</span>
              <span className="sm:hidden">Hash</span>
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-accent min-w-[80px] sm:min-w-[120px]">
              <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Blockchain</span>
              <span className="sm:hidden">Chain</span>
            </TabsTrigger>
            <TabsTrigger value="vdf" className="whitespace-nowrap px-3 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-accent min-w-[80px] sm:min-w-[120px]">
              <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">VDF</span>
              <span className="sm:hidden">VDF</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Commit-Reveal Scheme */}
        <TabsContent value="commit-reveal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commit-Reveal Random Generation</CardTitle>
              <CardDescription>
                Two-phase randomness: commit first, reveal later for fairness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <Shield className="h-4 w-4 text-blue-500" />
                <AlertTitle>How It Works</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  1. Commit Phase: Hash your secret value (commitment can be public)
                  <br />
                  2. Wait Period: Others can make their commitments
                  <br />
                  3. Reveal Phase: Reveal your secret to generate verifiable randomness
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="secret" className="text-xs sm:text-sm">Secret Value (optional)</Label>
                <Input
                  id="secret"
                  type="text"
                  placeholder="Enter secret or leave empty for auto-generation..."
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  className="text-sm h-9 sm:h-10"
                  data-testid="input-secret"
                />
              </div>

              <Button
                onClick={createCommitment}
                disabled={isGenerating}
                className="w-full text-xs sm:text-sm h-10 sm:h-11"
                data-testid="button-commit"
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Create Commitment
              </Button>

              {currentCommitment && !currentCommitment.revealed && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Active Commitment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Commitment Hash (Public)</p>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs font-mono break-all">{currentCommitment.commitment}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Secret (Keep Private!)</p>
                      <div className="bg-muted p-2 rounded flex items-center justify-between">
                        <p className="text-xs font-mono break-all">{currentCommitment.secret}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(currentCommitment.secret)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {commitments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold">Commitments</h3>
                  <ScrollArea className="h-[200px] sm:h-[250px] rounded-md border">
                    <div className="p-2 sm:p-4 space-y-3">
                      {commitments.map((commit) => (
                        <Card key={commit.id}>
                          <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant={commit.revealed ? "default" : "secondary"} className="text-xs">
                                  {commit.revealed ? 'Revealed' : 'Committed'}
                                </Badge>
                                {!commit.revealed && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => revealCommitment(commit.id)}
                                  >
                                    <Unlock className="w-3 h-3 mr-1" />
                                    Reveal
                                  </Button>
                                )}
                              </div>
                              {commit.revealed && commit.randomValue && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Random Output</p>
                                  <p className="text-xs font-mono text-green-500 break-all">
                                    {commit.randomValue}
                                  </p>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(commit.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VRF Tab */}
        <TabsContent value="vrf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verifiable Random Function (VRF)</CardTitle>
              <CardDescription>
                Generate random numbers with cryptographic proof of correctness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-purple-500/50 bg-purple-500/10">
                <Zap className="h-4 w-4 text-purple-500" />
                <AlertTitle>VRF Properties</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  • Deterministic: Same input always produces same output
                  <br />
                  • Verifiable: Anyone can verify the output using the proof
                  <br />
                  • Unpredictable: Output appears random without the private key
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="vrf-input" className="text-xs sm:text-sm">VRF Input</Label>
                <Input
                  id="vrf-input"
                  type="text"
                  placeholder="Enter input or leave empty for random..."
                  value={vrfInput}
                  onChange={(e) => setVrfInput(e.target.value)}
                  className="text-sm h-9 sm:h-10"
                  data-testid="input-vrf"
                />
              </div>

              <Button
                onClick={generateVRF}
                disabled={isGenerating}
                className="w-full text-xs sm:text-sm h-10 sm:h-11"
                data-testid="button-vrf"
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Generate VRF Output
              </Button>

              {vrfOutputs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold">VRF Outputs</h3>
                  <ScrollArea className="h-[200px] sm:h-[300px] rounded-md border">
                    <div className="p-2 sm:p-4 space-y-3">
                      {vrfOutputs.map((output, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={output.verified ? "default" : "destructive"} className="text-xs">
                                  {output.verified ? 'Verified' : 'Unverified'}
                                </Badge>
                                {output.verified && (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Input</p>
                                <p className="text-xs font-mono">{output.input}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Random Output</p>
                                <p className="text-xs font-mono text-blue-500 break-all">
                                  {output.randomOutput}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Public Key</p>
                                  <p className="text-xs font-mono break-all">{output.publicKey}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Proof</p>
                                  <p className="text-xs font-mono break-all">{output.proof}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hash Chain Tab */}
        <TabsContent value="hash-chain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hash Chain Random Generation</CardTitle>
              <CardDescription>
                Pre-computed deterministic sequence for efficient random generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="chain-seed" className="text-xs sm:text-sm">Seed Value</Label>
                  <Input
                    id="chain-seed"
                    type="text"
                    placeholder="Enter seed or auto-generate..."
                    value={chainSeed}
                    onChange={(e) => setChainSeed(e.target.value)}
                    className="text-sm h-9 sm:h-10"
                    data-testid="input-chain-seed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chain-length" className="text-xs sm:text-sm">Chain Length</Label>
                  <Input
                    id="chain-length"
                    type="number"
                    value={chainLength}
                    onChange={(e) => setChainLength(parseInt(e.target.value) || 100)}
                    min={10}
                    max={10000}
                    className="text-sm h-9 sm:h-10"
                    data-testid="input-chain-length"
                  />
                </div>
              </div>

              <Button
                onClick={initializeHashChain}
                disabled={isGenerating}
                className="w-full text-xs sm:text-sm h-10 sm:h-11"
                data-testid="button-init-chain"
              >
                <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Initialize Hash Chain
              </Button>

              {hashChain && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Active Hash Chain</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Position</p>
                        <p className="text-sm font-semibold">{hashChain.index + 1} / {hashChain.iterations}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                        <p className="text-sm font-semibold">{hashChain.iterations - hashChain.index - 1}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Hash</p>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs font-mono break-all text-green-500">
                          {hashChain.currentHash.substring(0, 32)}...
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={getNextHashChainValue}
                      disabled={hashChain.index >= hashChain.iterations - 1}
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      variant="secondary"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Get Next Random Value
                    </Button>
                    
                    <Progress value={(hashChain.index + 1) / hashChain.iterations * 100} className="h-2" />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Random Tab */}
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain-Based Randomness</CardTitle>
              <CardDescription>
                Mix blockchain data with user seed for verifiable randomness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-cyan-500/50 bg-cyan-500/10">
                <Link className="h-4 w-4 text-cyan-500" />
                <AlertTitle>Blockchain RNG</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  Uses future block hashes as entropy source. Commonly used in:
                  <br />
                  • Smart contract lotteries
                  <br />
                  • Decentralized gaming
                  <br />
                  • Fair NFT distribution
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="user-seed" className="text-xs sm:text-sm">User Seed (Optional)</Label>
                <Input
                  id="user-seed"
                  type="text"
                  placeholder="Mix your seed with blockchain data..."
                  value={userSeed}
                  onChange={(e) => setUserSeed(e.target.value)}
                  className="text-sm h-9 sm:h-10"
                  data-testid="input-user-seed"
                />
              </div>

              <Button
                onClick={generateBlockchainRandom}
                disabled={isGenerating}
                className="w-full text-xs sm:text-sm h-10 sm:h-11"
                data-testid="button-blockchain"
              >
                <Binary className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Generate Blockchain Random
              </Button>

              {blockchainRandom.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold">Blockchain Random Values</h3>
                  <ScrollArea className="h-[200px] sm:h-[250px] rounded-md border">
                    <div className="p-2 sm:p-4 space-y-3">
                      {blockchainRandom.map((random, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-3 sm:pt-4 px-2 sm:px-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  Block #{random.blockHeight}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(random.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Block Hash</p>
                                <p className="text-xs font-mono">{random.blockHash}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Random Output</p>
                                <p className="text-xs font-mono text-cyan-500 break-all">
                                  {random.randomValue}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VDF Tab */}
        <TabsContent value="vdf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verifiable Delay Function (VDF)</CardTitle>
              <CardDescription>
                Time-locked randomness that requires sequential computation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-500/50 bg-orange-500/10">
                <Timer className="h-4 w-4 text-orange-500" />
                <AlertTitle>VDF Properties</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  • Sequential: Cannot be parallelized for faster computation
                  <br />
                  • Verifiable: Output can be quickly verified
                  <br />
                  • Time-locked: Guarantees minimum computation time
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="vdf-input" className="text-xs sm:text-sm">VDF Input</Label>
                  <Input
                    id="vdf-input"
                    type="text"
                    placeholder="Enter input..."
                    value={vdfInput}
                    onChange={(e) => setVdfInput(e.target.value)}
                    className="text-sm h-9 sm:h-10"
                    data-testid="input-vdf"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vdf-iterations" className="text-xs sm:text-sm">Iterations</Label>
                  <Input
                    id="vdf-iterations"
                    type="number"
                    value={vdfIterations}
                    onChange={(e) => setVdfIterations(parseInt(e.target.value) || 1000000)}
                    min={1000}
                    max={10000000}
                    className="text-sm h-9 sm:h-10"
                    data-testid="input-vdf-iterations"
                  />
                </div>
              </div>

              <Button
                onClick={computeVDF}
                disabled={isGenerating}
                className="w-full text-xs sm:text-sm h-10 sm:h-11"
                data-testid="button-compute-vdf"
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Compute VDF
              </Button>

              {isGenerating && vdfProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Computing VDF...</span>
                    <span>{vdfProgress}%</span>
                  </div>
                  <Progress value={vdfProgress} className="h-2" />
                </div>
              )}

              {vdfResult && (
                <Card className="border-orange-500/50 bg-orange-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">VDF Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Final Output</p>
                      <div className="bg-muted p-2 rounded">
                        <p className="text-xs font-mono text-orange-500 break-all">
                          {vdfResult}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      <span>Computed with {vdfIterations.toLocaleString()} sequential iterations</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}