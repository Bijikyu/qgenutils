
/**
 * View Rendering Module
 * 
 * This module provides utilities for safe template rendering and route registration
 * in Express applications. It's designed to handle template rendering failures
 * gracefully while providing helpful error information to both users and developers.
 * 
 * The module addresses common template rendering challenges:
 * 1. Template files missing or inaccessible
 * 2. Syntax errors in EJS templates
 * 3. Data binding issues causing render failures
 * 4. Server crashes due to unhandled template errors
 * 5. Poor user experience when templates fail
 */

const { qerrors } = require('qerrors');

/**
 * Render EJS template with graceful error handling
 * 
 * This function provides a safe wrapper around Express's res.render() method
 * that prevents template errors from crashing the server or showing cryptic
 * error messages to users.
 * 
 * Rationale for comprehensive error handling:
 * Template rendering can fail for numerous reasons that are often outside the
 * developer's immediate control:
 * - Missing template files (deployment issues, file permissions)
 * - EJS syntax errors (malformed template code)
 * - Data binding issues (undefined variables in templates)
 * - File system errors (disk full, corrupted files)
 * - Memory issues (large templates, resource constraints)
 * 
 * Rather than letting these errors crash the server or show cryptic error pages,
 * this function provides graceful fallback with helpful error messages.
 * 
 * The function serves multiple purposes:
 * 1. Centralized error handling for all view rendering across the application
 * 2. User-friendly error pages that explain what went wrong in plain language
 * 3. Comprehensive error logging for debugging template issues in development/production
 * 4. Fallback navigation to prevent users from getting stuck on broken pages
 * 5. Maintains application stability even when individual templates fail
 * 
 * Error page design rationale:
 * - Shows clear error title so users understand what happened
 * - Displays template name so developers can identify the problem
 * - Includes error message for technical debugging
 * - Provides "Return to Home" link to prevent user frustration
 * - Uses inline HTML to avoid dependency on working template system
 * 
 * This approach is especially important for:
 * - Admin pages where template errors could prevent access to critical functionality
 * - Public-facing pages where broken templates create poor user experience
 * - Development environments where template errors need clear debugging information
 * - Production environments where stability must be maintained
 * 
 * @param {Object} res - Express response object for rendering HTTP responses
 * @param {string} viewName - Name of the EJS template to render (e.g., 'dashboard', 'login')
 * @param {string} errorTitle - Human-readable title for error page (e.g., 'Dashboard Error')
 */
function renderView(res, viewName, errorTitle) {
  console.log(`renderView is running with ${viewName}`); // Log template rendering attempt for debugging
  try {
    // Attempt to render the requested EJS template
    // This calls Express's built-in rendering engine which handles template loading,
    // compilation, and data binding
    res.render(viewName);
    console.log(`renderView has run resulting in a final value of ${viewName}`); // Log successful rendering
  } catch (err) {
    // Handle template rendering errors gracefully without crashing the server
    
    // Log error with template context using qerrors for structured error tracking
    qerrors(err, 'renderView', {viewName});
    
    // Additional console logging for immediate debugging during development
    console.error(`Error rendering ${viewName}:`, err);
    
    // Send user-friendly error page with helpful information
    // This prevents users from seeing cryptic error messages or blank pages
    // Uses inline HTML to avoid dependency on the template system that just failed
    res.status(500).send(`
      <h1>${errorTitle}</h1>
      <p>There was an error rendering the ${viewName} page:</p>
      <pre>${err.message}</pre>
      <p><a href="/">Return to Home</a></p>
    `);
  }
}

/**
 * Attach view route handler to Express app
 * 
 * This function registers a route that renders a specific template, using the
 * safe rendering approach provided by renderView(). It's a convenience function
 * for setting up simple template routes with consistent error handling.
 * 
 * Rationale for route registration helper:
 * 1. Reduces boilerplate code for simple template routes
 * 2. Ensures consistent error handling across all template routes  
 * 3. Centralizes route registration patterns for maintainability
 * 4. Provides logging for route registration debugging
 * 5. Handles route registration errors gracefully
 * 
 * Use cases:
 * - Static pages (about, contact, help)
 * - Admin dashboard pages
 * - User profile pages
 * - Any route that simply renders a template without complex logic
 * 
 * Error handling approach:
 * - Logs route registration attempts for debugging
 * - Captures route registration failures without crashing
 * - Uses qerrors for structured error tracking
 * - Fails gracefully if Express app isn't available
 * 
 * Note: This function assumes a global 'app' variable exists (Express app instance).
 * In production code, this dependency should be injected or passed as a parameter.
 * 
 * @param {string} routePath - The route path to register (e.g., '/dashboard', '/admin')
 * @param {string} viewName - Name of the EJS template to render (e.g., 'dashboard', 'admin')
 * @param {string} title - Title for error page if rendering fails (e.g., 'Dashboard Error')
 */
function registerViewRoute(routePath, viewName, title) {
  console.log(`registerViewRoute is running with ${routePath}`); // Log route registration attempt
  try {
    // Register GET route that renders the specified template
    // Uses arrow function to capture viewName and title in closure
    app.get(routePath, (req, res) => renderView(res, viewName, title));
    console.log(`registerViewRoute has run resulting in a final value of ${routePath}`); // Log successful registration
  } catch (error) {
    // Handle route registration errors gracefully
    // This could happen if 'app' is undefined or route path is invalid
    qerrors(error, 'registerViewRoute', { routePath, viewName }); // Log error with context for debugging
  }
}

module.exports = {
  renderView,
  registerViewRoute
};
