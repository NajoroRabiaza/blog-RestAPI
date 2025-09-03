import { env } from "./config/env";
import app from "./app";

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

// Arret propre du serveur sur signal SIGTERM
process.on("SIGTERM", () => {
  console.log("Signal SIGTERM recu, arret du serveur en cours...");
  server.close(() => {
    console.log("Serveur arrete proprement");
    process.exit(0);
  });
});

// Arret propre du serveur sur signal SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("Signal SIGINT recu, arret du serveur en cours...");
  server.close(() => {
    console.log("Serveur arrete proprement");
    process.exit(0);
  });
});