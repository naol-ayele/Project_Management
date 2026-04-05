// src/index.js
// Public API of the reusable component
// Other apps import from here — not from internal files

export { projectService } from "./core/project.service.js";
export { projectController } from "./core/project.controller.js";
export { default as projectRouter } from "./routes/project.routes.js";
export { default as authenticate } from "./middleware/authenticate.js";
export { default as authorize } from "./middleware/authorize.js";
export {
  validateBody,
  createProjectSchema,
  updateProjectSchema,
} from "./validation/project.validation.js";
export {
  ROLES,
  PROJECT_MANAGE_ROLES,
  PROJECT_VIEW_ROLES,
} from "./utils/roles.js";
export { createError, handleError } from "./utils/errors.js";
