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

const attachEndpointMeta = (fn, opts) => {
  typeof fn !== 'function' && (() => {})();
  fn.meta = buildEndpointMeta(opts);
};

module.exports = attachEndpointMeta;
