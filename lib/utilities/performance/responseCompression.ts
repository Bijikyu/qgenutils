/**
 * Request/Response Compression Utility
 * 
 * PURPOSE: Provides compression optimization for API requests and responses
 * to reduce bandwidth usage and improve transfer speeds for scalable systems.
 * 
 * COMPRESSION FEATURES:
 * - Gzip/Brotli compression support
 * - Configurable compression thresholds
 * - Automatic content negotiation
 * - Performance monitoring and metrics
 * - Adaptive compression based on content type
 */

import { createGzip, createBrotliCompress } from 'zlib';
import { promisify } from 'util';

interface CompressionOptions {
  enabled?: boolean;
  algorithm?: 'gzip' | 'brotli' | 'auto';
  threshold?: number; // Minimum size to compress
  level?: number; // Compression level (1-9)
  excludeTypes?: string[]; // MIME types to exclude
}

interface CompressionMetrics {
  totalRequests: number;
  compressedResponses: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  averageLatency: number;
}

interface CompressionResult {
  compressed: boolean;
  data: Buffer;
  algorithm?: string;
  originalSize: number;
  compressedSize: number;
  compressionTime: number;
}

class ResponseCompressor {
  private options: Required<CompressionOptions>;
  private metrics: CompressionMetrics;

  constructor(options: CompressionOptions = {}) {
    this.options = {
      enabled: options.enabled !== false,
      algorithm: options.algorithm || 'auto',
      threshold: options.threshold || 1024, // 1KB default
      level: options.level || 6,
      excludeTypes: options.excludeTypes || [
        'application/octet-stream',
        'video/*',
        'audio/*',
        'image/*',
        'application/zip',
        'application/gzip'
      ]
    };

    this.metrics = {
      totalRequests: 0,
      compressedResponses: 0,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      averageLatency: 0
    };
  }

  /**
   * Compress response data based on request capabilities
   */
  async compressResponse(
    data: Buffer | string,
    contentType: string,
    acceptEncoding?: string
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    // Check if compression should be applied
    if (!this.shouldCompress(data, contentType, acceptEncoding)) {
      return {
        compressed: false,
        data: typeof data === 'string' ? Buffer.from(data) : data,
        originalSize: data.length,
        compressedSize: data.length,
        compressionTime: 0
      };
    }

    try {
      const inputData = typeof data === 'string' ? Buffer.from(data) : data;
      const originalSize = inputData.length;
      
      // Choose best compression algorithm
      const algorithm = this.selectAlgorithm(acceptEncoding);
      const compressedData = await this.compressWithAlgorithm(inputData, algorithm);
      
      const compressionTime = Date.now() - startTime;
      
      // Update metrics
      this.updateMetrics(originalSize, compressedData.length, compressionTime);
      
      return {
        compressed: true,
        data: compressedData,
        algorithm,
        originalSize,
        compressedSize: compressedData.length,
        compressionTime
      };
      
    } catch (error) {
      // Return uncompressed data on compression error
      return {
        compressed: false,
        data: typeof data === 'string' ? Buffer.from(data) : data,
        originalSize: data.length,
        compressedSize: data.length,
        compressionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Decompress request data
   */
  async decompressRequest(
    data: Buffer,
    contentEncoding: string
  ): Promise<Buffer> {
    if (!contentEncoding) {
      return data;
    }

    try {
      switch (contentEncoding.toLowerCase()) {
        case 'gzip':
          return await this.decompressGzip(data);
        case 'br':
        case 'brotli':
          return await this.decompressBrotli(data);
        case 'deflate':
          return await this.decompressDeflate(data);
        default:
          return data;
      }
    } catch (error) {
      // Return original data on decompression error
      return data;
    }
  }

  /**
   * Determine if data should be compressed
   */
  private shouldCompress(
    data: Buffer | string,
    contentType: string,
    acceptEncoding?: string
  ): boolean {
    // Check if compression is enabled
    if (!this.options.enabled) {
      return false;
    }

    // Check size threshold
    const dataSize = typeof data === 'string' ? data.length : data.length;
    if (dataSize < this.options.threshold) {
      return false;
    }

    // Check excluded content types
    if (this.options.excludeTypes.some(type => contentType.includes(type))) {
      return false;
    }

    // Check client support
    if (!acceptEncoding || !this.supportsCompression(acceptEncoding)) {
      return false;
    }

    return true;
  }

  /**
   * Select best compression algorithm based on client support
   */
  private selectAlgorithm(acceptEncoding?: string): 'gzip' | 'brotli' {
    if (!acceptEncoding) {
      return this.options.algorithm === 'auto' ? 'brotli' : this.options.algorithm;
    }

    const encodings = acceptEncoding.split(',').map(e => e.trim().split(';')[0]);
    
    // Check for Brotli support (preferred)
    if (encodings.includes('br') || encodings.includes('brotli')) {
      return 'brotli';
    }
    
    // Check for Gzip support
    if (encodings.includes('gzip') || encodings.includes('deflate')) {
      return 'gzip';
    }
    
    // Default based on configuration
    return this.options.algorithm === 'auto' ? 'gzip' : this.options.algorithm;
  }

  /**
   * Check if client supports compression
   */
  private supportsCompression(acceptEncoding: string): boolean {
    const encodings = acceptEncoding.toLowerCase().split(',').map(e => e.trim());
    return encodings.some(encoding => 
      encoding === 'gzip' || 
      encoding === 'deflate' || 
      encoding === 'br' || 
      encoding === 'brotli' ||
      encoding === '*'
    );
  }

  /**
   * Compress data with specified algorithm
   */
  private async compressWithAlgorithm(
    data: Buffer, 
    algorithm: 'gzip' | 'brotli'
  ): Promise<Buffer> {
    switch (algorithm) {
      case 'brotli':
        return this.compressBrotli(data);
      case 'gzip':
      default:
        return this.compressGzip(data);
    }
  }

  /**
   * Compress with Brotli (using promisify for compatibility)
   */
  private async compressBrotli(data: Buffer): Promise<Buffer> {
    const { brotliCompress } = await import('zlib');
    const brotliCompressAsync = promisify(brotliCompress);
    
    try {
      return await brotliCompressAsync(data, {
        params: {
          [this.options.level]: true
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compress with Gzip (using stream API for compatibility)
   */
  private async compressGzip(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { createGzip } = require('zlib');
      const gzip = createGzip({ level: this.options.level });
      
      const chunks: Buffer[] = [];
      gzip.on('data', (chunk) => chunks.push(chunk));
      gzip.on('end', () => resolve(Buffer.concat(chunks)));
      gzip.on('error', reject);
      gzip.end(data);
    });
  }

  /**
   * Decompress Gzip data (using stream API for compatibility)
   */
  private async decompressGzip(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { createGunzip } = require('zlib');
      const gunzip = createGunzip();
      
      const chunks: Buffer[] = [];
      gunzip.on('data', (chunk) => chunks.push(chunk));
      gunzip.on('end', () => resolve(Buffer.concat(chunks)));
      gunzip.on('error', reject);
      gunzip.write(data);
      gunzip.end();
    });
  }

  /**
   * Decompress Brotli data (using stream API for compatibility)
   */
  private async decompressBrotli(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { createBrotliDecompress } = require('zlib');
      const brotli = createBrotliDecompress();
      
      const chunks: Buffer[] = [];
      brotli.on('data', (chunk) => chunks.push(chunk));
      brotli.on('end', () => resolve(Buffer.concat(chunks)));
      brotli.on('error', reject);
      brotli.write(data);
      brotli.end();
    });
  }

  /**
   * Decompress Deflate data (using stream API for compatibility)
   */
  private async decompressDeflate(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { createInflate } = require('zlib');
      const inflate = createInflate();
      
      const chunks: Buffer[] = [];
      inflate.on('data', (chunk) => chunks.push(chunk));
      inflate.on('end', () => resolve(Buffer.concat(chunks)));
      inflate.on('error', reject);
      inflate.write(data);
      inflate.end();
    });
  }

  /**
   * Update compression metrics
   */
  private updateMetrics(originalSize: number, compressedSize: number, latency: number): void {
    this.metrics.compressedResponses++;
    this.metrics.originalSize += originalSize;
    this.metrics.compressedSize += compressedSize;
    
    // Update compression ratio
    this.metrics.compressionRatio = this.metrics.originalSize > 0 
      ? (this.metrics.originalSize - this.metrics.compressedSize) / this.metrics.originalSize 
      : 0;
    
    // Update average latency
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.compressedResponses - 1) + latency) / this.metrics.compressedResponses;
  }

  /**
   * Get compression metrics
   */
  getMetrics(): CompressionMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      compressedResponses: 0,
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      averageLatency: 0
    };
  }

  /**
   * Get appropriate content encoding header
   */
  getContentEncoding(algorithm?: string): string {
    switch (algorithm) {
      case 'brotli':
        return 'br';
      case 'gzip':
        return 'gzip';
      default:
        return 'gzip'; // Default to gzip
    }
  }
}

// Create global compressor instance
const responseCompressor = new ResponseCompressor();

export default responseCompressor;
export type { 
  CompressionOptions, 
  CompressionMetrics, 
  CompressionResult 
};