import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import { createProjectRouter } from "../src/factory/index.js";
import { ROLES, HEADERS, createProjectPayload } from "./fixtures.js";

describe("createProjectRouter factory", () => {
  test("mounts with default config and responds to GET /projects", async () => {
    const router = createProjectRouter();
    const app = express();
    app.use(express.json());
    app.use("/projects", router);

    const response = await request(app)
      .get("/projects")
      .set(HEADERS.admin);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("accepts custom authMiddleware", async () => {
    const mockAuth = (req, res, next) => {
      req.user = { id: 1, companyId: 1, role: ROLES.COMPANY_ADMIN };
      next();
    };

    const router = createProjectRouter({ authMiddleware: mockAuth });
    const app = express();
    app.use(express.json());
    app.use("/projects", router);

    const response = await request(app)
      .get("/projects");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("calls afterCreate hook when project is created", async () => {
    const mockHook = jest.fn();

    const router = createProjectRouter({
      hooks: { afterCreate: mockHook },
    });
    const app = express();
    app.use(express.json());
    app.use("/projects", router);

    const payload = createProjectPayload({ projectName: "Hook Test Project" });
    const response = await request(app)
      .post("/projects")
      .set(HEADERS.admin)
      .send(payload);

    expect(response.status).toBe(201);
    expect(mockHook).toHaveBeenCalled();
    expect(mockHook).toHaveBeenCalledWith(
      expect.objectContaining({ projectName: "Hook Test Project" }),
      expect.any(Object),
    );
  });

  test("calls beforeDelete hook when project is deleted", async () => {
    const mockHook = jest.fn();

    const router = createProjectRouter({
      hooks: { beforeDelete: mockHook },
    });
    const app = express();
    app.use(express.json());
    app.use("/projects", router);

    const payload = createProjectPayload({ projectName: "Delete Hook Test" });
    const createResponse = await request(app)
      .post("/projects")
      .set(HEADERS.admin)
      .send(payload);
    const projectId = createResponse.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/projects/${projectId}`)
      .set(HEADERS.admin);

    expect(deleteResponse.status).toBe(200);
    expect(mockHook).toHaveBeenCalled();
    expect(mockHook).toHaveBeenCalledWith(
      expect.objectContaining({ id: projectId }),
      expect.any(Object),
    );
  });

  test("works without hooks (backward compatible)", async () => {
    const router = createProjectRouter();
    const app = express();
    app.use(express.json());
    app.use("/projects", router);

    const payload = createProjectPayload({ projectName: "No Hooks Test" });
    const createResponse = await request(app)
      .post("/projects")
      .set(HEADERS.admin)
      .send(payload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);

    const projectId = createResponse.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/projects/${projectId}`)
      .set(HEADERS.admin);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
  });
});