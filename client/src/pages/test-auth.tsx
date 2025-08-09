import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/Auth/LoginModal';
import { Shield, User, Key, LogOut, CheckCircle, XCircle } from 'lucide-react';

export default function TestAuth() {
  const { user, isAuthenticated, logout, setAuthToken } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string, success: boolean) => {
    setTestResults(prev => [...prev, `${success ? '✅' : '❌'} ${message}`]);
  };

  const testProtectedRoute = async () => {
    try {
      const token = localStorage.getItem('zkp_token');
      const response = await fetch('/api/projects', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        addTestResult('Protected route accessible with token', true);
      } else {
        addTestResult(`Protected route returned ${response.status}`, false);
      }
    } catch (error) {
      addTestResult('Failed to test protected route', false);
    }
  };

  const testAuthStatus = () => {
    addTestResult(`Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`, isAuthenticated);
    addTestResult(`User object: ${user ? 'Loaded' : 'Not loaded'}`, !!user);
    addTestResult(`Token in localStorage: ${localStorage.getItem('zkp_token') ? 'Present' : 'Missing'}`, !!localStorage.getItem('zkp_token'));
  };

  const clearTests = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-cyan-500/30 bg-black/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              ZKP Authentication Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Current Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-gray-400">
                    Authentication: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                      {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </span>
                  </span>
                </div>
                {user && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400">
                      User: {user.username || user.email || user.id}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400">
                    Token: {localStorage.getItem('zkp_token') ? 'Present' : 'Not Present'}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Actions */}
            <div className="flex flex-wrap gap-2">
              {!isAuthenticated ? (
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                  data-testid="button-show-login"
                >
                  Test Login
                </Button>
              ) : (
                <Button
                  onClick={() => logout()}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Test Logout
                </Button>
              )}
              
              <Button
                onClick={testAuthStatus}
                variant="outline"
                className="border-cyan-500/30 hover:bg-cyan-500/10"
                data-testid="button-test-status"
              >
                Check Auth Status
              </Button>
              
              <Button
                onClick={testProtectedRoute}
                variant="outline"
                className="border-purple-500/30 hover:bg-purple-500/10"
                data-testid="button-test-route"
              >
                Test Protected Route
              </Button>
              
              <Button
                onClick={clearTests}
                variant="ghost"
                className="hover:bg-gray-800"
                data-testid="button-clear-tests"
              >
                Clear Results
              </Button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Test Results</h3>
                <div className="space-y-1 font-mono text-sm">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-gray-400" data-testid={`test-result-${index}`}>
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <LoginModal 
              onSuccess={(user) => {
                setAuthToken(localStorage.getItem('zkp_token') || '');
                setShowLogin(false);
                addTestResult('Login successful', true);
              }}
              onClose={() => setShowLogin(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}