import prisma from "../src/utils/prisma.js";

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@test.com",
      role: "COMPANY_ADMIN",
      companyId: 1,
    },
  });
  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      firstName: "Manager",
      lastName: "User",
      email: "manager@test.com",
      role: "PROJECT_MANAGER",
      companyId: 1,
    },
  });
  await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      firstName: "Engineer",
      lastName: "User",
      email: "engineer@test.com",
      role: "SITE_ENGINEER",
      companyId: 1,
    },
  });
  await prisma.user.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      firstName: "Supervisor",
      lastName: "User",
      email: "supervisor@test.com",
      role: "SITE_SUPERVISOR",
      companyId: 1,
    },
  });
});

afterEach(async () => {
  await prisma.projectTask.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.project.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
