// src/server.js
// Standalone demo server
// Shows how to plug the component into any Express app

import express from "express";
import dotenv from "dotenv";
import { projectRouter } from "./index.js";

dotenv.config();

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Project Management Component is running",
  });
});

// Mount the project component at /projects
// This is all any app needs to integrate this component
app.use("/projects", projectRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Project Management Component running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Projects: http://localhost:${PORT}/projects`);
});

export default app;
