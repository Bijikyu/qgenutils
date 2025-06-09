/*
 * View Rendering Utility Module
 * 
 * This module provides utilities for rendering EJS templates with robust error
 * handling and route registration. It focuses on graceful degradation when
 * template rendering fails and providing helpful error messages to users.
 * 
 * DESIGN PHILOSOPHY:
 * - User-friendly errors: Never show users cryptic template error messages
 * - Debugging support: Log detailed error information for developers
 * - Graceful fallback: Provide helpful error pages instead of crashes
 * - Developer experience: Centralize template rendering logic for consistency
 * 
 * EJS INTEGRATION:
 * EJS (Embedded JavaScript) is a popular templating engine for Express.js.
 * Template rendering can fail for various reasons, and this module handles
 * those failures gracefully while maintaining good user experience.
 */

const { qerrors } = require('qerrors');
const { hasMethod } = require('./input-validation');

/**
 * Render EJS template with graceful error handling
 * 
 * RATIONALE: Template rendering can fail for various reasons (missing templates,
 * syntax errors, data issues). Rather than letting these errors crash the server
 * or show cryptic error pages, this function provides graceful fallback with
 * helpful error messages.
 * 
 * The function serves multiple purposes:
 * 1. Centralized error handling for all view rendering
 * 2. User-friendly error pages that explain what went wrong
 * 3. Comprehensive error logging for debugging template issues
 * 4. Fallback navigation to prevent users from getting stuck
 * 
 * This is especially important for admin pages where template errors could
 * prevent access to critical functionality.
 * 
 * IMPLEMENTATION DECISIONS:
 * - Try template rendering first, handle errors in catch block
 * - Send HTML error page (not JSON) since this is for user-facing pages
 * - Include error message in page for debugging (be careful in production)
 * - Provide "Return to Home" link for user navigation
 * - Use 500 status code to indicate server error
 * 
 * ERROR PAGE DESIGN:
 * The error page includes:
 * - Clear heading indicating the specific page that failed
 * - Technical error message (useful for developers)
 * - Navigation link to prevent users from being stuck
 * - Simple HTML that doesn't rely on CSS/JS that might also be broken
 * 
 * SECURITY CONSIDERATIONS:
 * - Error messages might reveal server file paths or internal structure
 * - In production, consider showing generic error messages to users
 * - Detailed errors should still be logged for debugging purposes
 * 
 * ALTERNATIVE APPROACHES CONSIDERED:
 * - Redirect to error page - rejected because it loses context
 * - JSON error response - rejected because this is for HTML pages
 * - Generic error page - rejected because specific context is valuable
 * 
 * @param {Object} res - Express response object for rendering templates
 * @param {string} viewName - Name of the EJS template to render (e.g., 'dashboard', 'login')
 * @param {string} errorTitle - Human-readable title for error page if rendering fails
 */
function renderView(res, viewName, errorTitle) {
  console.log(`renderView is running with ${viewName}`); // track requested view name
  try {
    // Validate parameters
    if (!hasMethod(res, 'render')) {
      console.log(`renderView: Invalid res object provided`); // response lacks render method
      return null; // cannot render
    }

    // Attempt to render the specified view/template
    // This will throw an error if the template doesn't exist or has syntax issues
    res.render(viewName); // delegate rendering to Express/EJS
  } catch (err) {
    // Handle template rendering errors gracefully without crashing the request

    // Log error with template context for debugging template issues
    qerrors(err, 'renderView', {viewName}); // log what went wrong
    console.error(`Error rendering ${viewName}:`, err); // Additional console logging for immediate debugging

    // Send user-friendly error page with helpful information if res is available
    // This prevents users from seeing cryptic error messages or blank pages
    if (hasMethod(res, 'status')) {
      res.status(500).send(`
        <h1>Template Error</h1>
        <p>There was an error rendering the ${viewName} page:</p>
        <pre>${err.message}</pre>
        <p>Please contact support if this error persists.</p>
      `);
    }
  }
}

/**
 * Attach view route handler to Express app
 * 
 * RATIONALE: Many routes simply render a template without complex logic.
 * This function reduces boilerplate by creating route handlers that just
 * render templates with error handling built in.
 * 
 * IMPLEMENTATION STRATEGY:
 * - Use global 'app' object (assumes Express app is globally available)
 * - Create route handler that calls renderView with appropriate parameters
 * - Handle route registration errors gracefully
 * - Log route registration for debugging routing issues
 * 
 * USE CASES:
 * - Static pages (about, contact, help)
 * - Admin dashboard pages
 * - Simple form pages without complex logic
 * - Landing pages that just need template rendering
 * 
 * DESIGN ASSUMPTIONS:
 * - Express app is available as global variable 'app'
 * - Routes are simple GET requests that just render templates
 * - No middleware or complex logic needed for these routes
 * - Error handling follows the same pattern as renderView
 * 
 * GLOBAL APP PATTERN:
 * Using a global 'app' variable is a common pattern in smaller Express applications.
 * For larger applications, consider dependency injection or module imports.
 * 
 * ALTERNATIVE APPROACHES CONSIDERED:
 * - Pass app as parameter - rejected for simplicity in common use case
 * - Return route handler function - rejected because caller still needs app
 * - Middleware pattern - rejected because these are specific endpoints
 * 
 * @param {string} routePath - The route path to register (e.g., '/dashboard', '/admin')
 * @param {string} viewName - Name of the EJS template to render
 * @param {string} title - Title for error page if rendering fails
 */
function registerViewRoute(route, viewName, errorTitle) {
  console.log(`registerViewRoute is running with ${route}`); // note route path being registered
  try {
    // Check if global app object exists and has the get method
    // This prevents errors when the function is called before Express app initialization
    if (typeof global !== 'undefined' && hasMethod(global.app, 'get')) {
      // Register GET route with the provided path
      // The handler function will be called when the route is accessed
      global.app.get(route, (req, res) => {
        renderView(res, viewName, errorTitle); // render page on request
      });
      console.log(`registerViewRoute successfully registered ${route}`);
    } else {
      console.log(`registerViewRoute: global.app not available for ${route}`); // cannot register route
    }
  } catch (error) {
    // Handle any errors during route registration (invalid route patterns, etc.)
    qerrors(error, 'registerViewRoute', { route, viewName, errorTitle }); // capture registration failure
    console.log(`registerViewRoute failed for ${route}`); // notify of problem
  }
}

/*
 * Module Export Strategy:
 * 
 * We export both functions because they serve complementary purposes:
 * 
 * 1. renderView - Direct template rendering with error handling (for use in existing routes)
 * 2. registerViewRoute - Automated route creation for simple template pages
 * 
 * This gives developers flexibility to either:
 * - Use renderView in existing route handlers with custom logic
 * - Use registerViewRoute to quickly create simple template-only routes
 * 
 * FUTURE ENHANCEMENTS:
 * - Add support for template data injection
 * - Add support for middleware in registerViewRoute
 * - Add support for multiple HTTP methods
 * - Add support for custom error page templates
 * - Add caching for frequently rendered templates
 */
module.exports = {
  renderView,
  registerViewRoute
};