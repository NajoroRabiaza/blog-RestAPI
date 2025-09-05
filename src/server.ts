import { env } from "./config/env";
import app from "./app";
import prisma from "./config/database";

const server = app.listen(env.port, () => {
  console.log(`Serveur demarre sur le port ${env.port} en mode ${env.nodeEnv}`);
});

// Capture des erreurs non gerees pour eviter un crash silencieux
process.on("uncaughtException", (err: Error) => {
  console.error("Erreur non capturee :", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Promise rejetee non geree :", reason);
  process.exit(1);
});

// Arret propre avec deconnexion Prisma sur SIGTERM
process.on("SIGTERM", () => {
  console.log("Signal SIGTERM recu, arret du serveur en cours...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Serveur et base de donnees arretes proprement");
    process.exit(0);
  });
});

// Arret propre avec deconnexion Prisma sur SIGINT
process.on("SIGINT", () => {
  console.log("Signal SIGINT recu, arret du serveur en cours...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Serveur et base de donnees arretes proprement");
    process.exit(0);
  });
});