// src/core/project.controller.js
// Handles HTTP request/response for all project endpoints
// Thin layer — delegates all business logic to project.service.js

import { projectService } from "./project.service.js";
import { handleError } from "../utils/errors.js";

export const projectController = {
  // POST /projects
  createProject: async (req, res, hooks = {}) => {
    try {
      const ownerUserId = req.user.id;
      const companyId = req.user.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with a company.",
        });
      }

      if (hooks?.beforeCreate) {
        hooks.beforeCreate(req);
      }

      const project = await projectService.createProject({
        ownerUserId,
        companyId,
        data: req.body,
      });

      if (hooks?.afterCreate) {
        hooks.afterCreate(project, req);
      }

      return res.status(201).json({
        success: true,
        message: "Project created successfully.",
        data: project,
      });
    } catch (error) {
      return handleError(res, error, "createProject");
    }
  },

  // GET /projects
  getAllProjects: async (req, res) => {
    try {
      const { id: userId, companyId, role } = req.user;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with a company.",
        });
      }

      const projects = await projectService.getAllProjects({
        companyId,
        userId,
        role,
      });

      return res.status(200).json({
        success: true,
        message: "Projects retrieved successfully.",
        data: projects,
      });
    } catch (error) {
      return handleError(res, error, "getAllProjects");
    }
  },

  // GET /projects/:id
  getProjectById: async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      const { id: userId, companyId, role } = req.user;

      if (!projectId || isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with a company.",
        });
      }

      const project = await projectService.getProjectById({
        projectId,
        companyId,
        userId,
        role,
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project retrieved successfully.",
        data: project,
      });
    } catch (error) {
      return handleError(res, error, "getProjectById");
    }
  },

  // DELETE /projects/:id
  deleteProject: async (req, res, hooks = {}) => {
    try {
      const projectId = Number(req.params.id);
      const { id: userId, companyId, role } = req.user;

      if (!projectId || isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with a company.",
        });
      }

      const deleted = await projectService.deleteProject({
        projectId,
        companyId,
        userId,
        role,
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      if (hooks?.beforeDelete) {
        hooks.beforeDelete(deleted, req);
      }

      return res.status(200).json({
        success: true,
        message: deleted.projectName
          ? `Project "${deleted.projectName}" deleted successfully.`
          : "Project deleted successfully.",
        data: { id: deleted.id },
      });
    } catch (error) {
      return handleError(res, error, "deleteProject");
    }
  },

  // PATCH /projects/:id
  updateProject: async (req, res) => {
    try {
      const projectId = Number(req.params.id);
      const { id: userId, companyId, role } = req.user;

      if (!projectId || isNaN(projectId) || projectId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with a company.",
        });
      }

      const updated = await projectService.updateProject({
        projectId,
        companyId,
        userId,
        role,
        data: req.body,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project updated successfully.",
        data: updated,
      });
    } catch (error) {
      return handleError(res, error, "updateProject");
    }
  },
};
