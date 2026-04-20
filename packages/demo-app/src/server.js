import express from "express";
import dotenv from "dotenv";
import {
  createProjectRouter,
  errorHandler,
  requestLogger,
} from "@project-mgmt/core";

dotenv.config();

const app = express();
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "ConWise Demo App is running",
    component: "@project-mgmt/core",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/projects",
  createProjectRouter({
    hooks: {
      afterCreate: (project, req) => {
        console.log(
          `[Demo] Project created: ${project.projectName} by user ${req.user.id}`
        );
      },
      beforeDelete: (project, req) => {
        console.log(
          `[Demo] Project being deleted: ${project.projectName} by user ${req.user.id}`
        );
      },
    },
  })
);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Demo App running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Projects: http://localhost:${PORT}/projects`);
  console.log(`Component: @project-mgmt/core`);
});

export default app;