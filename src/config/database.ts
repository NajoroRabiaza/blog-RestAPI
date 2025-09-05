const { PrismaClient } = require("@prisma/client");

// singleton pour eviter plusieurs pools de connexions en developpement
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export default prisma;