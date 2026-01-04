/**
 * Throttle utility - lodash.throttle wrapper
 * 
 * PURPOSE: Provides function throttling using lodash's well-tested
 * implementation. This eliminates redundant code while maintaining
 * the same API for existing consumers.
 * 
 * @param fn - Function to throttle
 * @param delay - Delay in milliseconds
 * @param options - Throttle options
 * @returns Throttled function
 */

import _ from'lodash';const throttle=(fn:(...args:any[])=>any,delay:number,options?:any):((...args:any[])=>any)=>_.throttle(fn,delay,options);

export default throttle;