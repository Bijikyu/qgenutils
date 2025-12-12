const escapeHtml = require('./escapeHtml');

describe('escapeHtml', () => {
  it('should escape ampersand', () => {
    const result = escapeHtml({ data: { text: 'Save & Enjoy' } });
    expect(result.result.value).toBe('Save &amp; Enjoy');
  });

  it('should escape less than and greater than', () => {
    const result = escapeHtml({ data: { text: '<script>alert("xss")</script>' } });
    expect(result.result.value).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should escape quotes', () => {
    const result = escapeHtml({ data: { text: 'He said "hello"' } });
    expect(result.result.value).toBe('He said &quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    const result = escapeHtml({ data: { text: "It's working" } });
    expect(result.result.value).toBe('It&#039;s working');
  });

  it('should escape all entities in complex input', () => {
    const result = escapeHtml({ 
      data: { text: `<span class="promo">Save & Enjoy > 50% off!</span>` } 
    });
    expect(result.result.value).toBe(
      '&lt;span class=&quot;promo&quot;&gt;Save &amp; Enjoy &gt; 50% off!&lt;/span&gt;'
    );
  });

  it('should handle null/undefined text', () => {
    expect(escapeHtml({ data: { text: null } }).result.value).toBe('');
    expect(escapeHtml({ data: { text: undefined } }).result.value).toBe('');
  });

  it('should convert non-string to string', () => {
    const result = escapeHtml({ data: { text: 123 } });
    expect(result.result.value).toBe('123');
  });

  it('should use sanitizeString dependency when provided', () => {
    const stripTags = (value) => String(value ?? '').replace(/<\/?[^>]+>/g, '');
    const result = escapeHtml({
      data: { text: '<b>Bold</b> & <i>Italic</i>' },
      dependencies: { sanitizeString: stripTags }
    });
    expect(result.result.value).toBe('Bold &amp; Italic');
  });

  it('should handle empty string', () => {
    const result = escapeHtml({ data: { text: '' } });
    expect(result.result.value).toBe('');
  });

  it('should preserve safe characters', () => {
    const result = escapeHtml({ data: { text: 'Hello World 123!' } });
    expect(result.result.value).toBe('Hello World 123!');
  });
});
