// src/middleware/authenticate.js
// Simulated authentication middleware for standalone use
// In production — replace this with your real JWT verification

/**
 * Authentication middleware
 *
 * For standalone/demo use this reads user info from
 * request headers directly so you can test without
 * a full auth system.
 *

 *
 * In production — replace this with real JWT verification:
 *   const decoded = jwt.verify(token, process.env.JWT_SECRET)
 *   req.user = decoded
 */
const authenticate = (req, res, next) => {
  const userId = Number(req.headers["x-user-id"]);
  const role = req.headers["x-user-role"];
  const companyId = Number(req.headers["x-company-id"]);

  if (!userId || !role || !companyId) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required. Provide x-user-id, x-user-role, x-company-id headers.",
    });
  }

  req.user = {
    id: userId,
    role,
    companyId,
  };

  next();
};

export default authenticate;
