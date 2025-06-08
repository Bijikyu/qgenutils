
const { formatDateTime, formatDuration, calculateContentLength, ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts, getRequiredHeader, sendJsonResponse, requireFields, checkPassportAuth, hasGithubStrategy, buildCleanHeaders, renderView, registerViewRoute } = require('./index.js');

console.log('Testing npm module functions:\n');

// Test formatDateTime function
console.log('DateTime formatting function:');
const now = new Date().toISOString();
console.log('Current time formatted:', formatDateTime(now));
console.log('Invalid date:', formatDateTime(''));

// Test formatDuration function
console.log('\nDuration formatting function:');
const startTime = new Date(Date.now() - 3661000).toISOString(); // 1 hour, 1 minute, 1 second ago
console.log('Duration from start to now:', formatDuration(startTime));
const endTime = new Date().toISOString();
console.log('Duration between two times:', formatDuration(startTime, endTime));
console.log('Empty start date:', formatDuration(''));

// Test calculateContentLength function
console.log('\nContent length calculation function:');
console.log('String body:', calculateContentLength('Hello World'));
console.log('Object body:', calculateContentLength({ name: 'John', age: 30 }));
console.log('Empty string:', calculateContentLength(''));
console.log('Empty object:', calculateContentLength({}));
console.log('Null body:', calculateContentLength(null));

// Test error handling
console.log('\nTesting error handling:');
try {
  calculateContentLength(undefined);
} catch (error) {
  console.log('Caught expected error for undefined body');
}

// Test URL utility functions
console.log('\nURL utility functions:');
console.log('Ensure protocol - no protocol:', ensureProtocol('example.com'));
console.log('Ensure protocol - with https:', ensureProtocol('https://example.com'));
console.log('Ensure protocol - invalid input:', ensureProtocol(''));

console.log('\nNormalize URL origin:', normalizeUrlOrigin('HTTPS://Example.Com/path'));
console.log('Strip protocol:', stripProtocol('https://example.com/'));
console.log('Parse URL parts:', parseUrlParts('example.com/api/users?id=123'));

// Test HTTP utility functions
console.log('\nHTTP utility functions:');
// Mock request and response objects for testing
const mockReq = {
  headers: {
    'authorization': 'Bearer token123',
    'content-type': 'application/json'
  }
};

const mockRes = {
  status: function(code) {
    console.log(`Response status set to: ${code}`);
    return this;
  },
  json: function(data) {
    console.log(`Response JSON:`, data);
    return this;
  }
};

console.log('Get required header (exists):', getRequiredHeader(mockReq, mockRes, 'authorization', 401, 'Missing authorization'));
console.log('Get required header (missing):', getRequiredHeader(mockReq, mockRes, 'x-api-key', 401, 'Missing API key'));

// Test requireFields function
console.log('\nField validation function:');
const validObj = { name: 'John', email: 'john@example.com', age: 30 };
const invalidObj = { name: 'Jane', age: '' }; // missing email, falsy age

console.log('Valid object:', requireFields(mockRes, validObj, ['name', 'email', 'age']));
console.log('Invalid object:', requireFields(mockRes, invalidObj, ['name', 'email', 'age']));

// Test checkPassportAuth function
console.log('\nPassport authentication checker:');
const mockAuthenticatedReq = {
  user: { username: 'john_doe' },
  isAuthenticated: () => true
};
const mockUnauthenticatedReq = {
  isAuthenticated: () => false
};
const mockGuestReq = {};

console.log('Authenticated user:', checkPassportAuth(mockAuthenticatedReq));
console.log('Unauthenticated user:', checkPassportAuth(mockUnauthenticatedReq));
console.log('Guest user (no passport):', checkPassportAuth(mockGuestReq));

// Test hasGithubStrategy function
console.log('\nGitHub strategy checker:');
// Mock passport object for testing
global.passport = {
  _strategies: {
    github: { name: 'github' }
  }
};
console.log('With GitHub strategy configured:', hasGithubStrategy());

// Test without GitHub strategy
global.passport = { _strategies: {} };
console.log('Without GitHub strategy:', hasGithubStrategy());

// Test with no passport object
delete global.passport;
console.log('With no passport object:', hasGithubStrategy());

// Test buildCleanHeaders function
console.log('\nHeader cleaning function:');
const testHeaders = {
  'host': 'example.com',
  'x-target-url': 'https://api.example.com',
  'authorization': 'Bearer token123',
  'content-type': 'application/json',
  'content-length': '50',
  'cf-ray': '12345',
  'user-agent': 'MyApp/1.0'
};

console.log('Clean headers for GET:', buildCleanHeaders(testHeaders, 'GET', null));
console.log('Clean headers for POST with body:', buildCleanHeaders(testHeaders, 'POST', { name: 'test' }));
console.log('Clean headers for POST without body:', buildCleanHeaders(testHeaders, 'POST', null));

// Test renderView function
console.log('\nTemplate rendering function:');
const mockResForRender = {
  render: function(viewName) {
    console.log(`Successfully rendered template: ${viewName}`);
  },
  status: function(code) {
    console.log(`Response status set to: ${code}`);
    return this;
  },
  send: function(html) {
    console.log(`Response HTML sent (truncated):`, html.substring(0, 100) + '...');
    return this;
  }
};

// Test successful rendering
renderView(mockResForRender, 'dashboard', 'Dashboard Error');

// Test error handling with mock that throws
const mockResWithError = {
  render: function(viewName) {
    throw new Error('Template not found');
  },
  status: function(code) {
    console.log(`Error response status set to: ${code}`);
    return this;
  },
  send: function(html) {
    console.log(`Error page sent (truncated):`, html.substring(0, 100) + '...');
    return this;
  }
};

renderView(mockResWithError, 'nonexistent', 'Template Error');

// Test registerViewRoute function
console.log('\nRoute registration function:');
// Mock app object for testing
global.app = {
  get: function(path, handler) {
    console.log(`Route registered: GET ${path}`);
    // Test the handler
    handler(mockReq, mockResForRender);
  }
};

registerViewRoute('/dashboard', 'dashboard', 'Dashboard Error');

console.log('\nAll tests completed!');
