
// Manual demonstration script showcasing how each exported utility can be used
// outside of the automated test suite. This file logs example outputs to the
// console for quick exploration when running `node test.js`.
const { formatDateTime, formatDuration, calculateContentLength, ensureProtocol, normalizeUrlOrigin, stripProtocol, parseUrlParts, getRequiredHeader, sendJsonResponse, requireFields, checkPassportAuth, hasGithubStrategy, buildCleanHeaders, renderView, registerViewRoute } = require('./index.js'); // imports utility functions for tests

console.log('Testing npm module functions:\n'); //(starting demo output)

// Demonstrate date/time utilities //(added group explanation)
// Test formatDateTime function
console.log('DateTime formatting function:'); // announces next test group
const now = new Date().toISOString(); // capture current time in ISO format
console.log('Current time formatted:', formatDateTime(now)); // show formatted time
console.log('Invalid date:', formatDateTime('')); // demonstrate failure case

// Test formatDuration function
console.log('\nDuration formatting function:'); // new section for durations
const startTime = new Date(Date.now() - 3661000).toISOString(); // 1 hour, 1 minute, 1 second ago
console.log('Duration from start to now:', formatDuration(startTime)); // difference from start
const endTime = new Date().toISOString(); // capture current time again
console.log('Duration between two times:', formatDuration(startTime, endTime)); // compare start and end
console.log('Empty start date:', formatDuration('')); // invalid start example

// Demonstrate content length calculation //(added group explanation)
// Test calculateContentLength function
console.log('\nContent length calculation function:'); // heading for size helper
console.log('String body:', calculateContentLength('Hello World')); // pass string body
console.log('Object body:', calculateContentLength({ name: 'John', age: 30 })); // pass JSON object
console.log('Empty string:', calculateContentLength('')); // check empty string
console.log('Empty object:', calculateContentLength({})); // check empty object
console.log('Null body:', calculateContentLength(null)); // handle null body

// Demonstrate error handling when a utility throws //(added group explanation)
// Test error handling
console.log('\nTesting error handling:'); // start try/catch demo
try { // attempt function that should throw
  calculateContentLength(undefined); // should throw for undefined body
} catch (error) { // handle thrown error
  console.log('Caught expected error for undefined body'); // confirm catch working
} // end try/catch demo

// Demonstrate URL utilities for normalizing and parsing addresses //(added group explanation)
// Test URL utility functions
console.log('\nURL utility functions:'); // heading for URL helper demo
console.log('Ensure protocol - no protocol:', ensureProtocol('example.com')); // prepend protocol
console.log('Ensure protocol - with https:', ensureProtocol('https://example.com')); // accept existing protocol
console.log('Ensure protocol - invalid input:', ensureProtocol('')); // empty input case

console.log('\nNormalize URL origin:', normalizeUrlOrigin('HTTPS://Example.Com/path')); // canonical host
console.log('Strip protocol:', stripProtocol('https://example.com/')); // remove scheme
console.log('Parse URL parts:', parseUrlParts('example.com/api/users?id=123')); // break into pieces

// Demonstrate HTTP utilities for header and response helpers //(added group explanation)
// Test HTTP utility functions
console.log('\nHTTP utility functions:'); // start HTTP helper demo
// Mock request and response objects for testing //(explain reason for mocks)
const mockReq = { //(simulates Express request with auth and JSON headers)
  headers: { // request headers
    'authorization': 'Bearer token123', // auth header for demo
    'content-type': 'application/json' // sent as JSON
  } // end headers
}; // end mockReq

const mockRes = { //(captures status and JSON output for tests)
  status: function(code) { // stub status setter
    console.log(`Response status set to: ${code}`); // mimic Express status
    return this; // enable chaining
  }, // end status
  json: function(data) { // stub json sender
    console.log(`Response JSON:`, data); // output payload
    return this; // enable chaining
  } // end json
}; // end mockRes

console.log('Get required header (exists):', getRequiredHeader(mockReq, mockRes, 'authorization', 401, 'Missing authorization')); // header present
console.log('Get required header (missing):', getRequiredHeader(mockReq, mockRes, 'x-api-key', 401, 'Missing API key')); // header missing

// Demonstrate validation helper for required fields //(added group explanation)
// Test requireFields function
console.log('\nField validation function:'); // start field validation demo
const validObj = { name: 'John', email: 'john@example.com', age: 30 }; // all fields set
const invalidObj = { name: 'Jane', age: '' }; // missing email, falsy age

console.log('Valid object:', requireFields(validObj, ['name', 'email', 'age'], mockRes)); // should return true
console.log('Invalid object:', requireFields(invalidObj, ['name', 'email', 'age'], mockRes)); // should send error

// Demonstrate Passport.js authentication checks //(added group explanation)
// Test checkPassportAuth function
console.log('\nPassport authentication checker:'); // show passport auth usage
const mockAuthenticatedReq = { //(represents a logged in user for passport)
  user: { username: 'john_doe' }, // user payload
  isAuthenticated: () => true // passport success flag
}; // end mockAuthenticatedReq
const mockUnauthenticatedReq = { //(represents an unauthenticated request)
  isAuthenticated: () => false // passport failure flag
}; // end mockUnauthenticatedReq
const mockGuestReq = {}; //(no passport data present)

console.log('Authenticated user:', checkPassportAuth(mockAuthenticatedReq)); // valid login
console.log('Unauthenticated user:', checkPassportAuth(mockUnauthenticatedReq)); // invalid login
console.log('Guest user (no passport):', checkPassportAuth(mockGuestReq)); // no session

// Demonstrate detection of GitHub OAuth strategy //(added group explanation)
// Test hasGithubStrategy function
console.log('\nGitHub strategy checker:'); // testing strategy detection
// Mock passport object for testing
global.passport = { //(mock passport with GitHub strategy)
  _strategies: { // strategy registry
    github: { name: 'github' } // defines GitHub OAuth strategy
  } // end strategies
}; // end mock passport
console.log('With GitHub strategy configured:', hasGithubStrategy()); // expected true

// Test without GitHub strategy
global.passport = { _strategies: {} }; //(mock passport with no strategies)
console.log('Without GitHub strategy:', hasGithubStrategy()); // expected false

// Test with no passport object
delete global.passport; //(remove passport to test absence)
console.log('With no passport object:', hasGithubStrategy()); // handles missing passport

// Demonstrate header cleaning for proxied requests //(added group explanation)
// Test buildCleanHeaders function
console.log('\nHeader cleaning function:'); // heading for header sanitizer
const testHeaders = { // sample incoming headers
  'host': 'example.com', // target host header
  'x-target-url': 'https://api.example.com', // upstream URL
  'authorization': 'Bearer token123', // bearer token header
  'content-type': 'application/json', // body content type
  'content-length': '50', // initial length header
  'cf-ray': '12345', // Cloudflare id header
  'user-agent': 'MyApp/1.0' // client agent string
}; // end testHeaders

console.log('Clean headers for GET:', buildCleanHeaders(testHeaders, 'GET', null)); // GET example
console.log('Clean headers for POST with body:', buildCleanHeaders(testHeaders, 'POST', { name: 'test' })); // POST with payload
console.log('Clean headers for POST without body:', buildCleanHeaders(testHeaders, 'POST', null)); // POST with no body

// Demonstrate template rendering with success and failure scenarios //(added group explanation)
// Test renderView function
console.log('\nTemplate rendering function:'); // start view rendering demo
const mockResForRender = { //(mock response used for successful render)
  render: function(viewName) { // mimic Express render
    console.log(`Successfully rendered template: ${viewName}`); // show template name
  }, // end render
  status: function(code) { // mimic Express status
    console.log(`Response status set to: ${code}`); // note status code
    return this; // enable chaining
  }, // end status
  send: function(html) { // mimic Express send
    console.log(`Response HTML sent (truncated):`, html.substring(0, 100) + '...'); // log partial HTML
    return this; // enable chaining
  } // end send
}; // end mockResForRender

// Test successful rendering
renderView(mockResForRender, 'dashboard', 'Dashboard Error'); // expect success

// Test error handling with mock that throws
const mockResWithError = { //(mock response that simulates a rendering error)
  render: function(viewName) { // always throws
    throw new Error('Template not found'); // simulate template failure
  }, // end render
  status: function(code) { // mimic Express status
    console.log(`Error response status set to: ${code}`); // log error status
    return this; // enable chaining
  }, // end status
  send: function(html) { // mimic Express send
    console.log(`Error page sent (truncated):`, html.substring(0, 100) + '...'); // log partial error page
    return this; // enable chaining
  } // end send
}; // end mockResWithError

renderView(mockResWithError, 'nonexistent', 'Template Error'); // triggers error path

// Demonstrate registering an Express route for a view //(added group explanation)
// Test registerViewRoute function
console.log('\nRoute registration function:'); // test express route helper
// Mock app object for testing
  global.app = { //(simulated Express app with GET)
    get: function(path, handler) { // mimic app.get
      console.log(`Route registered: GET ${path}`); // confirm route added
      // Test the handler
      handler(mockReq, mockResForRender); // invoke handler immediately
    } // end get
  }; // end mock app

registerViewRoute('/dashboard', 'dashboard', 'Dashboard Error'); //(registers route and renders view)

console.log('\nAll tests completed!'); // finished demonstration
