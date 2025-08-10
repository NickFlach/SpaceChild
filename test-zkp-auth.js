// Test ZKP Authentication Flow
import * as srpClient from 'secure-remote-password/client.js';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/zkp';

async function testRegistrationAndLogin() {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'TestPassword123!'
  };

  console.log('Testing ZKP Authentication Flow...');
  console.log('-----------------------------------');
  
  // Step 1: Register user
  console.log('1. Registering user...');
  const salt = srpClient.generateSalt();
  const privateKey = srpClient.derivePrivateKey(salt, testUser.username, testUser.password);
  const verifier = srpClient.deriveVerifier(privateKey);

  const registerResponse = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUser.email,
      username: testUser.username,
      salt: salt,
      verifier: verifier
    })
  });

  const registerData = await registerResponse.json();
  if (!registerResponse.ok) {
    console.error('Registration failed:', registerData);
    return;
  }
  console.log('✓ Registration successful:', registerData);

  // Step 2: Test login
  console.log('\n2. Testing login...');
  
  // Generate client ephemeral
  const clientEphemeral = srpClient.generateEphemeral();
  
  // Start authentication
  const startResponse = await fetch(`${API_URL}/auth/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: testUser.username,
      clientEphemeralPublic: clientEphemeral.public
    })
  });

  const startData = await startResponse.json();
  if (!startResponse.ok) {
    console.error('Start auth failed:', startData);
    return;
  }
  console.log('✓ Auth started, got server ephemeral and salt');

  // Step 3: Complete authentication
  console.log('\n3. Completing authentication...');
  
  // Derive session using server's salt
  const loginPrivateKey = srpClient.derivePrivateKey(startData.salt, testUser.username, testUser.password);
  const clientSession = srpClient.deriveSession(
    clientEphemeral.secret,
    startData.serverEphemeralPublic,
    startData.salt,
    testUser.username,
    loginPrivateKey
  );

  const completeResponse = await fetch(`${API_URL}/auth/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: startData.sessionId,
      clientEphemeralPublic: clientEphemeral.public,
      clientProof: clientSession.proof
    })
  });

  const completeData = await completeResponse.json();
  if (!completeResponse.ok) {
    console.error('Complete auth failed:', completeData);
    return;
  }

  console.log('✓ Authentication successful!');
  console.log('✓ Received JWT token:', completeData.token.substring(0, 20) + '...');
  console.log('✓ User:', completeData.user);
  
  console.log('\n✅ All tests passed! ZKP authentication is working correctly.');
}

testRegistrationAndLogin().catch(console.error);