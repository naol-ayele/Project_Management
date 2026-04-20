import { jest } from "@jest/globals";

export const ROLES = {
  COMPANY_ADMIN: "COMPANY_ADMIN",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  SITE_ENGINEER: "SITE_ENGINEER",
  SITE_SUPERVISOR: "SITE_SUPERVISOR",
};

export const HEADERS = {
  admin: {
    "x-user-id": "1",
    "x-user-role": ROLES.COMPANY_ADMIN,
    "x-company-id": "1",
  },
  manager: {
    "x-user-id": "2",
    "x-user-role": ROLES.PROJECT_MANAGER,
    "x-company-id": "1",
  },
  engineer: {
    "x-user-id": "3",
    "x-user-role": ROLES.SITE_ENGINEER,
    "x-company-id": "1",
  },
  supervisor: {
    "x-user-id": "4",
    "x-user-role": ROLES.SITE_SUPERVISOR,
    "x-company-id": "1",
  },
};

export const createProjectPayload = (overrides = {}) => ({
  projectName: "Test Construction Project",
  location: "123 Test Street, Test City",
  startDate: "2024-06-01",
  endDate: "2024-12-31",
  clientName: "Test Client Inc",
  projectBudget: 500000,
  status: "PLANNING",
  ...overrides,
});

export const VALID_STATUSES = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];
