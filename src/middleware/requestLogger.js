// src/middleware/requestLogger.js
// Logs incoming requests and outgoing responses with duration

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const roleInfo = req.user ? `[ROLE:${req.user.role}:${req.user.id}]` : "[unauthenticated]";

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