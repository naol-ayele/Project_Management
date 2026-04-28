// src/server.js

import express from "express";
import dotenv from "dotenv";
import { projectRouter } from "./index.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

dotenv.config();

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Project Management Component is running",
    timestamp: new Date().toISOString(),
  });
});

// Swagger UI — BEFORE 404 handler
// Use a targeted CSP for Swagger UI to allow only the inline assets Swagger needs.
app.use("/api-docs", (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:3000;",
  );
  next();
});

app.use("/api-docs", swaggerUi.serve);
app.get(
  "/api-docs",
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "@conwise/project-management API Docs",
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);
// Request logging — before routes
app.use(requestLogger);
// Mount the project component
app.use("/projects", projectRouter);

// 404 handler — AFTER all real routes
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  }),
);

// Global error handler — LAST
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Project Management Component running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Projects: http://localhost:${PORT}/projects`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});

export default app;
