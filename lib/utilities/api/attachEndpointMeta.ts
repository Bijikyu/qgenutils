/**
 * Attach endpoint metadata to a function for introspection.
 *
 * PURPOSE: Enables API discovery by attaching metadata directly to
 * handler functions, making routes self-documenting.
 *
 * @param {function} fn - Function to attach metadata to
 * @param {object} opts - Endpoint metadata options
 */

import buildEndpointMeta from './buildEndpointMeta.js';

const attachEndpointMeta = (fn: any, opts: any): any => {
  if (typeof fn !== 'function') {
    return () => {};
  }
  fn.meta = buildEndpointMeta(opts);
  return fn;
};

export default attachEndpointMeta;
