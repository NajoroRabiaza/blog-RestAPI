import Redis from "ioredis";
import { env } from "./env";

const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    // delai exponentiel plafonné a 30 secondes entre chaque tentative
    return Math.min(times * 1000, 30000);
  },
});

redis.on("connect", () => {
  console.log("Connexion Redis etablie");
});

redis.on("error", (err: Error) => {
  console.error("Erreur Redis :", err.message);
});

redis.on("reconnecting", () => {
  console.log("Tentative de reconnexion Redis...");
});

export default redis;