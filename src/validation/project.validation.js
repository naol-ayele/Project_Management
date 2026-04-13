// src/validation/project.validation.js
// Zod schemas for all project endpoints
// validateBody middleware is reusable across any schema

import { z } from "zod";

// ─────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────

export const createProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(100, "Project name must not exceed 100 characters"),

    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location must not exceed 100 characters"),

    startDate: z.coerce.date({
      errorMap: () => ({ message: "startDate must be a valid date" }),
    }),

    endDate: z.coerce
      .date({
        errorMap: () => ({ message: "endDate must be a valid date" }),
      })
      .optional(),

    clientName: z
      .string()
      .min(2, "Client name must be at least 2 characters")
      .max(100, "Client name must not exceed 100 characters"),

    projectBudget: z
      .number({ invalid_type_error: "projectBudget must be a number" })
      .positive("projectBudget must be a positive number"),

    status: z
      .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"])
      .optional(),
  })
  .refine(
    (data) => {
      // Only validate ordering when both dates are provided
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "endDate must be after startDate",
      path: ["endDate"],
    },
  );

export const updateProjectSchema = z
  .object({
    projectName: z
      .string()
      .min(2, "Project name must be at least 2 characters")
      .max(100, "Project name must not exceed 100 characters")
      .optional(),
    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location must not exceed 100 characters")
      .optional(),
    startDate: z
      .coerce.date({
        errorMap: () => ({ message: "startDate must be a valid date" }),
      })
      .optional(),
    endDate: z.coerce
      .date({
        errorMap: () => ({ message: "endDate must be a valid date" }),
      })
      .nullable()
      .optional(),
    clientName: z
      .string()
      .min(2, "Client name must be at least 2 characters")
      .max(100, "Client name must not exceed 100 characters")
      .optional(),
    projectBudget: z
      .number({ invalid_type_error: "projectBudget must be a number" })
      .positive("projectBudget must be a positive number")
      .optional(),
    status: z
      .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"], {
        errorMap: () => ({ message: "status must be a valid value: PLANNING, ACTIVE, ON_HOLD, COMPLETED, or CANCELLED" }),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Only validate ordering when both dates are present
      // in the same partial update request
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "endDate must be after startDate",
      path: ["endDate"],
    },
  );

// ─────────────────────────────────────────
// MIDDLEWARE FACTORY
// ─────────────────────────────────────────

/**
 * Reusable validation middleware factory
 * Works with any Zod schema
 * Attaches cleaned + coerced data back to req.body
 *
 * @param {ZodSchema} schema - Any Zod schema
 * @returns Express middleware function
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error?.issues || [];
    return res.status(400).json({
      success: false,
      message: "Validation failed. Please check your input.",
      errors: errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  req.body = result.data;
  next();
};
