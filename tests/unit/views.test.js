
const { renderView, registerViewRoute } = require('../../lib/views');

describe('View Utilities', () => {
  describe('renderView', () => {
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
      renderView(mockRes, 'dashboard', 'Dashboard Error'); // should succeed with no errors
      
      expect(mockRes.render).toHaveBeenCalledWith('dashboard'); // template rendered
      expect(mockRes.status).not.toHaveBeenCalled(); // no error status
      expect(mockRes.send).not.toHaveBeenCalled(); // no fallback sent
    });

    // verifies should send error page when rendering fails
    test('should send error page when rendering fails', () => {
      const error = new Error('Template not found'); // simulate render failure
      mockRes.render.mockImplementation(() => {
        throw error;
      });
      
      renderView(mockRes, 'nonexistent', 'Template Error'); // call with bad view
      
      expect(mockRes.render).toHaveBeenCalledWith('nonexistent');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Template Error'));
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Template not found'));
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Return to Home'));
    });

    // verifies should include error message in error page
    test('should include error message in error page', () => {
      const error = new Error('Custom error message');
      mockRes.render.mockImplementation(() => {
        throw error;
      });
      
      renderView(mockRes, 'failing-view', 'Custom Error Title');
      
      const sentContent = mockRes.send.mock.calls[0][0]; // capture generated HTML
      expect(sentContent).toContain('Custom Error Title');
      expect(sentContent).toContain('Custom error message');
      expect(sentContent).toContain('failing-view');
    });

    // verifies should handle different view names
    test('should handle different view names', () => {
      const viewNames = ['dashboard', 'login', 'profile', 'admin']; // test multiple names
      
      viewNames.forEach(viewName => {
        const freshMockRes = {
          render: jest.fn(),
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis()
        };
        
        renderView(freshMockRes, viewName, 'Error'); // attempt render
        expect(freshMockRes.render).toHaveBeenCalledWith(viewName); // each view rendered
      });
    });
  });

  describe('registerViewRoute', () => {
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
      registerViewRoute('/dashboard', 'dashboard', 'Dashboard Error'); // register route
      
      expect(mockApp.get).toHaveBeenCalledWith('/dashboard', expect.any(Function)); // handler attached
    });

    // verifies should create handler that calls renderView
    test('should create handler that calls renderView', () => {
      registerViewRoute('/profile', 'profile', 'Profile Error'); // create route for profile
      
      const handler = mockApp.get.mock.calls[0][1]; // capture route handler
      const mockReq = {};
      const mockRes = {
        render: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
      };
      
      handler(mockReq, mockRes); // invoke handler
      expect(mockRes.render).toHaveBeenCalledWith('profile'); // render called
    });

    // verifies should handle app registration errors gracefully
    test('should handle app registration errors gracefully', () => {
      mockApp.get.mockImplementation(() => {
        throw new Error('Route registration failed');
      });
      
      // Should not throw error
      expect(() => {
        registerViewRoute('/failing-route', 'view', 'Error'); // attempt register failing route
      }).not.toThrow(); // error handled internally
    });

    // verifies should handle missing global app
    test('should handle missing global app', () => {
      global.app = undefined; // remove app
      
      // Should not throw error
      expect(() => {
        registerViewRoute('/test', 'test', 'Test Error'); // call without app
      }).not.toThrow();
    });

    // verifies should register multiple routes
    test('should register multiple routes', () => {
      const routes = [
        ['/home', 'home', 'Home Error'],
        ['/about', 'about', 'About Error'],
        ['/contact', 'contact', 'Contact Error']
      ];
      
      routes.forEach(([path, view, title]) => {
        registerViewRoute(path, view, title); // register each
      });
      
      expect(mockApp.get).toHaveBeenCalledTimes(3);
      expect(mockApp.get).toHaveBeenCalledWith('/home', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/about', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/contact', expect.any(Function));
    });
  });
});
