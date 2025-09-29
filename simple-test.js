import fetch from 'node-fetch';

async function testBasicAPI() {
  console.log('🧪 Testing basic API connectivity...');
  
  try {
    const response = await fetch('http://localhost:5000/api/consciousness/unified/monitor?userId=test-user');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is working!');
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API error:', errorText);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testBasicAPI();
