import prisma from "../src/utils/prisma.js";

afterAll(async () => {
  await prisma.$disconnect();
});
