'use strict';

const SUPPORTED_PLANS: any = ['basic', 'premium', 'enterprise', 'trial']; // supported subscription plans

/**
 * Validate subscription plan identifier and availability
 * @param {string} planId - Subscription plan identifier (case-insensitive)
 * @returns {boolean} True if plan is valid and supported, false otherwise
 * @example
 * validateSubscriptionPlan('basic') // returns true
 * validateSubscriptionPlan('PREMIUM') // returns true (normalized)
 * validateSubscriptionPlan('unknown') // returns false
 */
function validateSubscriptionPlan(planId) { // comprehensive subscription plan validation
  if (!planId || typeof planId !== 'string') { // check for plan ID presence and string type
    return false; // invalid input rejection
  }

  const normalizedPlan: any = planId.toLowerCase().trim(); // normalize plan format for comparison

  return SUPPORTED_PLANS.includes(normalizedPlan); // validate against supported plans
}

export default validateSubscriptionPlan;
