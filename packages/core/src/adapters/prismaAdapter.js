// src/adapters/prismaAdapter.js
// Database adapter that abstracts Prisma queries

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
};

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

export const createPrismaAdapter = (prismaClient) => ({
  findProjectById: async ({ id, companyId }) => {
    const project = await prismaClient.project.findFirst({
      where: { id, companyId },
    });
    return project || null;
  },

  findProjects: async ({ companyId, assigneeId, roleIsRestricted }) => {
    const where = roleIsRestricted
      ? {
          companyId,
          tasks: {
            some: { assigneeId },
          },
        }
      : { companyId };

    const projects = await prismaClient.project.findMany({
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

  createProject: async ({ ownerUserId, companyId, data }) => {
    const result = await prismaClient.$transaction(async (tx) => {
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

  updateProject: async ({ id, updateData }) => {
    const updated = await prismaClient.project.update({
      where: { id },
      data: updateData,
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
    });

    return serializeProject(updated);
  },

  deleteProject: async ({ id }) => {
    await prismaClient.project.delete({
      where: { id },
    });
    return true;
  },

  findProjectWithTasks: async ({ id, companyId, assigneeId, roleIsRestricted }) => {
    const where = roleIsRestricted
      ? {
          id,
          companyId,
          tasks: {
            some: { assigneeId },
          },
        }
      : { id, companyId };

    const project = await prismaClient.project.findFirst({
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
});