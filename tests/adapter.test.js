import { createPrismaAdapter } from "../src/adapters/index.js";
import prisma from "../src/utils/prisma.js";

describe("createPrismaAdapter", () => {
  let adapter;

  beforeEach(() => {
    adapter = createPrismaAdapter(prisma);
  });

  test("createProject creates project and progress in same transaction", async () => {
    const data = {
      projectName: "Transaction Test Project",
      location: "Test Location",
      startDate: "2024-06-01",
      endDate: "2024-12-31",
      clientName: "Test Client",
      projectBudget: 100000,
      status: "PLANNING",
    };

    const result = await adapter.createProject({
      ownerUserId: 1,
      companyId: 1,
      data,
    });

    expect(result.projectName).toBe("Transaction Test Project");
    expect(result.progress).not.toBeNull();
    expect(result.progress.completionPercentage).toBe("0");

    const progressRecord = await prisma.projectProgress.findUnique({
      where: { projectId: result.id },
    });
    expect(progressRecord).not.toBeNull();
    expect(progressRecord.completionPercentage.toString()).toBe("0");
  });

  test("findProjectById returns null for non-existent project", async () => {
    const result = await adapter.findProjectById({ id: 99999, companyId: 1 });
    expect(result).toBeNull();
  });

  test("findProjectById returns null for wrong company", async () => {
    const data = {
      projectName: "Company Isolation Test",
      location: "Test Location",
      startDate: "2024-06-01",
      clientName: "Test Client",
      projectBudget: 50000,
      status: "PLANNING",
    };

    const project = await adapter.createProject({
      ownerUserId: 1,
      companyId: 1,
      data,
    });

    const result = await adapter.findProjectById({ id: project.id, companyId: 99 });
    expect(result).toBeNull();
  });

  test("findProjects filters by assignee for restricted roles", async () => {
    const data = {
      projectName: "Restricted Filter Test",
      location: "Test Location",
      startDate: "2024-06-01",
      clientName: "Test Client",
      projectBudget: 50000,
      status: "PLANNING",
    };

    await adapter.createProject({
      ownerUserId: 1,
      companyId: 1,
      data,
    });

    const result = await adapter.findProjects({
      companyId: 1,
      assigneeId: 999,
      roleIsRestricted: true,
    });

    expect(result).toEqual([]);
  });

  test("deleteProject removes project and cascades to progress", async () => {
    const data = {
      projectName: "Cascade Delete Test",
      location: "Test Location",
      startDate: "2024-06-01",
      clientName: "Test Client",
      projectBudget: 50000,
      status: "PLANNING",
    };

    const project = await adapter.createProject({
      ownerUserId: 1,
      companyId: 1,
      data,
    });

    await adapter.deleteProject({ id: project.id });

    const deletedProject = await prisma.project.findUnique({
      where: { id: project.id },
    });
    expect(deletedProject).toBeNull();

    const deletedProgress = await prisma.projectProgress.findUnique({
      where: { projectId: project.id },
    });
    expect(deletedProgress).toBeNull();
  });
});