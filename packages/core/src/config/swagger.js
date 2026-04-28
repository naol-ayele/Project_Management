// packages/core/src/config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "@conwise/project-management API",
      version: "1.0.0",
      description:
        "Reusable Project Management component for Node.js/Express applications. " +
        "Built as part of the ConWise Construction Collaboration System.",
      contact: {
        name: "ConWise Team",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Core standalone server",
      },
      {
        url: "http://localhost:3001",
        description: "Demo app server",
      },
    ],
    components: {
      securitySchemes: {
        headerAuth: {
          type: "apiKey",
          in: "header",
          name: "x-user-id",
          description: "User ID header for authentication",
        },
      },
      schemas: {
        Project: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            companyId: { type: "integer", example: 1 },
            ownerUserId: { type: "integer", example: 1 },
            projectName: { type: "string", example: "Adama Office Complex" },
            location: { type: "string", example: "Adama, Ethiopia" },
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time", nullable: true },
            clientName: { type: "string", example: "ABC Construction PLC" },
            projectBudget: {
              type: "number",
              example: 5000000,
              description: "Project budget amount in cents",
            },
            status: {
              type: "string",
              enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"],
              example: "PLANNING",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            owner: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                firstName: { type: "string", example: "Firomsa" },
                lastName: { type: "string", example: "Hika" },
                email: { type: "string", example: "firomsa@conwise.et" },
                role: { type: "string", example: "PROJECT_MANAGER" },
              },
            },
            progress: {
              type: "object",
              properties: {
                completionPercentage: { type: "string", example: "0" },
                totalTasks: { type: "integer", example: 0 },
                tasksCompleted: { type: "integer", example: 0 },
              },
            },
          },
        },

        CreateProjectRequest: {
          type: "object",
          required: [
            "projectName",
            "location",
            "startDate",
            "clientName",
            "projectBudget",
          ],
          properties: {
            projectName: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Adama Office Complex",
            },
            location: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "Adama, Ethiopia",
            },
            startDate: {
              type: "string",
              format: "date",
              example: "2026-01-01",
            },
            endDate: {
              type: "string",
              format: "date",
              example: "2026-12-31",
              nullable: true,
            },
            clientName: {
              type: "string",
              minLength: 2,
              maxLength: 100,
              example: "ABC Construction PLC",
            },
            projectBudget: {
              type: "number",
              example: 5000000,
            },
            status: {
              type: "string",
              enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"],
              example: "PLANNING",
            },
          },
        },

        UpdateProjectRequest: {
          type: "object",
          properties: {
            projectName: { type: "string", minLength: 2, maxLength: 100 },
            location: { type: "string", minLength: 2, maxLength: 100 },
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date", nullable: true },
            clientName: { type: "string", minLength: 2, maxLength: 100 },
            projectBudget: {
              type: "number",
              example: 5000000,
              description: "Project budget amount in cents",
            },
            status: {
              type: "string",
              enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"],
            },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
