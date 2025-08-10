import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Sparkle, Shield, Rocket, Check, Star, Zap, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface LoginModalProps {
  onSuccess?: (user: any) => void;
  onClose?: () => void;
}

import * as srpClient from 'secure-remote-password/client';

export default function LoginModal({ onSuccess, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('explorer');
  const [signupStep, setSignupStep] = useState(1); // 1: credentials, 2: plan selection

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Generate client ephemeral
      const clientEphemeral = srpClient.generateEphemeral();

      // Step 2: Start authentication
      const startResponse = await fetch('/api/zkp/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          clientEphemeralPublic: clientEphemeral.public
        })
      });

      if (!startResponse.ok) {
        const error = await startResponse.json();
        throw new Error(error.message || 'Authentication failed');
      }

      const startData = await startResponse.json();

      // Step 3: Derive session and complete authentication using server's salt
      const privateKey = srpClient.derivePrivateKey(startData.salt, loginUsername, loginPassword);
      const clientSession = srpClient.deriveSession(
        clientEphemeral.secret,
        startData.serverEphemeralPublic,
        startData.salt,
        loginUsername,
        privateKey
      );

      const completeResponse = await fetch('/api/zkp/auth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: startData.sessionId,
          clientEphemeralPublic: clientEphemeral.public,
          clientProof: clientSession.proof
        })
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.message || 'Authentication failed');
      }

      const completeData = await completeResponse.json();

      // Store token in localStorage
      localStorage.setItem('zkp_token', completeData.token);
      localStorage.setItem('zkp_user', JSON.stringify(completeData.user));

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${completeData.user.username}`,
      });

      if (onSuccess) {
        onSuccess(completeData.user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Move to plan selection step
    setSignupStep(2);
  };

  const handleSignupComplete = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Generate salt and verifier on client side for true ZKP
      const salt = srpClient.generateSalt();
      const privateKey = srpClient.derivePrivateKey(salt, signupUsername, signupPassword);
      const verifier = srpClient.deriveVerifier(privateKey);

      const response = await fetch('/api/zkp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          username: signupUsername,
          salt: salt,
          verifier: verifier,
          subscriptionTier: selectedPlan
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();

      toast({
        title: 'Welcome to Space Child!',
        description: `Account created with ${selectedPlan === 'explorer' ? 'Explorer' : selectedPlan === 'builder' ? 'Builder' : 'Architect'} plan. You can now log in.`,
      });

      // Switch to login tab
      setLoginUsername(signupUsername);
      setLoginPassword('');
      setSignupEmail('');
      setSignupUsername('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSelectedPlan('explorer');
      setSignupStep(1);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-cyan-500/20 shadow-2xl bg-black/80 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            <Sparkle className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Space Child Authentication
          </CardTitle>
          <CardDescription className="text-gray-400">
            Secure Zero-Knowledge Proof Authentication
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-cyan-500/20">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-cyan-500/20">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-gray-300">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    data-testid="input-login-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    data-testid="input-login-password"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                  data-testid="button-login-submit"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Launch Session
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signupStep === 1 ? (
                <form onSubmit={handleSignupStep1} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                      data-testid="input-signup-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-gray-300">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      disabled={isLoading}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                      data-testid="input-signup-username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      required
                      disabled={isLoading}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                      data-testid="input-signup-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-gray-300">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                      data-testid="input-signup-confirm-password"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                    data-testid="button-signup-next"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4" />
                      Next: Choose Your Plan
                    </span>
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Choose Your Plan</h3>
                    <p className="text-sm text-gray-400 mt-1">Start building with the plan that suits you best</p>
                  </div>

                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-3">
                    <div className="relative">
                      <RadioGroupItem value="explorer" id="plan-explorer" className="peer sr-only" />
                      <Label
                        htmlFor="plan-explorer"
                        className="flex flex-col gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-900/70 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-cyan-500/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-cyan-400" />
                            <span className="font-semibold text-white">Explorer</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">FREE</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          <div className="flex items-center gap-2 mt-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>100 monthly credits</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Basic AI providers</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Up to 3 projects</span>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="relative">
                      <RadioGroupItem value="builder" id="plan-builder" className="peer sr-only" />
                      <Label
                        htmlFor="plan-builder"
                        className="flex flex-col gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-900/70 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <span className="font-semibold text-white">Builder</span>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">$29/mo</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          <div className="flex items-center gap-2 mt-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>1,000 monthly credits</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>All AI providers</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Unlimited projects</span>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="relative">
                      <RadioGroupItem value="architect" id="plan-architect" className="peer sr-only" />
                      <Label
                        htmlFor="plan-architect"
                        className="flex flex-col gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-900/70 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-500/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-purple-400" />
                            <span className="font-semibold text-white">Architect</span>
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">$99/mo</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          <div className="flex items-center gap-2 mt-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>5,000 monthly credits</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Premium AI providers</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Team features</span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {error && (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSignupStep(1)}
                      disabled={isLoading}
                      className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSignupComplete}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                      data-testid="button-signup-complete"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Rocket className="w-4 h-4" />
                          Complete Registration
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            Protected by Zero-Knowledge Proof encryption
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}