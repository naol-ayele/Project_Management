// src/utils/roles.js
// Centralized role definitions
// All role checks use these constants — no hardcoded strings anywhere

export const ROLES = {
  COMPANY_ADMIN: "COMPANY_ADMIN",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  SITE_ENGINEER: "SITE_ENGINEER",
  SITE_SUPERVISOR: "SITE_SUPERVISOR",
};

// Roles that can create and manage projects
export const PROJECT_MANAGE_ROLES = [
  ROLES.COMPANY_ADMIN,
  ROLES.PROJECT_MANAGER,
];

// Roles that can view projects
export const PROJECT_VIEW_ROLES = [
  ROLES.COMPANY_ADMIN,
  ROLES.PROJECT_MANAGER,
  ROLES.SITE_ENGINEER,
  ROLES.SITE_SUPERVISOR,
];

// Roles with restricted view — only see assigned projects
export const RESTRICTED_VIEW_ROLES = [
  ROLES.SITE_ENGINEER,
  ROLES.SITE_SUPERVISOR,
];
