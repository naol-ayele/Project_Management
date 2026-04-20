// src/server.js
// Standalone demo server
// Shows how to plug the component into any Express app

import express from "express";
import dotenv from "dotenv";
import { projectRouter } from "./index.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

// Request logging - before routes
app.use(requestLogger);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Project Management Component is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount the project component at /projects
// This is all any app needs to integrate this component
app.use("/projects", projectRouter);

// 404 handler - after routes
app.use((req, res) => res.status(404).json({
  success: false,
  message: `Route ${req.method} ${req.path} not found.`,
}));

// Global error handler - LAST
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Project Management Component running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Projects: http://localhost:${PORT}/projects`);
});

export default app;
