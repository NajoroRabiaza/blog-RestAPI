import * as dotenv from "dotenv";

dotenv.config();

const requiredVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
] as const;

for (const variable of requiredVars) {
  if (!process.env[variable]) {
    console.error(`Variable d environnement manquante : ${variable}`);
    process.exit(1);
  }
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN as string;
const validExpiresInPattern = /^\d+[smhd]$/;
if (!validExpiresInPattern.test(jwtExpiresIn)) {
  console.error("JWT_EXPIRES_IN doit etre au format : 60s, 15m, 24h, 7d");
  process.exit(1);
}

export const env = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL as string,
  redisUrl: process.env.REDIS_URL as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: jwtExpiresIn,
  },
  cache: {
    // TTL du cache en secondes, defaut 10 minutes
    articlesTTL: parseInt(process.env.CACHE_ARTICLES_TTL ?? "600", 10),
  },
};