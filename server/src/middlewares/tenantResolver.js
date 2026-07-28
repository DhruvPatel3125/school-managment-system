const Tenant = require('../models/tenant');

/**
 * Tenant Resolver Middleware
 * Extracts tenant subdomain from Host header, custom headers, or query parameters,
 * resolves the tenant from the database, and appends tenant context to the request object.
 */
const tenantResolver = async (req, res, next) => {
  // Exclude health checks or documentation paths from tenant resolution if needed
  if (req.path === '/api/v1/health') {
    return next();
  }

  try {
    let subdomain = null;

    // 1. Check custom headers (useful for API testing and development)
    if (req.headers['x-tenant-subdomain']) {
      subdomain = req.headers['x-tenant-subdomain'];
    } 
    // 2. Check query parameters (developer convenience)
    else if (req.query.tenant) {
      subdomain = req.query.tenant;
    } 
    // 3. Resolve from Host header
    else if (req.headers.host) {
      const host = req.headers.host.split(':')[0]; // Strip port if present
      const parts = host.split('.');

      // If host is like schoola.educore.app or schoola.localhost
      // For localhost, parts length is 2 (schoola.localhost)
      // For educore.app, parts length is 3 (schoola.educore.app)
      if (parts.length > 1 && !host.endsWith('.vercel.app')) {
        // Exclude standard domains like www or main domain
        const isMainDomain = parts[0] === 'www' || parts[0] === 'localhost' || parts[0] === 'educore';
        if (!isMainDomain) {
          subdomain = parts[0];
        }
      }
    }

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Tenant identification missing. Provide a valid subdomain or tenant header/query param.'
      });
    }

    // Resolve tenant from database
    const tenant = await Tenant.findOne({
      subdomain: subdomain.toLowerCase(),
      status: 'active'
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `Tenant '${subdomain}' not found or is currently inactive.`
      });
    }

    // Attach tenant context to the request
    req.tenant = tenant;
    req.tenantId = tenant.id;

    next();
  } catch (error) {
    console.error('Error in tenantResolver middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during tenant resolution.'
    });
  }
};

module.exports = tenantResolver;
