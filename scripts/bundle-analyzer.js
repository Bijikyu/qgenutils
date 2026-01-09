#!/usr/bin/env node

/**
 * Bundle Analyzer for QGenUtils
 *
 * Analyzes bundle size, complexity, and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';

class BundleAnalyzer {
  constructor(distPath = './dist') {
    this.distPath = distPath;
    this.stats = {
      totalSize: 0,
      fileCount: 0,
      largestFiles: [],
      categorySizes: {},
      complexity: {
        totalLines: 0,
        avgFileSize: 0
      },
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing QGenUtils Bundle...\n');

    // Get file stats
    await this.collectFileStats();

    // Analyze categories
    await this.analyzeCategories();

    // Generate recommendations
    await this.generateRecommendations();

    // Print results
    this.printResults();

    return this.stats;
  }

  async collectFileStats() {
    const files = await this.getAllJsFiles(this.distPath);

    for (const file of files) {
      const stats = fs.statSync(file);
      const size = stats.size;
      const relativePath = path.relative(this.distPath, file);

      this.stats.totalSize += size;
      this.stats.fileCount++;
      this.stats.largestFiles.push({
        path: relativePath,
        size: size,
        sizeKB: Math.round(size / 1024)
      });
    }

    // Sort largest files
    this.stats.largestFiles.sort((a, b) => b.size - a.size);
    this.stats.largestFiles = this.stats.largestFiles.slice(0, 10);

    this.stats.complexity.avgFileSize = Math.round(this.stats.totalSize / this.stats.fileCount);
  }

  async analyzeCategories() {
    const categories = {
      'validation': /validation/,
      'security': /security/,
      'performance': /performance/,
      'datetime': /datetime/,
      'middleware': /middleware/,
      'utilities': /helpers/,
      'legacy': /legacy/
    };

    for (const [category, pattern] of Object.entries(categories)) {
      const files = await this.getFilesByPattern(pattern);
      const size = files.reduce((total, file) => {
        return total + fs.statSync(path.join(this.distPath, file)).size;
      }, 0);

      this.stats.categorySizes[category] = {
        size,
        sizeKB: Math.round(size / 1024),
        fileCount: files.length
      };
    }
  }

  async generateRecommendations() {
    const totalKB = this.stats.totalSize / 1024;

    // Size recommendations
    if (totalKB > 500) {
      this.stats.recommendations.push({
        type: 'size',
        priority: 'high',
        message: `Bundle is ${Math.round(totalKB)}KB - Consider tree-shaking optimization`,
        solution: 'Use focused imports instead of full library imports'
      });
    }

    // Large file recommendations
    const largeFiles = this.stats.largestFiles.filter(f => f.sizeKB > 50);
    if (largeFiles.length > 0) {
      this.stats.recommendations.push({
        type: 'large_files',
        priority: 'medium',
        message: `${largeFiles.length} files over 50KB detected`,
        solution: 'Consider splitting large modules into smaller focused modules'
      });
    }

    // Category recommendations
    const largestCategory = Object.entries(this.stats.categorySizes)
      .sort(([,a], [,b]) => b.size - a.size)[0];

    if (largestCategory && largestCategory[1].sizeKB > 100) {
      this.stats.recommendations.push({
        type: 'category',
        priority: 'medium',
        message: `${largestCategory[0]} category is ${largestCategory[1].sizeKB}KB`,
        solution: `Consider modularizing ${largestCategory[0]} utilities further`
      });
    }
  }

  async getAllJsFiles(dir) {
    const files = [];

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  async getFilesByPattern(pattern) {
    const allFiles = await this.getAllJsFiles(this.distPath);
    return allFiles
      .map(file => path.relative(this.distPath, file))
      .filter(file => pattern.test(file));
  }

  printResults() {
    console.log('📊 Bundle Analysis Results');
    console.log('═'.repeat(50));

    console.log(`📦 Total Size: ${Math.round(this.stats.totalSize / 1024)}KB`);
    console.log(`📄 Total Files: ${this.stats.fileCount}`);
    console.log(`📏 Average File Size: ${Math.round(this.stats.complexity.avgFileSize / 1024)}KB\n`);

    console.log('📈 Largest Files:');
    this.stats.largestFiles.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.path} (${file.sizeKB}KB)`);
    });

    console.log('\n📂 Category Breakdown:');
    Object.entries(this.stats.categorySizes)
      .sort(([,a], [,b]) => b.size - a.size)
      .forEach(([category, stats]) => {
        const percentage = Math.round((stats.size / this.stats.totalSize) * 100);
        console.log(`  ${category}: ${stats.sizeKB}KB (${percentage}% of total)`);
      });

    console.log('\n💡 Recommendations:');
    this.stats.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' :
        rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${index + 1}. ${priority} ${rec.message}`);
      console.log(`     💊 ${rec.solution}`);
    });

    console.log('\n' + '═'.repeat(50));
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze()
    .then(results => {
      console.log('\n✅ Bundle analysis completed');

      // Write results to file
      fs.writeFileSync(
        path.join(process.cwd(), 'bundle-analysis.json'),
        JSON.stringify(results, null, 2)
      );
      console.log('📁 Detailed results saved to bundle-analysis.json');
    })
    .catch(error => {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    });
}

export default BundleAnalyzer;
