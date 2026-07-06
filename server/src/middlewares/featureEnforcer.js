const PLAN_LIMITS = require('../config/plans');

/**
 * Middleware to enforce plan feature restrictions.
 * @param {string} featureName - The name of the feature to check against the tenant's plan.
 */
const requireFeature = (featureName) => {
  return (req, res, next) => {
    // Fallback to 'starter' if plan is somehow missing
    const tenantPlan = req.tenant?.plan || 'starter';
    const planLimits = PLAN_LIMITS[tenantPlan];

    if (!planLimits) {
      return res.status(500).json({
        success: false,
        error: 'System error: Invalid subscription plan configured for this tenant.'
      });
    }

    if (!planLimits.features.includes(featureName)) {
      return res.status(403).json({
        success: false,
        error: `Feature '${featureName}' is not available in your current plan (${tenantPlan.toUpperCase()}). Please upgrade your subscription to access this.`
      });
    }

    next();
  };
};

module.exports = requireFeature;
