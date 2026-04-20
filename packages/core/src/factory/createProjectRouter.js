// src/factory/createProjectRouter.js
// Factory function to create a pluggable Express router
// Usage examples:
/**
 * Example 1 — default (standalone):
 *   const router = createProjectRouter()
 *   app.use("/projects", router)
 *
 * Example 2 — with custom JWT auth:
 *   const router = createProjectRouter({
 *     authMiddleware: jwtMiddleware,
 *   })
 *   app.use("/projects", router)
 *
 * Example 3 — with hooks:
 *   const router = createProjectRouter({
 *     hooks: {
 *       afterCreate: (project, req) => {
 *         sendNotification(project.id)
 *       }
 *     }
 *   })
 */

import express from "express";
import { projectController } from "../core/project.controller.js";
import {
  validateBody,
  createProjectSchema,
  updateProjectSchema,
} from "../validation/project.validation.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import { PROJECT_MANAGE_ROLES, PROJECT_VIEW_ROLES } from "../utils/roles.js";

export function createProjectRouter(options = {}) {
  const {
    authMiddleware = authenticate,
    authorizeMiddleware = authorize,
    basePath = "/",
    hooks = {},
  } = options;

  const router = express.Router();

  router.use(authMiddleware);

  const normalizedBasePath = basePath === "/" ? "" : basePath.replace(/\/$/, "");
  const base = normalizedBasePath || "/";

  router.post(
    `${base}`,
    authorizeMiddleware(...PROJECT_MANAGE_ROLES),
    validateBody(createProjectSchema),
    (req, res) => projectController.createProject(req, res, hooks),
  );

  router.get(
    `${base}`,
    authorizeMiddleware(...PROJECT_VIEW_ROLES),
    projectController.getAllProjects,
  );

  router.get(
    `${base}:id`,
    authorizeMiddleware(...PROJECT_VIEW_ROLES),
    projectController.getProjectById,
  );

  router.delete(
    `${base}:id`,
    authorizeMiddleware(...PROJECT_MANAGE_ROLES),
    (req, res) => projectController.deleteProject(req, res, hooks),
  );

  router.patch(
    `${base}:id`,
    authorizeMiddleware(...PROJECT_MANAGE_ROLES),
    validateBody(updateProjectSchema),
    projectController.updateProject,
  );

  return router;
}