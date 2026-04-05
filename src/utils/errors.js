// src/utils/errors.js
// Reusable error creation helpers
// Keeps error structure consistent across the entire component

/**
 * Creates an error with an attached statusCode
 * Used by the service layer to communicate HTTP errors
 * without importing Express or knowing about HTTP
 *
 * @param {string} message - Human readable error message
 * @param {number} statusCode - HTTP status code (400, 403, 404 etc)
 * @returns {Error}
 */
export const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Shared error handler for controller catch blocks
 * Replaces repetitive if/else chains in every controller method
 * Add new status codes here once — applies everywhere automatically
 *
 * @param {object} res - Express response object
 * @param {Error} error - Error thrown from service layer
 * @param {string} context - Method name for logging
 */
export const handleError = (res, error, context) => {
  if (error.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  if (error.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  console.error(`[ProjectManagement] Error in ${context}:`, error);
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
