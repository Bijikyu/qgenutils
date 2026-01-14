/**
 * Browser Image Compression Utility
 *
 * PURPOSE: Compress images client-side using Canvas API before upload.
 * Reduces bandwidth usage and storage costs while maintaining acceptable
 * visual quality through intelligent compression settings.
 *
 * IMPLEMENTATION FEATURES:
 * - Adaptive Quality: Compression settings based on file size
 * - Aspect Ratio Preservation: Maintains original proportions during resize
 * - Memory Management: Cleans up object URLs to prevent leaks
 * - Size Threshold: Skips compression for files under 1MB
 * - Environment Detection: Checks for Canvas API availability
 *
 * BROWSER ONLY: This utility requires DOM APIs (Canvas, Image, Blob)
 * and will not work in Node.js environments.
 *
 * @module file/imageCompressor
 */

export interface CompressionSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
}

class ImageCompressor {
  /**
   * Compress an image file using Canvas API.
   *
   * @param file - Image file to compress
   * @param quality - JPEG/WebP quality (0-1), default 0.8
   * @param maxWidth - Maximum output width, default 1920
   * @param maxHeight - Maximum output height, default 1080
   * @returns Compressed file (or original if under 1MB)
   *
   * @example
   * const compressed = await ImageCompressor.compressImage(file);
   * const custom = await ImageCompressor.compressImage(file, 0.7, 1280, 720);
   */
  static async compressImage(
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      if (file.size < 1024 * 1024) {
        resolve(file);
        return;
      }

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxWidth;
              height = Math.round(maxWidth / aspectRatio);
            } else {
              height = maxHeight;
              width = Math.round(maxHeight * aspectRatio);
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (!ctx) {
            reject(new Error('Canvas context lost during processing'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });

              const originalMB = (file.size / 1024 / 1024).toFixed(2);
              const compressedMB = (compressedFile.size / 1024 / 1024).toFixed(2);
              const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

              console.log(
                `[ImageCompressor] Compressed ${file.name}: ${originalMB}MB → ${compressedMB}MB (${reduction}% reduction)`
              );

              resolve(compressedFile);
            },
            file.type,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.addEventListener(
        'load',
        () => {
          URL.revokeObjectURL(objectUrl);
        },
        { once: true }
      );
    });
  }

  /**
   * Get recommended compression settings based on file size.
   *
   * @param fileSize - File size in bytes
   * @returns Compression settings object
   *
   * @example
   * const settings = ImageCompressor.getCompressionSettings(file.size);
   * const compressed = await ImageCompressor.compressImage(
   *   file,
   *   settings.quality,
   *   settings.maxWidth,
   *   settings.maxHeight
   * );
   */
  static getCompressionSettings(fileSize: number): CompressionSettings {
    if (fileSize > 8 * 1024 * 1024) {
      return { quality: 0.6, maxWidth: 1280, maxHeight: 720 };
    } else if (fileSize > 4 * 1024 * 1024) {
      return { quality: 0.7, maxWidth: 1600, maxHeight: 900 };
    } else if (fileSize > 2 * 1024 * 1024) {
      return { quality: 0.8, maxWidth: 1920, maxHeight: 1080 };
    } else {
      return { quality: 0.9, maxWidth: 2560, maxHeight: 1440 };
    }
  }

  /**
   * Check if image compression is supported in the current environment.
   *
   * @returns true if Canvas API is available
   */
  static isCompressionSupported(): boolean {
    return (
      typeof document !== 'undefined' &&
      typeof CanvasRenderingContext2D !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined'
    );
  }
}

export default ImageCompressor;
export { ImageCompressor };
