import * as dotenv from "dotenv";

dotenv.config();

/** Variables d environnement validees et typees exportees pour toute l application */
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

export const env = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL as string,
  redisUrl: process.env.REDIS_URL as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN as string,
  },
};