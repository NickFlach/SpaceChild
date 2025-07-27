// Test script for new AI providers
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testAIProviders() {
  console.log('Testing AI Providers...\n');
  
  // Test SpaceAgent
  console.log('1. Testing SpaceAgent:');
  try {
    const spaceAgentResponse = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Explain how you use metacognitive learning to improve responses",
      provider: "spaceagent",
      projectId: 1
    }, {
      headers: {
        'Cookie': 'YOUR_SESSION_COOKIE_HERE' // Replace with actual session cookie
      }
    });
    
    console.log('SpaceAgent Response:', spaceAgentResponse.data.response.substring(0, 200) + '...');
    console.log('Tokens Used:', spaceAgentResponse.data.tokensUsed);
    console.log('Cost:', spaceAgentResponse.data.cost);
  } catch (error) {
    console.error('SpaceAgent Error:', error.response?.data || error.message);
  }
  
  console.log('\n2. Testing MindSphere:');
  try {
    const mindSphereResponse = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Analyze the architecture of a React application from multiple perspectives",
      provider: "mindsphere",
      projectId: 1
    }, {
      headers: {
        'Cookie': 'YOUR_SESSION_COOKIE_HERE' // Replace with actual session cookie
      }
    });
    
    console.log('MindSphere Response:', mindSphereResponse.data.response.substring(0, 200) + '...');
    console.log('Tokens Used:', mindSphereResponse.data.tokensUsed);
    console.log('Cost:', mindSphereResponse.data.cost);
  } catch (error) {
    console.error('MindSphere Error:', error.response?.data || error.message);
  }
  
  console.log('\n3. Testing Anthropic (baseline):');
  try {
    const anthropicResponse = await axios.post(`${API_URL}/api/ai/chat`, {
      message: "Write a simple React component",
      provider: "anthropic",
      projectId: 1
    }, {
      headers: {
        'Cookie': 'YOUR_SESSION_COOKIE_HERE' // Replace with actual session cookie
      }
    });
    
    console.log('Anthropic Response:', anthropicResponse.data.response.substring(0, 200) + '...');
    console.log('Tokens Used:', anthropicResponse.data.tokensUsed);
    console.log('Cost:', anthropicResponse.data.cost);
  } catch (error) {
    console.error('Anthropic Error:', error.response?.data || error.message);
  }
}

// Instructions:
console.log('To test the AI providers:');
console.log('1. Make sure the server is running (npm run dev)');
console.log('2. Log into the application in your browser');
console.log('3. Open browser DevTools and copy your session cookie');
console.log('4. Replace YOUR_SESSION_COOKIE_HERE with your actual cookie');
console.log('5. Run: node test_ai_providers.js\n');

// Uncomment to run tests
// testAIProviders();