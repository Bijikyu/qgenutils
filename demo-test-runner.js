/**
 * Automated Test Runner for QGenUtils Demo
 * Provides comprehensive automated testing capabilities
 */

class DemoTestRunner {
    constructor() {
        this.testSuites = new Map();
        this.results = [];
        this.isRunning = false;
        this.currentSuite = null;
        this.config = {
            delayBetweenTests: 100,
            maxConcurrentTests: 3,
            enablePerformanceMonitoring: true,
            generateReports: true
        };
        
        this.initializeTestSuites();
    }

    initializeTestSuites() {
        // Validation Test Suite
        this.testSuites.set('validation', {
            name: 'Validation Utilities',
            tests: [
                {
                    name: 'Email Validation',
                    function: 'validateEmail',
                    testCases: [
                        { input: 'test@example.com', expected: true },
                        { input: 'invalid-email', expected: false },
                        { input: '', expected: false },
                        { input: 'user.name+tag@domain.co.uk', expected: true },
                        { input: 'user@192.168.0.1', expected: true }
                    ]
                },
                {
                    name: 'Password Strength Validation',
                    function: 'validatePasswordStrength',
                    testCases: [
                        { input: '123', expected: { strength: 1, score: 0.2 } },
                        { input: 'Password123!', expected: { strength: 4, score: 0.8 } },
                        { input: 'Str0ngP@ssw0rd!', expected: { strength: 5, score: 1.0 } },
                        { input: '', expected: { strength: 0, score: 0 } }
                    ]
                },
                {
                    name: 'API Key Validation',
                    function: 'validateApiKeyFormat',
                    testCases: [
                        { input: 'sk-1234567890abcdef', expected: { isValid: true, type: 'sk-*' } },
                        { input: 'pk-test1234567890', expected: { isValid: true, type: 'pk-*' } },
                        { input: 'invalid', expected: { isValid: false, type: 'unknown' } },
                        { input: '', expected: { isValid: false, type: 'unknown' } }
                    ]
                }
            ]
        });

        // Security Test Suite
        this.testSuites.set('security', {
            name: 'Security Utilities',
            tests: [
                {
                    name: 'API Key Masking',
                    function: 'maskApiKey',
                    testCases: [
                        { input: 'sk-1234567890abcdef1234567890', expected: 'sk-12************************7890' },
                        { input: 'short', expected: '******' },
                        { input: '', expected: '' }
                    ]
                },
                {
                    name: 'Input Sanitization',
                    function: 'sanitizeInput',
                    testCases: [
                        { input: '<script>alert("xss")</script>', expected: 'alert("xss")' },
                        { input: 'Hello <b>World</b>', expected: 'Hello World' },
                        { input: 'javascript:alert("xss")', expected: 'alert("xss")' }
                    ]
                }
            ]
        });

        // Collections Test Suite
        this.testSuites.set('collections', {
            name: 'Collections & Arrays',
            tests: [
                {
                    name: 'Array Group By',
                    function: 'groupBy',
                    testCases: [
                        {
                            input: { array: [{ cat: 'A' }, { cat: 'B' }, { cat: 'A' }], key: 'cat' },
                            expected: { A: [{ cat: 'A' }, { cat: 'A' }], B: [{ cat: 'B' }] }
                        },
                        {
                            input: { array: [{ type: 'fruit' }, { type: 'vegetable' }], key: 'type' },
                            expected: { fruit: [{ type: 'fruit' }], vegetable: [{ type: 'vegetable' }] }
                        }
                    ]
                },
                {
                    name: 'Array Partition',
                    function: 'partition',
                    testCases: [
                        {
                            input: { array: [1, 2, 3, 4, 5, 6], condition: 'x => x > 3' },
                            expected: [[4, 5, 6], [1, 2, 3]]
                        }
                    ]
                },
                {
                    name: 'Array Unique',
                    function: 'unique',
                    testCases: [
                        { input: [1, 2, 2, 3, 1, 4], expected: [1, 2, 3, 4] },
                        { input: ['a', 'b', 'a', 'c'], expected: ['a', 'b', 'c'] },
                        { input: [], expected: [] }
                    ]
                }
            ]
        });

        // Performance Test Suite
        this.testSuites.set('performance', {
            name: 'Performance Utilities',
            tests: [
                {
                    name: 'Function Memoization',
                    function: 'testMemoization',
                    testCases: [
                        { input: { iterations: 1000, expensiveFunction: 'fibonacci' }, expected: 'significant_improvement' }
                    ]
                },
                {
                    name: 'Function Throttling',
                    function: 'testThrottle',
                    testCases: [
                        { input: { calls: 10, delay: 100 }, expected: 'rate_limited_execution' }
                    ]
                },
                {
                    name: 'Function Debouncing',
                    function: 'testDebounce',
                    testCases: [
                        { input: { calls: 10, delay: 100 }, expected: 'single_execution' }
                    ]
                }
            ]
        });
    }

    async runSuite(suiteName) {
        if (this.isRunning) {
            throw new Error('Test runner is already running');
        }

        const suite = this.testSuites.get(suiteName);
        if (!suite) {
            throw new Error(`Test suite '${suiteName}' not found`);
        }

        this.isRunning = true;
        this.currentSuite = suiteName;
        
        const suiteResults = {
            suiteName,
            suiteDisplayName: suite.name,
            startTime: Date.now(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                errors: 0,
                duration: 0
            }
        };

        this.updateUI('Running suite: ' + suite.name);

        for (const test of suite.tests) {
            const testResult = await this.runTest(test);
            suiteResults.tests.push(testResult);
            suiteResults.summary.total++;
            
            if (testResult.passed) {
                suiteResults.summary.passed++;
            } else if (testResult.error) {
                suiteResults.summary.errors++;
            } else {
                suiteResults.summary.failed++;
            }

            // Update UI after each test
            this.updateTestProgress(suiteResults);
            
            // Delay between tests
            if (this.config.delayBetweenTests > 0) {
                await this.delay(this.config.delayBetweenTests);
            }
        }

        suiteResults.summary.duration = Date.now() - suiteResults.startTime;
        suiteResults.endTime = Date.now();
        
        this.results.push(suiteResults);
        this.isRunning = false;
        this.currentSuite = null;

        this.updateUI('Suite completed: ' + suite.name);
        this.generateSuiteReport(suiteResults);
        
        return suiteResults;
    }

    async runAllSuites() {
        const allResults = {
            startTime: Date.now(),
            suites: [],
            summary: {
                totalSuites: this.testSuites.size,
                totalTests: 0,
                totalPassed: 0,
                totalFailed: 0,
                totalErrors: 0,
                totalDuration: 0
            }
        };

        this.updateUI('Running all test suites...');

        for (const [suiteName] of this.testSuites.keys()) {
            const suiteResult = await this.runSuite(suiteName);
            allResults.suites.push(suiteResult);
            
            allResults.summary.totalTests += suiteResult.summary.total;
            allResults.summary.totalPassed += suiteResult.summary.passed;
            allResults.summary.totalFailed += suiteResult.summary.failed;
            allResults.summary.totalErrors += suiteResult.summary.errors;
        }

        allResults.summary.totalDuration = Date.now() - allResults.startTime;
        allResults.endTime = Date.now();

        this.generateComprehensiveReport(allResults);
        return allResults;
    }

    async runTest(test) {
        const testResult = {
            name: test.name,
            function: test.function,
            startTime: Date.now(),
            passed: false,
            error: null,
            results: [],
            performance: {},
            duration: 0
        };

        try {
            // Performance monitoring
            const perfStart = performance.now();
            const memoryStart = performance.memory ? performance.memory.usedJSHeapSize : 0;

            for (let i = 0; i < test.testCases.length; i++) {
                const testCase = test.testCases[i];
                const caseResult = await this.runTestCase(test, testCase, i);
                testResult.results.push(caseResult);
            }

            const perfEnd = performance.now();
            const memoryEnd = performance.memory ? performance.memory.usedJSHeapSize : 0;

            testResult.performance = {
                executionTime: perfEnd - perfStart,
                memoryUsed: memoryEnd - memoryStart,
                casesPerSecond: (test.testCases.length / ((perfEnd - perfStart) / 1000)).toFixed(2)
            };

            testResult.passed = testResult.results.every(result => result.passed);

        } catch (error) {
            testResult.error = {
                message: error.message,
                stack: error.stack
            };
        }

        testResult.duration = Date.now() - testResult.startTime;
        return testResult;
    }

    async runTestCase(test, testCase, index) {
        const caseResult = {
            index,
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            passed: false,
            error: null,
            duration: 0
        };

        const startTime = Date.now();

        try {
            // Get the function from the global utils object
            let fn = window.utils[test.function];
            if (!fn) {
                // Try to get it from window
                fn = window[test.function];
            }

            if (!fn) {
                throw new Error(`Function '${test.function}' not found`);
            }

            let actual;
            
            // Handle different function signatures
            if (typeof testCase.input === 'object' && testCase.input.array) {
                actual = fn(testCase.input.array, testCase.input.key || testCase.input.condition);
            } else if (typeof testCase.input === 'object' && testCase.input.iterations) {
                // For performance tests
                actual = await this.runPerformanceTest(test.function, testCase.input);
            } else {
                actual = fn(testCase.input);
            }

            caseResult.actual = actual;
            
            // Compare results
            if (typeof testCase.expected === 'object') {
                caseResult.passed = this.deepEqual(actual, testCase.expected);
            } else {
                caseResult.passed = actual === testCase.expected;
            }

        } catch (error) {
            caseResult.error = {
                message: error.message,
                stack: error.stack
            };
        }

        caseResult.duration = Date.now() - startTime;
        return caseResult;
    }

    async runPerformanceTest(functionName, input) {
        switch (functionName) {
            case 'testMemoization':
                return this.runMemoizationTest(input);
            case 'testThrottle':
                return this.runThrottleTest(input);
            case 'testDebounce':
                return this.runDebounceTest(input);
            default:
                return 'performance_test_completed';
        }
    }

    async runMemoizationTest(input) {
        const iterations = input.iterations || 1000;
        
        // Regular function
        const regularFn = (n) => {
            let result = 0;
            for (let i = 0; i < n; i++) {
                result += Math.sqrt(i);
            }
            return result;
        };

        // Memoized function
        const memoizedFn = window.utils.memoize(regularFn);

        // Test regular
        const startRegular = performance.now();
        for (let i = 0; i < iterations; i++) {
            regularFn(100);
        }
        const timeRegular = performance.now() - startRegular;

        // Test memoized
        const startMemoized = performance.now();
        for (let i = 0; i < iterations; i++) {
            memoizedFn(100);
        }
        const timeMemoized = performance.now() - startMemoized;

        const improvement = timeRegular / timeMemoized;
        
        return improvement > 2 ? 'significant_improvement' : 'minimal_improvement';
    }

    async runThrottleTest(input) {
        return new Promise((resolve) => {
            const { calls, delay } = input;
            let executionCount = 0;
            
            const throttledFn = window.utils.throttle(() => {
                executionCount++;
            }, delay);

            const interval = setInterval(() => {
                throttledFn();
            }, 20);

            setTimeout(() => {
                clearInterval(interval);
                resolve(executionCount < calls ? 'rate_limited_execution' : 'unrestricted_execution');
            }, calls * 20 + delay);
        });
    }

    async runDebounceTest(input) {
        return new Promise((resolve) => {
            const { calls, delay } = input;
            let executionCount = 0;
            
            const debouncedFn = window.utils.debounce(() => {
                executionCount++;
            }, delay);

            // Rapid calls
            for (let i = 0; i < calls; i++) {
                debouncedFn();
            }

            setTimeout(() => {
                resolve(executionCount === 1 ? 'single_execution' : 'multiple_executions');
            }, delay + 50);
        });
    }

    deepEqual(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== typeof obj2) return false;

        if (typeof obj1 === 'object') {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            
            if (keys1.length !== keys2.length) return false;
            
            for (let key of keys1) {
                if (!keys2.includes(key)) return false;
                if (!this.deepEqual(obj1[key], obj2[key])) return false;
            }
            
            return true;
        }
        
        return false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateUI(message) {
        const statusElement = document.getElementById('testRunnerStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }

        // Update progress bar
        const progressBar = document.getElementById('testRunnerProgress');
        if (progressBar && this.currentSuite) {
            const suite = this.testSuites.get(this.currentSuite);
            const completedTests = this.results[this.results.length - 1]?.tests.length || 0;
            const totalTests = suite.tests.length;
            const progress = (completedTests / totalTests) * 100;
            progressBar.style.width = progress + '%';
        }
    }

    updateTestProgress(suiteResults) {
        const completedTests = suiteResults.tests.length;
        const totalTests = this.testSuites.get(this.currentSuite).tests.length;
        const progress = (completedTests / totalTests) * 100;
        
        const progressBar = document.getElementById('testRunnerProgress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        const statusElement = document.getElementById('testRunnerStatus');
        if (statusElement) {
            statusElement.textContent = `Running test ${completedTests}/${totalTests} - ${suiteResults.tests[completedTests - 1]?.name || ''}`;
        }
    }

    generateSuiteReport(suiteResults) {
        const report = {
            suite: suiteResults.suiteDisplayName,
            timestamp: new Date().toISOString(),
            summary: suiteResults.summary,
            tests: suiteResults.tests.map(test => ({
                name: test.name,
                passed: test.passed,
                duration: test.duration,
                performance: test.performance,
                cases: test.results
            }))
        };

        this.displayReport(report);
        
        if (this.config.generateReports) {
            this.downloadReport(report, `${suiteResults.suiteName}-report.json`);
        }
    }

    generateComprehensiveReport(allResults) {
        const report = {
            type: 'Comprehensive Test Report',
            timestamp: new Date().toISOString(),
            summary: allResults.summary,
            suites: allResults.suites
        };

        this.displayReport(report);
        
        if (this.config.generateReports) {
            this.downloadReport(report, 'comprehensive-test-report.json');
        }
    }

    displayReport(report) {
        const reportContainer = document.getElementById('testRunnerReport');
        if (!reportContainer) return;

        const reportHtml = `
            <div class="test-report">
                <h3>${report.suite || 'Test Report'}</h3>
                <div class="report-summary">
                    <span class="metric">
                        <span class="value">${report.summary?.passed || report.summary?.totalPassed || 0}</span>
                        <span class="label">Passed</span>
                    </span>
                    <span class="metric">
                        <span class="value">${report.summary?.failed || report.summary?.totalFailed || 0}</span>
                        <span class="label">Failed</span>
                    </span>
                    <span class="metric">
                        <span class="value">${report.summary?.errors || report.summary?.totalErrors || 0}</span>
                        <span class="label">Errors</span>
                    </span>
                    <span class="metric">
                        <span class="value">${(report.summary?.duration || report.summary?.totalDuration || 0).toFixed(0)}ms</span>
                        <span class="label">Duration</span>
                    </span>
                </div>
                <div class="report-details">
                    <pre>${JSON.stringify(report, null, 2)}</pre>
                </div>
            </div>
        `;

        reportContainer.innerHTML = reportHtml;
        reportContainer.style.display = 'block';
    }

    downloadReport(report, filename) {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    configure(config) {
        this.config = { ...this.config, ...config };
    }

    getResults() {
        return this.results;
    }

    clearResults() {
        this.results = [];
        const reportContainer = document.getElementById('testRunnerReport');
        if (reportContainer) {
            reportContainer.innerHTML = '';
            reportContainer.style.display = 'none';
        }
    }
}

// Export for use in the demo
window.DemoTestRunner = DemoTestRunner;