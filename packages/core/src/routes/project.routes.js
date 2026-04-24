// src/routes/project.routes.js

/**
 * @swagger
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new construction project
 *     description: Creates a project and automatically initializes its progress record at 0%. Only COMPANY_ADMIN and PROJECT_MANAGER can create projects.
 *     security:
 *       - headerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: header
 *         name: x-user-role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [COMPANY_ADMIN, PROJECT_MANAGER, SITE_ENGINEER, SITE_SUPERVISOR]
 *         example: COMPANY_ADMIN
 *       - in: header
 *         name: x-company-id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden — insufficient role
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: List all projects
 *     description: Returns all projects for the company. SITE_ENGINEER and SITE_SUPERVISOR only see projects they are assigned to via tasks.
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-role
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-company-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden — insufficient role
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get project by ID
 *     description: Returns full project detail. SITE_ENGINEER and SITE_SUPERVISOR can only view projects they are assigned to.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-role
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-company-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project
 *     description: Partially updates a project. COMPANY_ADMIN can update any project. PROJECT_MANAGER can only update their own.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-role
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-company-id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden — can only update own projects
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project
 *     description: Permanently deletes a project and all related data. PROJECT_MANAGER can only delete their own projects. This action is irreversible.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-role
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-company-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden — can only delete own projects
 *       404:
 *         description: Project not found
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

// PATCH /projects/:id — update project
// Only COMPANY_ADMIN and PROJECT_MANAGER
// PROJECT_MANAGER can only update their own
router.patch(
  "/:id",
  authorize(...PROJECT_MANAGE_ROLES),
  validateBody(updateProjectSchema),
  projectController.updateProject,
);

export default router;
