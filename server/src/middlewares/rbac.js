/**
 * Role-Based Access Control (RBAC) Permission Guard
 * Restricts access to users who possess specific permission nodes.
 * @param {string|string[]} requiredPermissions - Single permission string or array of permissions.
 */
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access Denied. User session is unauthenticated.'
      });
    }

    // Super Admin bypasses all specific permission constraints
    if (req.user.isSuperAdmin) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const permissionsToCheck = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    // Check if the user has AT LEAST one of the required permissions
    const hasPermission = permissionsToCheck.some(permission => userPermissions.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied. You do not possess the required permissions to perform this action.'
      });
    }

    next();
  };
};

module.exports = checkPermission;
