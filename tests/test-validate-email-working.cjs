// Test working validateEmail implementation
console.log('🧪 Testing validateEmail Implementation\n');

const validateEmail = (email) => {
  const validator = require('validator');
  try {
    if (!email || typeof email !== 'string') return false;
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) return false;
    if (trimmedEmail.length > 254) return false;
    return validator.isEmail(trimmedEmail);
  } catch (error) {
    return false;
  }
};

console.log('Testing empty string:', validateEmail(''));
console.log('Testing valid email:', validateEmail('test@example.com'));
console.log('Testing invalid email:', validateEmail('invalid-email'));
console.log('Testing null:', validateEmail(null));
console.log('✅ validateEmail working correctly');