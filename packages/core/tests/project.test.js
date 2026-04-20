import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/server.js";
import prisma from "../src/utils/prisma.js";
import {
  ROLES,
  HEADERS,
  createProjectPayload,
  VALID_STATUSES,
} from "./fixtures.js";

describe("Project API Integration Tests", () => {
  let createdProjectId;

  describe("POST /projects - Create Project", () => {
    describe("Success cases", () => {
      test("COMPANY_ADMIN can create a project", async () => {
        const payload = createProjectPayload();

        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.projectName).toBe(payload.projectName);
        expect(response.body.data.location).toBe(payload.location);
        expect(response.body.data.clientName).toBe(payload.clientName);
        expect(response.body.data.projectBudget).toBe(payload.projectBudget.toString());
        expect(response.body.data.status).toBe("PLANNING");
        expect(response.body.data.progress).not.toBeNull();
        expect(response.body.data.progress.completionPercentage).toBe("0");
        expect(response.body.data.owner).not.toBeNull();
        createdProjectId = response.body.data.id;
      });

      test("PROJECT_MANAGER can create a project", async () => {
        const payload = createProjectPayload({ projectName: "Manager Project" });

        const response = await request(app)
          .post("/projects")
          .set(HEADERS.manager)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.projectName).toBe("Manager Project");
      });

      test("creates project with optional endDate omitted", async () => {
        const payload = {
          projectName: "No End Date Project",
          location: "Test Location",
          startDate: "2024-06-01",
          clientName: "Test Client",
          projectBudget: 100000,
        };

        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.data.endDate).toBeNull();
      });

      test("creates project with all valid statuses", async () => {
        for (const status of VALID_STATUSES) {
          const payload = createProjectPayload({ status });
          const response = await request(app)
            .post("/projects")
            .set(HEADERS.admin)
            .send(payload);

          expect(response.status).toBe(201);
          expect(response.body.data.status).toBe(status);
        }
      });
    });

    describe("RBAC - Forbidden (403)", () => {
      test("SITE_ENGINEER cannot create a project", async () => {
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.engineer)
          .send(createProjectPayload());

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test("SITE_SUPERVISOR cannot create a project", async () => {
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.supervisor)
          .send(createProjectPayload());

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });

    describe("Validation errors (400)", () => {
      test("missing required fields", async () => {
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send({});

        expect(response.status).toBe(400);
      });

      test("projectName too short", async () => {
        const payload = createProjectPayload({ projectName: "A" });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectName")).toBe(true);
        }
      });

      test("projectName too long", async () => {
        const payload = createProjectPayload({ projectName: "A".repeat(101) });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectName")).toBe(true);
        }
      });

      test("location too short", async () => {
        const payload = createProjectPayload({ location: "A" });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "location")).toBe(true);
        }
      });

      test("invalid startDate", async () => {
        const payload = createProjectPayload({ startDate: "not-a-date" });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "startDate")).toBe(true);
        }
      });

      test("endDate before startDate", async () => {
        const payload = createProjectPayload({
          startDate: "2024-12-31",
          endDate: "2024-06-01",
        });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "endDate")).toBe(true);
        }
      });

      test("clientName too short", async () => {
        const payload = createProjectPayload({ clientName: "A" });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "clientName")).toBe(true);
        }
      });

      test("projectBudget not a number", async () => {
        const payload = createProjectPayload({ projectBudget: "not-a-number" });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectBudget")).toBe(true);
        }
      });

      test("projectBudget negative", async () => {
        const payload = createProjectPayload({ projectBudget: -1000 });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectBudget")).toBe(true);
        }
      });

      test("projectBudget zero", async () => {
        const payload = createProjectPayload({ projectBudget: 0 });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectBudget")).toBe(true);
        }
      });

      test("invalid status value", async () => {
        const payload = createProjectPayload({ status: "INVALID_STATUS" });
        const response = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(payload);

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "status")).toBe(true);
        }
      });
    });

    describe("Authentication errors (401)", () => {
      test("missing auth headers returns 401", async () => {
        const response = await request(app)
          .post("/projects")
          .send(createProjectPayload());

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      test("missing x-user-id returns 401", async () => {
        const response = await request(app)
          .post("/projects")
          .set({
            "x-user-role": ROLES.COMPANY_ADMIN,
            "x-company-id": "1",
          })
          .send(createProjectPayload());

        expect(response.status).toBe(401);
      });

      test("missing x-user-role returns 401", async () => {
        const response = await request(app)
          .post("/projects")
          .set({
            "x-user-id": "1",
            "x-company-id": "1",
          })
          .send(createProjectPayload());

        expect(response.status).toBe(401);
      });

      test("missing x-company-id returns 401", async () => {
        const response = await request(app)
          .post("/projects")
          .set({
            "x-user-id": "1",
            "x-user-role": ROLES.COMPANY_ADMIN,
          })
          .send(createProjectPayload());

        expect(response.status).toBe(401);
      });
    });
  });

  describe("GET /projects - List Projects", () => {
    beforeEach(async () => {
      const adminPayload = createProjectPayload({ projectName: "Admin Project" });
      const managerPayload = createProjectPayload({ projectName: "Manager Project" });

      const adminResponse = await request(app)
        .post("/projects")
        .set(HEADERS.admin)
        .send(adminPayload);
      createdProjectId = adminResponse.body.data.id;

      await request(app)
        .post("/projects")
        .set(HEADERS.manager)
        .send(managerPayload);
    });

    describe("Success cases", () => {
      test("COMPANY_ADMIN can list all projects in company", async () => {
        const response = await request(app)
          .get("/projects")
          .set(HEADERS.admin);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(2);
      });

      test("PROJECT_MANAGER can list all projects in company", async () => {
        const response = await request(app)
          .get("/projects")
          .set(HEADERS.manager);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(2);
      });

      test("SITE_ENGINEER sees only assigned projects (empty list initially)", async () => {
        const response = await request(app)
          .get("/projects")
          .set(HEADERS.engineer);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(0);
      });

      test("SITE_SUPERVISOR sees only assigned projects (empty list initially)", async () => {
        const response = await request(app)
          .get("/projects")
          .set(HEADERS.supervisor);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(0);
      });

      test("returns projects with progress and owner info", async () => {
        const response = await request(app)
          .get("/projects")
          .set(HEADERS.admin);

        expect(response.status).toBe(200);
        const project = response.body.data[0];
        expect(project.progress).toBeDefined();
        expect(project.owner).toBeDefined();
        expect(project.owner.id).toBeDefined();
        expect(project.owner.firstName).toBeDefined();
      });

      test("returns projects ordered by createdAt desc", async () => {
        const response = await request(app)
          .get("/projects")
          .set(HEADERS.admin);

        expect(response.status).toBe(200);
        const dates = response.body.data.map(p => new Date(p.createdAt));
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
        }
      });
    });

    describe("RBAC - Forbidden (403)", () => {
      test("unauthenticated request returns 401", async () => {
        const response = await request(app).get("/projects");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe("GET /projects/:id - Get Project Detail", () => {
    beforeEach(async () => {
      const payload = createProjectPayload();
      const response = await request(app)
        .post("/projects")
        .set(HEADERS.admin)
        .send(payload);
      createdProjectId = response.body.data.id;
    });

    describe("Success cases", () => {
      test("COMPANY_ADMIN can view any project", async () => {
        const response = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set(HEADERS.admin);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(createdProjectId);
        expect(response.body.data.progress).toBeDefined();
      });

      test("PROJECT_MANAGER can view any project", async () => {
        const response = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set(HEADERS.manager);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      test("SITE_ENGINEER cannot view unassigned project", async () => {
        const response = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set(HEADERS.engineer);

        expect(response.status).toBe(404);
      });

      test("SITE_SUPERVISOR cannot view unassigned project", async () => {
        const response = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set(HEADERS.supervisor);

        expect(response.status).toBe(404);
      });

      test("returns project with tasks count", async () => {
        const response = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set(HEADERS.admin);

        expect(response.status).toBe(200);
        expect(response.body.data._count).toBeDefined();
        expect(response.body.data._count.tasks).toBeDefined();
      });
    });

    describe("Not Found (404)", () => {
      test("returns 404 for non-existent project", async () => {
        const response = await request(app)
          .get("/projects/99999")
          .set(HEADERS.admin);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Project not found.");
      });

      test("returns 404 for project from different company", async () => {
        const otherCompanyPayload = createProjectPayload({ projectName: "Other Company Project" });
        await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(otherCompanyPayload);

        const response = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set({ ...HEADERS.admin, "x-company-id": "99" });

        expect(response.status).toBe(404);
      });

      test("returns 404 for invalid project ID format", async () => {
        const response = await request(app)
          .get("/projects/invalid")
          .set(HEADERS.admin);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid project ID.");
      });
    });

    describe("RBAC - Forbidden (403)", () => {
      test("unauthenticated request returns 401", async () => {
        const response = await request(app)
          .get(`/projects/${createdProjectId}`);

        expect(response.status).toBe(401);
      });
    });
  });

  describe("DELETE /projects/:id - Delete Project", () => {
    beforeEach(async () => {
      const payload = createProjectPayload();
      const response = await request(app)
        .post("/projects")
        .set(HEADERS.admin)
        .send(payload);
      createdProjectId = response.body.data.id;
    });

    describe("Success cases", () => {
      test("COMPANY_ADMIN can delete any project", async () => {
        const response = await request(app)
          .delete(`/projects/${createdProjectId}`)
          .set(HEADERS.admin);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(createdProjectId);

        const getResponse = await request(app)
          .get(`/projects/${createdProjectId}`)
          .set(HEADERS.admin);
        expect(getResponse.status).toBe(404);
      });

      test("PROJECT_MANAGER can delete their own project", async () => {
        const managerPayload = createProjectPayload({ projectName: "Manager Own Project" });
        const createResponse = await request(app)
          .post("/projects")
          .set(HEADERS.manager)
          .send(managerPayload);
        const managerProjectId = createResponse.body.data.id;

        const response = await request(app)
          .delete(`/projects/${managerProjectId}`)
          .set(HEADERS.manager);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      test("deleting cascades to progress and tasks", async () => {
        const response = await request(app)
          .delete(`/projects/${createdProjectId}`)
          .set(HEADERS.admin);

        expect(response.status).toBe(200);

        const progressCount = await prisma.projectProgress.count({
          where: { projectId: createdProjectId },
        });
        expect(progressCount).toBe(0);
      });
    });

    describe("RBAC - Forbidden (403)", () => {
      test("PROJECT_MANAGER cannot delete another manager's project", async () => {
        const adminPayload = createProjectPayload({ projectName: "Admin Own Project" });
        const createResponse = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(adminPayload);
        const adminProjectId = createResponse.body.data.id;

        const response = await request(app)
          .delete(`/projects/${adminProjectId}`)
          .set(HEADERS.manager);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test("SITE_ENGINEER cannot delete projects", async () => {
        const response = await request(app)
          .delete(`/projects/${createdProjectId}`)
          .set(HEADERS.engineer);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test("SITE_SUPERVISOR cannot delete projects", async () => {
        const response = await request(app)
          .delete(`/projects/${createdProjectId}`)
          .set(HEADERS.supervisor);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });

    describe("Not Found (404)", () => {
      test("returns 404 for non-existent project", async () => {
        const response = await request(app)
          .delete("/projects/99999")
          .set(HEADERS.admin);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Project not found.");
      });

      test("returns 404 for project from different company", async () => {
        const response = await request(app)
          .delete(`/projects/${createdProjectId}`)
          .set({ ...HEADERS.admin, "x-company-id": "99" });

        expect(response.status).toBe(404);
      });

      test("returns 400 for invalid project ID format", async () => {
        const response = await request(app)
          .delete("/projects/invalid")
          .set(HEADERS.admin);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid project ID.");
      });
    });

    describe("Authentication errors (401)", () => {
      test("unauthenticated request returns 401", async () => {
        const response = await request(app)
          .delete(`/projects/${createdProjectId}`);

        expect(response.status).toBe(401);
      });
    });
  });

  describe("PATCH /projects/:id - Update Project", () => {
    let updateTestProjectId;

    beforeEach(async () => {
      const payload = createProjectPayload({ projectName: "Update Test Project" });
      const response = await request(app)
        .post("/projects")
        .set(HEADERS.admin)
        .send(payload);
      updateTestProjectId = response.body.data.id;
    });

    describe("Success cases", () => {
      test("COMPANY_ADMIN can update any project", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ projectName: "Updated Project Name" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Project updated successfully.");
        expect(response.body.data.projectName).toBe("Updated Project Name");
      });

      test("PROJECT_MANAGER can update their own project", async () => {
        const managerPayload = createProjectPayload({ projectName: "Manager Own Update Project" });
        const createResponse = await request(app)
          .post("/projects")
          .set(HEADERS.manager)
          .send(managerPayload);
        const managerProjectId = createResponse.body.data.id;

        const response = await request(app)
          .patch(`/projects/${managerProjectId}`)
          .set(HEADERS.manager)
          .send({ projectName: "Manager Updated Name" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.projectName).toBe("Manager Updated Name");
      });

      test("partial update — only provided fields change", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ location: "New Location" });

        expect(response.status).toBe(200);
        expect(response.body.data.location).toBe("New Location");
        expect(response.body.data.projectName).toBe("Update Test Project");
      });

      test("can update project status to ACTIVE", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ status: "ACTIVE" });

        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe("ACTIVE");
      });

      test("can update projectBudget", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ projectBudget: 500000 });

        expect(response.status).toBe(200);
        expect(response.body.data.projectBudget).toBe("500000");
      });
    });

    describe("RBAC - Forbidden (403)", () => {
      test("PROJECT_MANAGER cannot update another manager's project", async () => {
        const adminPayload = createProjectPayload({ projectName: "Admin Own Update Project" });
        const createResponse = await request(app)
          .post("/projects")
          .set(HEADERS.admin)
          .send(adminPayload);
        const adminProjectId = createResponse.body.data.id;

        const response = await request(app)
          .patch(`/projects/${adminProjectId}`)
          .set(HEADERS.manager)
          .send({ projectName: "Hacked Name" });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test("SITE_ENGINEER cannot update projects", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.engineer)
          .send({ projectName: "Engineer Name" });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test("SITE_SUPERVISOR cannot update projects", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.supervisor)
          .send({ projectName: "Supervisor Name" });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });

    describe("Validation errors (400)", () => {
      test("projectName too short", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ projectName: "A" });

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectName")).toBe(true);
        }
      });

      test("endDate before startDate", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({
            startDate: "2024-12-31",
            endDate: "2024-06-01",
          });

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "endDate")).toBe(true);
        }
      });

      test("invalid status value", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ status: "INVALID_STATUS" });

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "status")).toBe(true);
        }
      });

      test("negative projectBudget", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .set(HEADERS.admin)
          .send({ projectBudget: -1000 });

        expect(response.status).toBe(400);
        if (response.body.errors) {
          expect(response.body.errors.some(e => e.field === "projectBudget")).toBe(true);
        }
      });
    });

    describe("Not Found (404)", () => {
      test("returns 404 for non-existent project ID (99999)", async () => {
        const response = await request(app)
          .patch("/projects/99999")
          .set(HEADERS.admin)
          .send({ projectName: "Non Existent" });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Project not found.");
      });

      test("returns 400 for invalid project ID (0)", async () => {
        const response = await request(app)
          .patch("/projects/0")
          .set(HEADERS.admin)
          .send({ projectName: "Invalid ID" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid project ID.");
      });
    });

    describe("Authentication errors (401)", () => {
      test("unauthenticated request returns 401", async () => {
        const response = await request(app)
          .patch(`/projects/${updateTestProjectId}`)
          .send({ projectName: "Unauthenticated Update" });

        expect(response.status).toBe(401);
      });
    });
  });

  describe("Assignment filtering for restricted roles", () => {
    test("SITE_ENGINEER can see project after being assigned a task", async () => {
      const payload = createProjectPayload({ projectName: "Assigned Project" });
      const createResponse = await request(app)
        .post("/projects")
        .set(HEADERS.admin)
        .send(payload);
      const projectId = createResponse.body.data.id;

      await prisma.projectTask.create({
        data: {
          projectId,
          assigneeId: 3,
          title: "Test Task",
          description: "Test Description",
        },
      });

      const listResponse = await request(app)
        .get("/projects")
        .set(HEADERS.engineer);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data.some(p => p.id === projectId)).toBe(true);

      const detailResponse = await request(app)
        .get(`/projects/${projectId}`)
        .set(HEADERS.engineer);

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.body.data.id).toBe(projectId);
    });

    test("SITE_SUPERVISOR can see project after being assigned a task", async () => {
      const payload = createProjectPayload({ projectName: "Supervisor Project" });
      const createResponse = await request(app)
        .post("/projects")
        .set(HEADERS.admin)
        .send(payload);
      const projectId = createResponse.body.data.id;

      await prisma.projectTask.create({
        data: {
          projectId,
          assigneeId: 4,
          title: "Supervisor Task",
        },
      });

      const listResponse = await request(app)
        .get("/projects")
        .set(HEADERS.supervisor);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data.some(p => p.id === projectId)).toBe(true);
    });
  });
});
