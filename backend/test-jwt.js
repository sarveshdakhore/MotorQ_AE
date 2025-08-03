const jwt = require('jsonwebtoken');

// Test JWT configuration
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '15m';

console.log('=== JWT Security Issues Test ===\n');

// 1. Test normal JWT generation
const payload = {
  userId: 'test-user-123',
  email: 'test@example.com'
};

const validToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
console.log('1. Valid JWT Token:', validToken);

// 2. Test JWT verification
try {
  const decoded = jwt.verify(validToken, JWT_SECRET);
  console.log('2. Decoded valid token:', decoded);
} catch (error) {
  console.log('2. Error verifying valid token:', error.message);
}

// 3. Test expired JWT (create with very short expiry)
const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1ms' });
console.log('\n3. Creating expired token...');

// Wait a bit and then test
setTimeout(() => {
  try {
    const decoded = jwt.verify(expiredToken, JWT_SECRET);
    console.log('3. ❌ ERROR: Expired token was accepted:', decoded);
  } catch (error) {
    console.log('3. ✅ CORRECT: Expired token rejected:', error.message);
  }

  // 4. Test tampered JWT
  console.log('\n4. Testing tampered JWT...');
  const tamperedToken = validToken.slice(0, -5) + 'XXXXX'; // Change last 5 characters
  console.log('4. Tampered token:', tamperedToken);

  try {
    const decoded = jwt.verify(tamperedToken, JWT_SECRET);
    console.log('4. ❌ ERROR: Tampered token was accepted:', decoded);
  } catch (error) {
    console.log('4. ✅ CORRECT: Tampered token rejected:', error.message);
  }

  // 5. Test with wrong secret
  console.log('\n5. Testing with wrong secret...');
  try {
    const decoded = jwt.verify(validToken, 'wrong-secret');
    console.log('5. ❌ ERROR: Token verified with wrong secret:', decoded);
  } catch (error) {
    console.log('5. ✅ CORRECT: Token rejected with wrong secret:', error.message);
  }

  // 6. Test the current AuthService behavior simulation
  console.log('\n6. Testing AuthService verifyToken method simulation...');
  
  function simulateAuthServiceVerifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error('Error verifying token:', error.message);
      return null;
    }
  }

  console.log('6a. Valid token result:', simulateAuthServiceVerifyToken(validToken) ? 'ACCEPTED' : 'REJECTED');
  console.log('6b. Tampered token result:', simulateAuthServiceVerifyToken(tamperedToken) ? 'ACCEPTED' : 'REJECTED');
  console.log('6c. Expired token result:', simulateAuthServiceVerifyToken(expiredToken) ? 'ACCEPTED' : 'REJECTED');

}, 10);
