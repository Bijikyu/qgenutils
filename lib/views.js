
const { qerrors } = require('qerrors');

/**
 * Render EJS template with graceful error handling
 * Rationale: Template rendering can fail for various reasons (missing templates,
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
 * @param {Object} res - Express response object for rendering
 * @param {string} viewName - Name of the EJS template to render
 * @param {string} errorTitle - Human-readable title for error page
 */
function renderView(res, viewName, errorTitle) {
  console.log(`renderView is running with ${viewName}`); // Log template rendering attempt
  try {
    res.render(viewName); // Attempt to render the requested EJS template
    console.log(`renderView has run resulting in a final value of ${viewName}`); // Log successful rendering
  } catch (err) {
    // Handle template rendering errors gracefully
    qerrors(err, 'renderView', {viewName}); // Log error with template context for debugging
    console.error(`Error rendering ${viewName}:`, err); // Additional console logging for immediate debugging
    
    // Send user-friendly error page with helpful information
    // This prevents users from seeing cryptic error messages or blank pages
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
 * @param {string} routePath - The route path to register
 * @param {string} viewName - Name of the EJS template to render
 * @param {string} title - Title for error page if rendering fails
 */
function registerViewRoute(routePath, viewName, title) {
  console.log(`registerViewRoute is running with ${routePath}`); // log invocation
  try {
    app.get(routePath, (req, res) => renderView(res, viewName, title)); // attach handler
    console.log(`registerViewRoute has run resulting in a final value of ${routePath}`); // log completion
  } catch (error) {
    qerrors(error, 'registerViewRoute', { routePath, viewName }); // report failure
  }
}

module.exports = {
  renderView,
  registerViewRoute
};
