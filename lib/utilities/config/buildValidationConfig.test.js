const buildValidationConfig = require('./buildValidationConfig');

describe('buildValidationConfig', () => {
  it('should build config with defaults', () => {
    const config = buildValidationConfig();
    
    expect(config.strictMode).toBe(true);
    expect(config.sanitization.html).toBe(true);
    expect(config.sanitization.xss).toBe(true);
    expect(config.sanitization.sqlInjection).toBe(true);
    expect(config.sanitization.nosqlInjection).toBe(false);
    expect(config.limits.maxFieldLength).toBe(1000);
    expect(config.limits.maxFileSize).toBe(5 * 1024 * 1024);
    expect(config.limits.maxArrayLength).toBe(1000);
    expect(config.limits.maxObjectDepth).toBe(10);
    expect(config.allowedContent.htmlTags).toEqual([]);
    expect(config.localization).toBe('en');
    expect(config.dateFormat).toBe('YYYY-MM-DD');
    expect(config.timezone).toBe('UTC');
  });

  it('should validate max field length', () => {
    expect(() => buildValidationConfig({ maxFieldLength: 0 })).toThrow('Max field length must be positive');
    expect(() => buildValidationConfig({ maxFieldLength: -100 })).toThrow('Max field length must be positive');
  });

  it('should build config with custom values', () => {
    const config = buildValidationConfig({
      strictMode: false,
      sanitizeHtml: false,
      maxFieldLength: 5000,
      maxFileSize: 10 * 1024 * 1024,
      allowedTags: ['p', 'br', 'strong'],
      allowedAttributes: { a: ['href'] },
      customValidators: { email: () => true },
      errorMessages: { required: 'This field is required' },
      localization: 'es',
      dateFormat: 'DD/MM/YYYY',
      timezone: 'America/New_York'
    });
    
    expect(config.strictMode).toBe(false);
    expect(config.sanitization.html).toBe(false);
    expect(config.limits.maxFieldLength).toBe(5000);
    expect(config.limits.maxFileSize).toBe(10 * 1024 * 1024);
    expect(config.allowedContent.htmlTags).toEqual(['p', 'br', 'strong']);
    expect(config.allowedContent.htmlAttributes).toEqual({ a: ['href'] });
    expect(config.customValidators).toHaveProperty('email');
    expect(config.errorMessages.required).toBe('This field is required');
    expect(config.localization).toBe('es');
    expect(config.dateFormat).toBe('DD/MM/YYYY');
    expect(config.timezone).toBe('America/New_York');
  });

  it('should handle allowed file types and mime types', () => {
    const config = buildValidationConfig({
      allowedFileTypes: ['.pdf', '.docx'],
      allowedMimeTypes: ['application/pdf']
    });
    
    expect(config.allowedContent.fileTypes).toEqual(['.pdf', '.docx']);
    expect(config.allowedContent.mimeTypes).toEqual(['application/pdf']);
  });
});
