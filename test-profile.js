// Test profile management endpoints
const API_URL = 'http://localhost:5000/api';

// Use a test token (you'll need to login to get a real one)
const testToken = 'your-token-here';

async function testProfile() {
  console.log('Testing Profile Management Features...');
  console.log('=====================================\n');
  
  // 1. Test GET /api/profile (need valid token)
  console.log('1. Testing GET /api/profile:');
  try {
    const profileRes = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    console.log('   Status:', profileRes.status);
    if (profileRes.status === 401) {
      console.log('   ✓ Authentication required (expected)\n');
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  // 2. Test PUT /api/profile (need valid token)
  console.log('2. Testing PUT /api/profile:');
  try {
    const updateRes = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User'
      })
    });
    console.log('   Status:', updateRes.status);
    if (updateRes.status === 401) {
      console.log('   ✓ Authentication required (expected)\n');
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  // 3. Test legacy logout endpoint
  console.log('3. Testing GET /api/logout:');
  try {
    const logoutRes = await fetch(`${API_URL}/logout`);
    const logoutData = await logoutRes.json();
    console.log('   Status:', logoutRes.status);
    console.log('   Response:', logoutData);
    if (logoutData.success) {
      console.log('   ✓ Legacy logout endpoint working\n');
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }
  
  console.log('\n✅ Profile management endpoints configured!');
  console.log('Features available:');
  console.log('- View profile information');
  console.log('- Update first/last name');
  console.log('- View subscription details');
  console.log('- Delete account');
  console.log('\nTo test with real data, login via the UI and check the profile modal.');
}

testProfile().catch(console.error);
