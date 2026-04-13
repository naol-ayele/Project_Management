// src/middleware/errorHandler.js
// Express global error handler
// Must be registered LAST in Express after all routes

const errorHandler = (err, req, res, next) => {
  console.error(`[ErrorHandler] ${req.method} ${req.path}:`, err);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal server error.",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;