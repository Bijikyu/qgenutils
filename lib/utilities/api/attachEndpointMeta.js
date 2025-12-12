/**
 * Attach endpoint metadata to a function for introspection.
 *
 * PURPOSE: Enables API discovery by attaching metadata directly to
 * handler functions, making routes self-documenting.
 *
 * @param {function} fn - Function to attach metadata to
 * @param {object} opts - Endpoint metadata options
 */

const buildEndpointMeta = require('./buildEndpointMeta');

function attachEndpointMeta(fn, opts) {
  if (typeof fn !== 'function') {
    return;
  }
  fn.meta = buildEndpointMeta(opts);
}

module.exports = attachEndpointMeta;
