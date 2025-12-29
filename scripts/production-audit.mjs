#!/usr/bin/env node

/**
 * Production Readiness Audit
 * 
 * Comprehensive audit for production deployment readiness
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

class ProductionAudit {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
    this.passed = [];
  }

  async runAudit() {
    console.log('🔍 Production Readiness Audit');
    console.log('================================');
    
    await this.checkBuildSystem();
    await this.checkDependencies();
    await this.checkSecurity();
    await this.checkPerformance();
    await this.checkTesting();
    await this.checkDocumentation();
    await this.checkConfiguration();
    await this.checkMonitoring();
    
    this.generateReport();
  }

  async checkBuildSystem() {
    console.log('\n🏗️  Build System Check');
    
    try {
      // Check if build output exists
      if (existsSync('dist/index.js')) {
        this.passed.push('✅ Build output exists');
      } else {
        this.issues.push('❌ Build output missing - run npm run build');
      }
      
      // Check TypeScript compilation
      try {
        execSync('npm run build', { stdio: 'pipe' });
        this.passed.push('✅ TypeScript compilation successful');
      } catch (error) {
        this.issues.push('❌ TypeScript compilation failed');
      }
      
      // Check package.json scripts
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const requiredScripts = ['build', 'test', 'start'];
      
      requiredScripts.forEach(script => {
        if (packageJson.scripts[script]) {
          this.passed.push(`✅ Script '${script}' exists`);
        } else {
          this.issues.push(`❌ Missing required script: ${script}`);
        }
      });
      
      // Check production build
      if (packageJson.scripts['build:prod']) {
        this.passed.push('✅ Production build script available');
      } else {
        this.warnings.push('⚠️  Consider adding build:prod script');
      }
      
    } catch (error) {
      this.issues.push(`❌ Build system check failed: ${error.message}`);
    }
  }

  async checkDependencies() {
    console.log('\n📦 Dependencies Check');
    
    try {
      // Check for security vulnerabilities
      try {
        const auditOutput = execSync('npm audit --json', { encoding: 'utf8', stdio: 'pipe' });
        const auditResult = JSON.parse(auditOutput);
        
        if (auditResult.metadata && auditResult.metadata.vulnerabilities.total === 0) {
          this.passed.push('✅ No security vulnerabilities found');
        } else {
          this.issues.push(`❌ ${auditResult.metadata?.vulnerabilities?.total || 0} security vulnerabilities found`);
        }
      } catch (error) {
        this.warnings.push('⚠️  Could not run security audit');
      }
      
      // Check package.json structure
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
        this.passed.push(`✅ ${Object.keys(packageJson.dependencies).length} production dependencies`);
      }
      
      if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
        this.passed.push(`✅ ${Object.keys(packageJson.devDependencies).length} dev dependencies separated`);
      }
      
      // Check for development dependencies in production
      const devDeps = packageJson.devDependencies || {};
      const prodDeps = packageJson.dependencies || {};
      
      const problematicDeps = Object.keys(devDeps).filter(dep => 
        dep.includes('typescript') || dep.includes('jest') || dep.includes('test')
      ).filter(dep => prodDeps[dep]);
      
      if (problematicDeps.length === 0) {
        this.passed.push('✅ No development dependencies in production');
      } else {
        this.warnings.push(`⚠️  Development dependencies in production: ${problematicDeps.join(', ')}`);
      }
      
    } catch (error) {
      this.issues.push(`❌ Dependency check failed: ${error.message}`);
    }
  }

  async checkSecurity() {
    console.log('\n🔐 Security Check');
    
    try {
      // Check for environment variables
      if (existsSync('.env.example') || existsSync('.env')) {
        this.passed.push('✅ Environment configuration present');
      } else {
        this.warnings.push('⚠️  Consider adding .env.example for configuration template');
      }
      
      // Check for security headers in potential express app
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.helmet) {
        this.passed.push('✅ Security middleware (helmet) available');
      } else {
        this.recommendations.push('🔧 Consider adding helmet for security headers');
      }
      
      if (deps.bcrypt) {
        this.passed.push('✅ Secure password hashing (bcrypt) available');
      }
      
      if (deps['express-rate-limit']) {
        this.passed.push('✅ Rate limiting available');
      }
      
      // Check for unsafe dependencies
      const unsafeDeps = ['eval', 'vm2', 'node-vm'];
      const foundUnsafe = Object.keys(deps).filter(dep => 
        unsafeDeps.includes(dep.toLowerCase())
      );
      
      if (foundUnsafe.length === 0) {
        this.passed.push('✅ No obviously unsafe dependencies detected');
      } else {
        this.issues.push(`❌ Potentially unsafe dependencies: ${foundUnsafe.join(', ')}`);
      }
      
    } catch (error) {
      this.warnings.push(`⚠️  Security check incomplete: ${error.message}`);
    }
  }

  async checkPerformance() {
    console.log('\n⚡ Performance Check');
    
    try {
      // Check bundle size
      if (existsSync('dist/index.js')) {
        const stats = await fs.promises.stat('dist/index.js');
        const sizeKB = stats.size / 1024;
        
        if (sizeKB < 500) {
          this.passed.push(`✅ Bundle size optimal: ${sizeKB.toFixed(1)}KB`);
        } else if (sizeKB < 2000) {
          this.warnings.push(`⚠️  Bundle size large: ${sizeKB.toFixed(1)}KB`);
        } else {
          this.issues.push(`❌ Bundle size too large: ${sizeKB.toFixed(1)}KB`);
        }
      }
      
      // Check for performance optimization utilities
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['heap'] || deps['heapdump']) {
        this.passed.push('✅ Memory profiling tools available');
      }
      
      // Check if performance script exists
      if (packageJson.scripts['test:performance']) {
        this.passed.push('✅ Performance testing script available');
      } else {
        this.recommendations.push('🔧 Add performance testing script');
      }
      
    } catch (error) {
      this.warnings.push(`⚠️  Performance check incomplete: ${error.message}`);
    }
  }

  async checkTesting() {
    console.log('\n🧪 Testing Check');
    
    try {
      // Check test coverage script
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts['test:coverage']) {
        this.passed.push('✅ Test coverage script available');
      }
      
      // Count test files
      try {
        const testFiles = execSync('find . -name "*.test.*" -not -path "./node_modules/*"', { encoding: 'utf8' });
        const testFileCount = testFiles.trim().split('\n').filter(Boolean).length;
        
        if (testFileCount > 0) {
          this.passed.push(`✅ ${testFileCount} test files found`);
        } else {
          this.issues.push('❌ No test files found');
        }
      } catch (error) {
        this.warnings.push('⚠️  Could not count test files');
      }
      
      // Check testing framework
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.jest || deps.mocha || deps.vitest) {
        this.passed.push('✅ Testing framework available');
      } else {
        this.issues.push('❌ No testing framework found');
      }
      
    } catch (error) {
      this.issues.push(`❌ Testing check failed: ${error.message}`);
    }
  }

  async checkDocumentation() {
    console.log('\n📚 Documentation Check');
    
    try {
      // Check README
      if (existsSync('README.md')) {
        const readme = readFileSync('README.md', 'utf8');
        const readmeSize = readme.length;
        
        if (readmeSize > 1000) {
          this.passed.push('✅ Comprehensive README found');
        } else {
          this.warnings.push('⚠️  README may need more detail');
        }
        
        // Check for key sections
        const requiredSections = ['Installation', 'Usage', 'API', 'Examples'];
        const foundSections = requiredSections.filter(section => 
          readme.toLowerCase().includes(section.toLowerCase())
        );
        
        if (foundSections.length >= 3) {
          this.passed.push(`✅ Documentation sections: ${foundSections.join(', ')}`);
        } else {
          this.recommendations.push(`🔧 Add missing sections: ${requiredSections.filter(s => !foundSections.includes(s)).join(', ')}`);
        }
      } else {
        this.issues.push('❌ README.md missing');
      }
      
      // Check for API documentation
      if (existsSync('docs/') || existsSync('API.md')) {
        this.passed.push('✅ API documentation available');
      } else {
        this.recommendations.push('🔧 Consider adding API documentation');
      }
      
    } catch (error) {
      this.warnings.push(`⚠️  Documentation check incomplete: ${error.message}`);
    }
  }

  async checkConfiguration() {
    console.log('\n⚙️  Configuration Check');
    
    try {
      // Check TypeScript config
      if (existsSync('tsconfig.json')) {
        const tsConfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'));
        
        if (tsConfig.compilerOptions.strict === true) {
          this.passed.push('✅ TypeScript strict mode enabled');
        } else {
          this.warnings.push('⚠️  TypeScript strict mode not enabled');
        }
        
        if (tsConfig.compilerOptions.declaration === true) {
          this.passed.push('✅ TypeScript declaration files enabled');
        }
      }
      
      // Check environment configuration
      if (existsSync('.env.example')) {
        this.passed.push('✅ Environment template available');
      }
      
      // Check for production environment variables
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts['start']) {
        this.passed.push('✅ Production start script available');
      }
      
    } catch (error) {
      this.warnings.push(`⚠️  Configuration check incomplete: ${error.message}`);
    }
  }

    async checkMonitoring() {
    console.log('\n📊 Monitoring Check');
    
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check logging
      if (deps.winston || deps.pino || deps.log4js) {
        this.passed.push('✅ Structured logging available');
      } else {
        this.recommendations.push('🔧 Consider adding structured logging');
      }
      
      // Check error handling
      if (deps.qerrors || deps.sentry || deps.bugsnag) {
        this.passed.push('✅ Error tracking available');
      } else {
        this.recommendations.push('🔧 Consider adding error tracking');
      }
      
      // Check health monitoring
      if (packageJson.scripts && packageJson.scripts.health) {
        this.passed.push('✅ Health check script available');
      } else {
        this.recommendations.push('🔧 Add health check script');
      }
      
    } catch (error) {
      this.warnings.push(`⚠️  Monitoring check incomplete: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📋 Production Readiness Report');
    console.log('================================');
    
    const totalIssues = this.issues.length;
    const totalWarnings = this.warnings.length;
    const totalRecommendations = this.recommendations.length;
    const totalPassed = this.passed.length;
    
    // Overall grade
    let grade, message;
    if (totalIssues === 0 && totalWarnings <= 2) {
      grade = 'A+';
      message = 'Excellent - Ready for production deployment';
    } else if (totalIssues === 0 && totalWarnings <= 5) {
      grade = 'A';
      message = 'Very Good - Production ready with minor improvements';
    } else if (totalIssues <= 2 && totalWarnings <= 8) {
      grade = 'B';
      message = 'Good - Production ready after addressing issues';
    } else if (totalIssues <= 5) {
      grade = 'C';
      message = 'Needs work - Address issues before production';
    } else {
      grade = 'D';
      message = 'Not ready - Significant work required';
    }
    
    console.log(`\n🎯 Overall Grade: ${grade}`);
    console.log(`   ${message}`);
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Issues: ${totalIssues}`);
    console.log(`   ⚠️  Warnings: ${totalWarnings}`);
    console.log(`   🔧 Recommendations: ${totalRecommendations}`);
    
    // Detailed output
    if (this.issues.length > 0) {
      console.log('\n❌ Critical Issues (Must Fix):');
      this.issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings (Should Address):');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n🔧 Recommendations (Nice to Have):');
      this.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    if (this.passed.length > 0) {
      console.log('\n✅ Passed Checks:');
      this.passed.slice(0, 10).forEach(passed => console.log(`   ${passed}`));
      if (this.passed.length > 10) {
        console.log(`   ... and ${this.passed.length - 10} more`);
      }
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      grade,
      message,
      summary: {
        passed: totalPassed,
        issues: totalIssues,
        warnings: totalWarnings,
        recommendations: totalRecommendations
      },
      details: {
        passed: this.passed,
        issues: this.issues,
        warnings: this.warnings,
        recommendations: this.recommendations
      },
      productionReady: totalIssues === 0 && totalWarnings <= 5
    };
    
    try {
      await fs.promises.writeFile(
        'production-audit-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log('\n📄 Detailed report saved to production-audit-report.json');
    } catch (error) {
      console.log('\n⚠️  Could not save detailed report');
    }
    
    // Exit code based on readiness
    if (totalIssues > 0) {
      console.log('\n❌ Project is NOT production ready');
      process.exit(1);
    } else if (totalWarnings > 5) {
      console.log('\n⚠️  Project is conditionally production ready');
      process.exit(2);
    } else {
      console.log('\n✅ Project is production ready!');
      process.exit(0);
    }
  }
}

// Run audit
async function main() {
  const audit = new ProductionAudit();
  
  try {
    await audit.runAudit();
  } catch (error) {
    console.error('\n💥 Production audit failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ProductionAudit };