
// Unit tests focused on the view utilities responsible for EJS rendering and
// route registration. These tests confirm error pages render correctly and that
// routes hook into the global Express app as expected.
const { renderView, registerViewRoute } = require('../../lib/views');

describe('View Utilities', () => { // ensures server-side views handle failures
  describe('renderView', () => { // tests EJS rendering and fallback logic
    let mockRes;

    beforeEach(() => {
      mockRes = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
    });

    // verifies should render view successfully
    test('should render view successfully', () => {
      renderView(mockRes, 'dashboard', 'Dashboard Error');
      
      expect(mockRes.render).toHaveBeenCalledWith('dashboard'); // view rendered successfully
      expect(mockRes.status).not.toHaveBeenCalled(); // no error status
      expect(mockRes.send).not.toHaveBeenCalled(); // no html fallback sent
    });

    // verifies should send error page when rendering fails
    test('should send error page when rendering fails', () => {
      const error = new Error('Template not found');
      mockRes.render.mockImplementation(() => {
        throw error;
      });
      
      renderView(mockRes, 'nonexistent', 'Template Error');
      
      expect(mockRes.render).toHaveBeenCalledWith('nonexistent'); // attempted render of missing template
      expect(mockRes.status).toHaveBeenCalledWith(500); // send server error
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Template Error')); // error title included
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Template not found')); // original message included
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Return to Home')); // navigation hint included
    });

    // verifies should handle missing send method gracefully
    test('should handle missing send method gracefully', () => {
      const error = new Error('Render fails');
      mockRes.render.mockImplementation(() => {
        throw error;
      });

      delete mockRes.send; // simulate missing send method

      expect(() => {
        renderView(mockRes, 'view', 'Error Title');
      }).not.toThrow(); // should handle missing send gracefully

      expect(mockRes.status).not.toHaveBeenCalled(); // status not modified
    });

    // verifies should include error message in error page
    test('should include error message in error page', () => {
      const error = new Error('Custom error message');
      mockRes.render.mockImplementation(() => {
        throw error;
      });
      
      renderView(mockRes, 'failing-view', 'Custom Error Title');
      
      const sentContent = mockRes.send.mock.calls[0][0];
      expect(sentContent).toContain('Custom Error Title'); // title appears in output
      expect(sentContent).toContain('Custom error message'); // message sanitized
      expect(sentContent).toContain('failing-view'); // view name included
    });

    // verifies should escape error message for safe HTML
    test('should escape error message containing HTML', () => {
      const error = new Error('<script>alert("x")</script>');
      mockRes.render.mockImplementation(() => {
        throw error;
      });

      renderView(mockRes, 'script-view', 'Script Error');

      const sentContent = mockRes.send.mock.calls[0][0];
      expect(sentContent).toContain('&lt;script&gt;alert("x")&lt;/script&gt;'); // script tags escaped
    });

    // verifies should handle different view names
    test('should handle different view names', () => {
      const viewNames = ['dashboard', 'login', 'profile', 'admin'];
      
      viewNames.forEach(viewName => {
        const freshMockRes = {
          render: jest.fn(),
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis()
        };
        
        renderView(freshMockRes, viewName, 'Error');
        expect(freshMockRes.render).toHaveBeenCalledWith(viewName); // each view renders once
      });
    });
  });

  describe('registerViewRoute', () => { // confirms route setup integrates with app
    let mockApp;
    let originalApp;

    beforeEach(() => {
      originalApp = global.app;
      mockApp = {
        get: jest.fn()
      };
      global.app = mockApp;
    });

    afterEach(() => {
      global.app = originalApp;
    });

    // verifies should register route with correct path and handler
    test('should register route with correct path and handler', () => {
      registerViewRoute('/dashboard', 'dashboard', 'Dashboard Error');
      
      expect(mockApp.get).toHaveBeenCalledWith('/dashboard', expect.any(Function)); // route registered
    });

    // verifies should create handler that calls renderView
    test('should create handler that calls renderView', () => {
      registerViewRoute('/profile', 'profile', 'Profile Error');
      
      const handler = mockApp.get.mock.calls[0][1];
      const mockReq = {};
      const mockRes = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
      
      handler(mockReq, mockRes);
      expect(mockRes.render).toHaveBeenCalledWith('profile'); // handler triggers render
    });

    // verifies should handle app registration errors gracefully
    test('should handle app registration errors gracefully', () => {
      mockApp.get.mockImplementation(() => {
        throw new Error('Route registration failed');
      });
      
      // Should not throw error
      expect(() => {
        registerViewRoute('/failing-route', 'view', 'Error');
      }).not.toThrow(); // registration error swallowed
    });

    // verifies should handle missing global app
    test('should handle missing global app', () => {
      global.app = undefined;
      
      // Should not throw error
      expect(() => {
        registerViewRoute('/test', 'test', 'Test Error');
      }).not.toThrow(); // missing global.app handled
    });

    // verifies should register multiple routes
    test('should register multiple routes', () => {
      const routes = [
        ['/home', 'home', 'Home Error'],
        ['/about', 'about', 'About Error'],
        ['/contact', 'contact', 'Contact Error']
      ];
      
      routes.forEach(([path, view, title]) => {
        registerViewRoute(path, view, title);
      });
      
      expect(mockApp.get).toHaveBeenCalledTimes(3); // three routes registered
      expect(mockApp.get).toHaveBeenCalledWith('/home', expect.any(Function)); // home route
      expect(mockApp.get).toHaveBeenCalledWith('/about', expect.any(Function)); // about route
      expect(mockApp.get).toHaveBeenCalledWith('/contact', expect.any(Function)); // contact route
    });
  });
});
