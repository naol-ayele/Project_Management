// src/middleware/requestLogger.js
// Logs incoming requests and outgoing responses with duration

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const role = req.user?.role || "unknown";
  const roleInfo = req.user ? `[ROLE:${role}]` : "[unauthenticated]";

  console.log(`→ ${req.method} ${req.path} ${roleInfo}`);

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const duration = Date.now() - start;
    console.log(`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    return originalJson(body);
  };

  next();
};

export default requestLogger;
