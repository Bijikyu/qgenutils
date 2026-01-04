/**
 * Email Validation - Direct validator.isEmail() wrapper
 * 
 * PURPOSE: Provides email validation using the validator library's RFC 5322
 * compliant implementation. This simplified wrapper maintains the existing
 * API while eliminating redundant code.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */

import validator from'validator';const validateEmail=(email:any):boolean=>{if(!email||typeof email!=='string')return false;const trimmedEmail=email.trim();return trimmedEmail.length>0&&validator.isEmail(trimmedEmail);};export default validateEmail;export{validateEmail as validateEmailFormat};