/**
 * Debug script to check what origin your frontend is sending
 * Run this in the browser console to see the actual origin value
 */

// Check what origin is being sent
console.log('📍 Current Origin:', window.location.origin);
console.log('📍 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000');

// Test fetch to see the actual error
async function testCORS() {
  try {
    console.log('🔍 Testing CORS with credentials...');
    const response = await fetch(
      (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/session',
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:');
    for (let [key, value] of response.headers) {
      console.log(`  ${key}: ${value}`);
    }
    
    const data = await response.json();
    console.log('Response Body:', data);
    
    if (data.code === 'INVALID_ORIGIN') {
      console.error('❌ Better-auth rejected your origin!');
      console.log('Your origin:', window.location.origin);
      console.log('You need to add this to backend trustedOrigins');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run it
testCORS();
