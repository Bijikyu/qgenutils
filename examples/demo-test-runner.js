/**
 * Demo Test Runner for Frontend Testing
 * 
 * Provides basic test runner functionality for the demo interface.
 * This is a simplified version for demonstration purposes.
 */

class DemoTestRunner {
    constructor() {
        this.isRunning = false;
        this.results = [];
        this.configure = function(options) {
            console.log('Test runner configured with:', options);
        };
    }

    async runSuite(suiteName) {
        console.log(`Running test suite: ${suiteName}`);
        this.isRunning = true;

        const mockResults = {
            summary: {
                totalTests: 5,
                passed: 4,
                failed: 1,
                errors: 0,
                passRate: '80%',
                duration: 150
            }
        };

        this.isRunning = false;
        return mockResults;
    }

    async runAllSuites() {
        console.log('Running all test suites');
        this.isRunning = true;

        const mockResults = {
            summary: {
                totalTests: 20,
                passed: 18,
                failed: 2,
                errors: 0,
                passRate: '90%',
                duration: 500
            }
        };

        this.isRunning = false;
        return mockResults;
    }

    clearResults() {
        this.results = [];
        console.log('Test results cleared');
    }
}

// Export for global use
window.DemoTestRunner = DemoTestRunner;

console.log('Demo Test Runner loaded');