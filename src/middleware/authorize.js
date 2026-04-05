// src/middleware/authorize.js
// Role-based access control middleware
// Reusable — pass any list of allowed roles

/**
 * Authorization middleware factory
 * Checks req.user.role against the allowed roles list
 * Must be used AFTER authenticate middleware
 *
 * @param {...string} allowedRoles - Roles permitted to access the route
 * @returns Express middleware function
 *
 * @example
 * router.post('/', authorize('COMPANY_ADMIN', 'PROJECT_MANAGER'), controller)
 */
const authorize = (...allowedRoles) => {
  const normalized = allowedRoles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: "User role is missing.",
      });
    }

    if (!normalized.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

export default authorize;
