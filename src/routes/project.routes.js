// src/routes/project.routes.js
// Express router for all project endpoints
// authenticate + authorize applied per route

import express from "express";
import { projectController } from "../core/project.controller.js";
import {
  validateBody,
  createProjectSchema,
} from "../validation/project.validation.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import { PROJECT_MANAGE_ROLES, PROJECT_VIEW_ROLES } from "../utils/roles.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /projects — create project
// Only COMPANY_ADMIN and PROJECT_MANAGER
router.post(
  "/",
  authorize(...PROJECT_MANAGE_ROLES),
  validateBody(createProjectSchema),
  projectController.createProject,
);

// GET /projects — list all projects
// All roles — but SITE_ENGINEER and SITE_SUPERVISOR
// only see projects they are assigned to
router.get(
  "/",
  authorize(...PROJECT_VIEW_ROLES),
  projectController.getAllProjects,
);

// GET /projects/:id — get single project
// All roles — with same assignment filter for restricted roles
router.get(
  "/:id",
  authorize(...PROJECT_VIEW_ROLES),
  projectController.getProjectById,
);

// DELETE /projects/:id — delete project
// Only COMPANY_ADMIN and PROJECT_MANAGER
// PROJECT_MANAGER can only delete their own
router.delete(
  "/:id",
  authorize(...PROJECT_MANAGE_ROLES),
  projectController.deleteProject,
);

export default router;
