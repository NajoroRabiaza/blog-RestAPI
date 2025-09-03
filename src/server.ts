import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  console.log(`Serveur demarre sur le port ${env.port} en mode ${env.nodeEnv}`);
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