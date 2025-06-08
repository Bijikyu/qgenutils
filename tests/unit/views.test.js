
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

    test('should render view successfully', () => {
      renderView(mockRes, 'dashboard', 'Dashboard Error');
      
      expect(mockRes.render).toHaveBeenCalledWith('dashboard');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.send).not.toHaveBeenCalled();
    });

    test('should send error page when rendering fails', () => {
      const error = new Error('Template not found');
      mockRes.render.mockImplementation(() => {
        throw error;
      });
      
      renderView(mockRes, 'nonexistent', 'Template Error');
      
      expect(mockRes.render).toHaveBeenCalledWith('nonexistent');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Template Error'));
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Template not found'));
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Return to Home'));
    });

    test('should include error message in error page', () => {
      const error = new Error('Custom error message');
      mockRes.render.mockImplementation(() => {
        throw error;
      });
      
      renderView(mockRes, 'failing-view', 'Custom Error Title');
      
      const sentContent = mockRes.send.mock.calls[0][0];
      expect(sentContent).toContain('Custom Error Title');
      expect(sentContent).toContain('Custom error message');
      expect(sentContent).toContain('failing-view');
    });

    test('should handle different view names', () => {
      const viewNames = ['dashboard', 'login', 'profile', 'admin'];
      
      viewNames.forEach(viewName => {
        const freshMockRes = {
          render: jest.fn(),
          status: jest.fn().mockReturnThis(),
          send: jest.fn().mockReturnThis()
        };
        
        renderView(freshMockRes, viewName, 'Error');
        expect(freshMockRes.render).toHaveBeenCalledWith(viewName);
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

    test('should register route with correct path and handler', () => {
      registerViewRoute('/dashboard', 'dashboard', 'Dashboard Error');
      
      expect(mockApp.get).toHaveBeenCalledWith('/dashboard', expect.any(Function));
    });

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
      expect(mockRes.render).toHaveBeenCalledWith('profile');
    });

    test('should handle app registration errors gracefully', () => {
      mockApp.get.mockImplementation(() => {
        throw new Error('Route registration failed');
      });
      
      // Should not throw error
      expect(() => {
        registerViewRoute('/failing-route', 'view', 'Error');
      }).not.toThrow();
    });

    test('should handle missing global app', () => {
      global.app = undefined;
      
      // Should not throw error
      expect(() => {
        registerViewRoute('/test', 'test', 'Test Error');
      }).not.toThrow();
    });

    test('should register multiple routes', () => {
      const routes = [
        ['/home', 'home', 'Home Error'],
        ['/about', 'about', 'About Error'],
        ['/contact', 'contact', 'Contact Error']
      ];
      
      routes.forEach(([path, view, title]) => {
        registerViewRoute(path, view, title);
      });
      
      expect(mockApp.get).toHaveBeenCalledTimes(3);
      expect(mockApp.get).toHaveBeenCalledWith('/home', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/about', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/contact', expect.any(Function));
    });
  });
});
