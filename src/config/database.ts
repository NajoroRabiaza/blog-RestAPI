const { PrismaClient } = require("@prisma/client");

// Singleton Prisma pour eviter plusieurs instances en developpement
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export default prisma;