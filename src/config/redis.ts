import Redis from "ioredis";
import { env } from "./env";

// singleton Redis pour eviter plusieurs connexions simultanees
const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("Connexion Redis etablie");
});

redis.on("error", (err: Error) => {
  console.error("Erreur Redis :", err.message);
});

export default redis;