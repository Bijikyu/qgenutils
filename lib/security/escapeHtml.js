/**
 * HTML entity escaping function for content safety.
 *
 * PURPOSE: Prevents XSS attacks and HTML rendering issues by converting
 * dangerous characters to safe HTML entities. Unlike sanitizeHtml which
 * removes tags, this preserves content by encoding it safely.
 *
 * ENTITIES ESCAPED:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#039;
 *
 * DEPENDENCY INJECTION: Accepts optional sanitizeString function for
 * pre-processing (e.g., stripping existing HTML before escaping).
 *
 * @param {object} options - Configuration object
 * @param {object} options.data - Data object containing text to escape
 * @param {string} options.data.text - Text payload to escape
 * @param {object} [options.dependencies] - Optional dependencies
 * @param {function} [options.dependencies.sanitizeString] - Optional pre-sanitizer
 * @returns {{ result: { value: string }}} Escaped HTML in result wrapper
 */

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};

const ENTITY_PATTERN = /[&<>"']/g;

function escapeHtml({ data, dependencies }) {
  const text = data?.text;
  const rawText = typeof text === 'string' ? text : String(text ?? '');
  
  const sanitizedCopy = dependencies?.sanitizeString
    ? dependencies.sanitizeString(rawText)
    : rawText;
  
  const escapedValue = sanitizedCopy.replace(ENTITY_PATTERN, char => HTML_ENTITIES[char]);
  
  return { result: { value: escapedValue } };
}

module.exports = escapeHtml;
