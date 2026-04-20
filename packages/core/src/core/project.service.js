// src/core/project.service.js

import prisma from "../utils/prisma.js";
import { createPrismaAdapter } from "../adapters/index.js";
import { ROLES, RESTRICTED_VIEW_ROLES } from "../utils/roles.js";
import { createError } from "../utils/errors.js";

const defaultAdapter = createPrismaAdapter(prisma);

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

/**
 * Parses and validates a date string
 * Throws a descriptive error instead of silently
 * creating an Invalid Date object
 *
 * @param {string} value - Date string to parse
 * @returns {Date}
 */
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw createError(`Invalid date value: ${value}`, 400);
  }
  return date;
};

/**
 * Serializes all Decimal fields to strings for safe JSON responses
 * Prisma Decimal type does not extend Number —
 * JSON.stringify returns an object instead of a number without this
 *
 * @param {object} project - Raw project from Prisma
 * @returns {object} - Project safe for JSON response
 */
const serializeProject = (project) => ({
  ...project,
  projectBudget: project.projectBudget?.toString(),
  progress: project.progress
    ? {
        ...project.progress,
        completionPercentage: project.progress.completionPercentage?.toString(),
      }
    : null,
});

// ─────────────────────────────────────────
// SERVICE METHODS
// ─────────────────────────────────────────

export const projectService = {
  /**
   * Creates a new project and atomically initializes its
   * progress record in a single database transaction.
   *
   * If either write fails both are rolled back — the dashboard
   * will always have a progress record to read from day one.
   *
   * @param {object} params
   * @param {number} params.ownerUserId - ID of the creating user
   * @param {number} params.companyId - ID of the company
   * @param {object} params.data - Validated project fields
   * @param {object} params.adapter - Optional database adapter
   * @returns {object} Created project with progress
   */
  createProject: async ({ ownerUserId, companyId, data, adapter = defaultAdapter }) => {
    return adapter.createProject({ ownerUserId, companyId, data });
  },

  /**
   * Lists all projects for a company.
   * SITE_ENGINEER and SITE_SUPERVISOR only see projects
   * where they have been assigned tasks — data isolation
   * enforced at the query level not in application code.
   *
   * @param {object} params
   * @param {number} params.companyId
   * @param {number} params.userId
   * @param {string} params.role
   * @param {object} params.adapter - Optional database adapter
   * @returns {object[]} Array of serialized projects
   */
  getAllProjects: async ({ companyId, userId, role, adapter = defaultAdapter }) => {
    const roleIsRestricted = RESTRICTED_VIEW_ROLES.includes(role);
    return adapter.findProjects({ companyId, assigneeId: userId, roleIsRestricted });
  },

  /**
   * Returns a single project with full detail.
   * SITE_ENGINEER and SITE_SUPERVISOR can only view
   * projects they are assigned to via tasks.
   *
   * @param {object} params
   * @param {number} params.projectId
   * @param {number} params.companyId
   * @param {number} params.userId
   * @param {string} params.role
   * @param {object} params.adapter - Optional database adapter
   * @returns {object|null} Serialized project or null
   */
  getProjectById: async ({ projectId, companyId, userId, role, adapter = defaultAdapter }) => {
    const roleIsRestricted = RESTRICTED_VIEW_ROLES.includes(role);
    return adapter.findProjectWithTasks({
      id: projectId,
      companyId,
      assigneeId: userId,
      roleIsRestricted,
    });
  },

  /**
   * Permanently deletes a project and all its related data.
   * Uses whitelist authorization — only explicitly permitted
   * roles can delete, everything else is denied by default.
   *
   * COMPANY_ADMIN: can delete any company project
   * PROJECT_MANAGER: can only delete their own projects
   * All others: denied even if they reach this method
   *
   * Cascade deletes handled by Prisma schema:
   * tasks and progress are removed automatically
   *
   * @param {object} params
   * @param {number} params.projectId
   * @param {number} params.companyId
   * @param {number} params.userId
   * @param {string} params.role
   * @param {object} params.adapter - Optional database adapter
   * @returns {object} Deleted project id and name
   */
  deleteProject: async ({ projectId, companyId, userId, role, adapter = defaultAdapter }) => {
    const project = await adapter.findProjectById({ id: projectId, companyId });

    if (!project) return null;

    // Whitelist authorization — deny by default
    if (role === ROLES.COMPANY_ADMIN) {
      // Can delete any project in their company
    } else if (role === ROLES.PROJECT_MANAGER) {
      // Can only delete projects they own
      if (project.ownerUserId !== userId) {
        throw createError("You can only delete projects you own.", 403);
      }
    } else {
      // Any other role is explicitly denied
      throw createError(
        "You do not have permission to delete this project.",
        403,
      );
    }

    await adapter.deleteProject({ id: projectId });

    return {
      id: projectId,
      projectName: project.projectName,
    };
  },

  /**
   * Updates an existing project with provided fields.
   * Uses whitelist authorization — only explicitly permitted
   * roles can update, everything else is denied by default.
   *
   * COMPANY_ADMIN: can update any company project
   * PROJECT_MANAGER: can only update their own projects
   * All others: denied even if they reach this method
   *
   * @param {object} params
   * @param {number} params.projectId
   * @param {number} params.companyId
   * @param {number} params.userId
   * @param {string} params.role
   * @param {object} params.data - Validated update fields
   * @param {object} params.adapter - Optional database adapter
   * @returns {object} Updated project with progress
   */
  updateProject: async ({ projectId, companyId, userId, role, data, adapter = defaultAdapter }) => {
    const project = await adapter.findProjectById({ id: projectId, companyId });

    if (!project) return null;

    // Whitelist authorization — deny by default
    if (role === ROLES.COMPANY_ADMIN) {
      // Can update any project in their company
    } else if (role === ROLES.PROJECT_MANAGER) {
      // Can only update projects they own
      if (project.ownerUserId !== userId) {
        throw createError(
          "You do not have permission to update this project.",
          403,
        );
      }
    } else {
      // Any other role is explicitly denied
      throw createError(
        "You do not have permission to update this project.",
        403,
      );
    }

    // Build updateData object — only map provided fields
    const updateData = {};
    if (data.projectName !== undefined) updateData.projectName = data.projectName;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startDate !== undefined) updateData.startDate = parseDate(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate !== null ? parseDate(data.endDate) : null;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.projectBudget !== undefined) updateData.projectBudget = data.projectBudget;
    if (data.status !== undefined) updateData.status = data.status;

    return adapter.updateProject({ id: projectId, updateData });
  },
};
