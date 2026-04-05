// src/core/project.service.js
// Core business logic for the Project Management component
// This layer knows nothing about HTTP — pure data operations only

import prisma from "../utils/prisma.js";
import { ROLES, RESTRICTED_VIEW_ROLES } from "../utils/roles.js";
import { createError } from "../utils/errors.js";

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
   * @returns {object} Created project with progress
   */
  createProject: async ({ ownerUserId, companyId, data }) => {
    const result = await prisma.$transaction(async (tx) => {
      // Step 1 — Create the project
      const project = await tx.project.create({
        data: {
          ownerUserId,
          companyId,
          projectName: data.projectName,
          location: data.location,
          startDate: parseDate(data.startDate),
          endDate: data.endDate ? parseDate(data.endDate) : null,
          clientName: data.clientName,
          projectBudget: data.projectBudget,
          status: data.status ?? "PLANNING",
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Step 2 — Initialize progress automatically at 0
      // Guarantees analytics always has a record to read
      const progress = await tx.projectProgress.create({
        data: {
          projectId: project.id,
          completionPercentage: 0,
          totalTasks: 0,
          tasksCompleted: 0,
        },
      });

      return { ...project, progress };
    });

    return serializeProject(result);
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
   * @returns {object[]} Array of serialized projects
   */
  getAllProjects: async ({ companyId, userId, role }) => {
    // Build role-based where clause
    const where = RESTRICTED_VIEW_ROLES.includes(role)
      ? {
          companyId,
          tasks: {
            some: { assigneeId: userId },
          },
        }
      : { companyId };

    const projects = await prisma.project.findMany({
      where,
      include: {
        progress: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects.map(serializeProject);
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
   * @returns {object|null} Serialized project or null
   */
  getProjectById: async ({ projectId, companyId, userId, role }) => {
    const where = RESTRICTED_VIEW_ROLES.includes(role)
      ? {
          id: projectId,
          companyId,
          tasks: {
            some: { assigneeId: userId },
          },
        }
      : { id: projectId, companyId };

    const project = await prisma.project.findFirst({
      where,
      include: {
        progress: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) return null;
    return serializeProject(project);
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
   * @returns {object} Deleted project id and name
   */
  deleteProject: async ({ projectId, companyId, userId, role }) => {
    // Verify project exists and belongs to the company
    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
    });

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

    // Delete — cascade handles tasks and progress automatically
    await prisma.project.delete({
      where: { id: projectId },
    });

    return {
      id: projectId,
      projectName: project.projectName,
    };
  },
};
