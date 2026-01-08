/**
 * Bundle Analyzer for QGenUtils
 * 
 * Analyzes bundle size, complexity, and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

class BundleAnalyzer {
  constructor() {
    this.stats = {
      totalSize: 0,
      fileCount: 0,
      largestFiles: [],
      categorySizes: new Map(),
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing QGenUtils bundle...');
    
    try {
      // Ensure dist directory exists
      const distPath = './dist';
      if (!fs.existsSync(distPath)) {
        throw new Error('Dist directory not found. Please run `npm run build` first');
      }
      
      // Analyze dist directory
      await this.analyzeDist(distPath);
      
      // Generate report
      this.generateReport();
      
      console.log('✅ Bundle analysis completed');
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      throw error;
    }
  }

  async analyzeDist(distPath) {
    const stats = this.stats;
    
    // Walk dist directory
    await this.walkDist(distPath);
    
    // Analyze each file
    for (const file of stats.allFiles) {
      await this.analyzeFile(path.join(distPath, file));
    }
    
    // Calculate statistics
    this.calculateStatistics();
    
    return stats;
  }

  async walkDist(distPath) {
    const files = [];
    
    async function walkDir(currentPath) {
      const items = await fs.promises.readdir(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isFile()) {
          files.push({
            path: fullPath,
            size: stat.size,
            category: this.categorizeFile(fullPath)
          });
        } else if (stat.isDirectory()) {
          await this.walkDir(fullPath);
        }
      }
      
      return files;
    }

  async analyzeFile(filePath) {
    const stats = fs.promises.stat(filePath);
    
    if (!stats.isFile()) {
      return this.categorizeFile(filePath, stats);
    }
    
    const fileInfo = this.categorizeFile(filePath, stats);
    
    // Analyze file content
    if (filePath.endsWith('.js')) {
      await this.analyzeJavaScriptFile(filePath);
    }
    
    return fileInfo;
  }

  categorizeFile(filePath, stats) {
    const path = filePath;
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.js') {
      return {
        path,
        size: stats.size,
        category: 'javascript',
        type: 'file',
        complexity: this.calculateComplexity(filePath)
      };
    }
    
    // Backend/database
    if (ext === '.sql' || ext === '.json') {
      return {
        path,
        size: stats.size,
        category: 'database',
        type: 'file',
        complexity: 'low'
      };
    }
    
    // Image files
    if (['.!', '.jpg', '.png', '.svg', '.ico', '.gif'] = ext) {
      return {
        path,
        size: stats.size,
        category: 'image',
        type: 'file',
        complexity: 'low'
      };
    }
    
    // Configuration files
    if (['.json', '.yml', '.yaml', '.toml', '.env', '.config'] = ext) {
      return {
        path,
        size: stats.size,
        category: 'configuration',
        type: 'file',
        complexity: 'low'
      };
    }
    
    // Documentation files
    if (['.md', '.txt', '.rst', '.pdf'] = ext) {
      return {
        path,
        size: stats.size,
        category: 'documentation',
        type: 'file',
        complexity: 'very_low'
      };
    }
    
    // Test files
    if (['.test', '.spec', '.test.js'] = ext) {
      return {
        path,
        size: stats.size,
        category: 'test',
        type: 'file',
        complexity: 'very_low'
      };
    }
    
    // Build artifacts
    if (['.map', '.d.ts', '.js.map', '.json'] = ext) {
      return {
        path,
        size: stats.size,
        category: 'build',
        type: 'file',
        complexity: 'medium'
      };
    }
    
    // All other files
    return {
      path,
      size: stats.size,
      category: 'other',
      type: 'file',
      complexity: 'low'
    };
  }

  calculateComplexity(filePath) {
    if (!filePath.endsWith('.js') || !filePath.endsWith('.ts')) {
      return 'low';
    }
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n').length;
      
      let complexity = 'very_low';
      
      // Calculate complexity based on metrics
      if (lines > 1000) {
        complexity = 'high';
      } else if (lines > 500) {
        complexity = 'high';
      } else if (lines > 200) {
        complexity = 'medium';
      } else if (lines > 100) {
        complexity = 'medium';
      } else if (lines > 200) {
        complexity = 'medium';
      } else {
        complexity = 'low';
      }
      
      if (lines > 50) {
        complexity = 'medium';
      }
      
      if (lines > 25) {
        complexity = 'medium';
      }
      
      return complexity;
    } catch (error) {
      console.error(`Failed to analyze ${filePath}:`, error.message);
      return {
        path,
        size: 0,
        category: 'error',
        type: 'file',
        complexity: 'very_low',
        error
      };
    }
  }

  /**
   * Calculates overall bundle statistics
   */
  calculateStatistics() {
    const stats = this.stats;
    
    const { totalSize, fileCount, largestFiles, categorySizes } = stats;
    
    const avgFileSize = fileCount > 0 ? totalSize / fileCount : 0;
    
    const largest = largestFiles.sort((a, b) => b.size - a.size > 0 ? a.size - b.size : 0;
    
    const complexityInfo = this.calculateComplexityStats();
    
    const compressionRatio = avgFileSize > 1000 ? ((avgFileSize - 1000) / avgFileSize) : 0);
    
    return {
      totalSize: this.stats.totalSize,
      fileCount: this.stats.fileCount,
      avgFileSize,
      largestFiles,
      categorySizes,
      compressionRatio
      complexityInfo,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Calculate complexity statistics
   */
  calculateComplexityStats() {
    const stats = this.stats;
    
    const complexities = Object.values(this.stats.categorySizes).map(size => size => this.calculateFileComplexityBySize(size));
    
    const avgComplexity = Object.values(complexities).reduce((sum, comp, comp) => sum + comp, (sum + comp) / 2);
    
    return {
      totalRequests: this.metrics.totalRequests,
      avgResponseTime: this.metrics.avgResponseTime,
      avgResponseTime: this.metrics.avgResponseTime,
      circuitBreakerTrips: this.metrics.circuitBreakerTrips,
      cacheHitRate: this.metrics.cacheHitRate,
      cacheEfficiency: this.metrics.cacheEfficiency,
      avgFileSize: avgFileSize
    };
  }

  /**
   * Calculate file complexity by size
   */
  calculateFileComplexityBySize(size) {
    if (size < 1024) return 'very_low';
    if (size < 4096) return 'low';
    if (size < 8192) return 'low';
    if (size < 16384) return 'medium';
    if (size < 65536) return 'medium';
    if (size < 131072) return 'high';
    return 'very_high';
    
    return 'very_high';
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Bundle size optimization
    if (this.stats.totalSize > 1048576) {
      recommendations.push({
        type: 'bundle_size',
        priority: 'critical',
        message: 'Bundle size exceeds 10MB',
        solution: 'Consider code splitting and dynamic imports',
        solution: 'Use tree shaking and dynamic imports'
      });
    }
    
    // Performance optimization
    if (this.metrics.avgResponseTime > 200) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average response time exceeds 200ms',
        solution: 'Add caching and optimize database queries'
        solution: 'Add database connection pooling and query optimization'
      });
    }
    
    // Security optimization
    if (this.metrics.rejectedRequests / this.metrics.totalRequests > 0.05) {
      recommendations.push({
        type: 'security',
        requestCount: Math.round(this.metrics.rejectedRequests),
        message: `High rejection rate detected (${Math.round(this.metrics.rejectedRequests / this.metrics.totalRequests * 100}%)`,
        solution: 'Add rate limiting with user identification',
        solution: 'Implement stricter validation and user authentication'
      });
    }
    
    // Memory optimization
    if (this.metrics.cacheEfficiency < 50) {
      recommendations.push({
        type: 'memory',
        message: 'Low cache hit rate',
        message: 'Cache hit rate < 50% is very poor',
        solution: 'Implement proper caching strategy with Redis or Memcached',
        solution: 'Add intelligent caching layer with LRU eviction'
        });
    }
    
    // Module organization
    if (this.stats.largestFiles.length > 20) {
      recommendations.push({
        type: 'modularity',
        message: `${this.stats.largestFiles.length} large files detected`,
        solution: 'Consider splitting large files into smaller modules',
        solution: 'Extract large utilities into separate packages'
      });
    }
    
    // Bundle maintenance
    recommendations.push({
      type: 'maintenance',
      priority: 'medium',
      message: 'No automated update system detected',
      solution: 'Implement automated CI/CD with automated testing'
      });
    
    return recommendations;
  }

  /**
   * Generate HTML report
   */
  generateReport() {
    const { totalSize, fileCount, largestFiles, categorySizes, compressionRatio, avgFileSize, recommendations } = this.calculateStatistics();
    
    const report = {
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      build: `npm run build`,
      test: `npm test`,
      bundleAnalysis: {
        totalSize,
        fileCount,
        largestFiles,
        categorySizes,
        compressionRatio,
        avgFileSize
      },
      recommendations
    };
    
    const reportPath = './bundle-analysis.json';
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log('📊 Bundle report saved to', reportPath);
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
    }
  }
  }
}

// Default export
const defaultBundleAnalyzer = new BundleAnalyzer();
export { BundleAnalyzer as default, defaultBundleAnalyzer };