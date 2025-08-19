const { qerrors } = require(`qerrors`); // error logger used by validation helpers for consistent reporting

/**
 * Test whether an object exposes a given method.
 *
 * PURPOSE: Safely verifies that an object provides a callable function before
 * invoking it elsewhere. This keeps calling code short with simple if checks.
 *
 * ASSUMPTIONS: obj may be anything (including proxies) so property access is
 * wrapped in a try/catch. Returning false on exceptions avoids crashing the
 * caller when an unexpected value is supplied.
 *
 * EDGE CASES: null objects or missing methods return false. Errors thrown by
 * property access are caught and logged via qerrors to aid debugging.
 *
 * @param {*} obj - Object to check
 * @param {string} methodName - Name of method to check for
 * @returns {boolean} True if object has method, false otherwise
 */
function hasMethod(obj, methodName) {
  try {
    return !!(obj && typeof obj[methodName] === `function`); // double negation guarantees true only when callable exists
  } catch (error) {
    qerrors(error, `hasMethod`, { obj: typeof obj, methodName }); // record unexpected property access failure
    return false; // fail closed so callers don't attempt to call missing method
  }
}

module.exports = hasMethod;