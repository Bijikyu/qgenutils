/**
 * Ensure URL Has HTTPS Protocol for Security-First URL Processing
 * 
 * RATIONALE: User-provided URLs often lack protocols, which can lead to:
 * - Relative URL interpretation instead of absolute URLs
 * - Insecure HTTP connections when HTTPS was intended
 * - Inconsistent URL handling across the application
 * - Security vulnerabilities from protocol-relative URLs
 * 
 * IMPLEMENTATION STRATEGY:
 * - Default to HTTPS for security (fail-secure approach)
 * - Use native URL API for robust URL parsing and validation
 * - Preserve existing protocols when explicitly specified
 * - Normalize protocol format using URL API
 * - Handle edge cases like protocol-relative URLs (//example.com)
 * 
 * SECURITY CONSIDERATIONS:
 * - HTTPS-first approach protects user data in transit
 * - Prevents accidental downgrade to HTTP
 * - Uses native URL API to prevent parsing vulnerabilities
 * - Validates URL structure using built-in URL validation
 * 
 * PROTOCOL HANDLING RULES:
 * - No protocol: Add https://
 * - HTTP protocol: Preserve as-is (don't force upgrade)
 * - HTTPS protocol: Preserve as-is
 * - Protocol-relative (//): Add https: prefix
 * - Invalid protocols: Default to https://
 * 
 * @param {string} url - URL string that may or may not have a protocol
 * @returns {string} URL with protocol ensured (defaults to https://)
 * @throws Never throws - returns safe fallback URL on any error
 */

import{qerrors}from'qerrors';import logger from'../../logger.js';import isValidString from'../helpers/isValidString.js';const ensureProtocol=(url:any):any=>{logger.debug(`ensureProtocol processing URL`,{inputUrl:url});try{if(!isValidString(url)){logger.warn(`ensureProtocol received invalid URL input`,{url,type:typeof url});return`https://`;}const trimmedUrl=url.trim();if(trimmedUrl===``){logger.debug(`ensureProtocol: empty URL after trimming`);return`https://`;}if(trimmedUrl.startsWith(`//`)){const httpsUrl=`https:`+trimmedUrl;logger.debug(`ensureProtocol: converted protocol-relative URL`,{original:trimmedUrl,result:httpsUrl});return httpsUrl;}try{const parsedUrl=new URL(trimmedUrl);const validProtocols=['http:','https:','ftp:','ftps:'];if(validProtocols.includes(parsedUrl.protocol)){const normalizedUrl=parsedUrl.toString();logger.debug(`ensureProtocol: preserved existing valid protocol using URL API`,{original:trimmedUrl,normalized:normalizedUrl});return normalizedUrl;}logger.warn(`ensureProtocol: unknown protocol detected, defaulting to HTTPS`,{originalProtocol:parsedUrl.protocol,url:trimmedUrl});const httpsUrl=`https://`+(parsedUrl.hostname||parsedUrl.host||'')+(parsedUrl.pathname||'')+(parsedUrl.search||'')+(parsedUrl.hash||'');return httpsUrl;}catch(urlError){if(trimmedUrl.includes('://')){logger.warn(`ensureProtocol: invalid URL with protocol detected, defaulting to HTTPS`,{url:trimmedUrl});return`https://`;}const httpsUrl=`https://`+trimmedUrl;logger.debug(`ensureProtocol: added HTTPS protocol (no existing protocol)`,{original:trimmedUrl,result:httpsUrl});return httpsUrl;}}catch(error){qerrors(error,`ensureProtocol`);logger.error(`ensureProtocol failed with error`,{error:error instanceof Error?error.message:String(error),inputUrl:url});return`https://`;}};

export default ensureProtocol;