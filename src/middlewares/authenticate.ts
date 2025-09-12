import { Request, Response, NextFunction } from "express";
import jwtUtils from "../utils/jwt";
import redis from "../config/redis";
import AppError from "../utils/AppError";
import { env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Token d authentification manquant", 401));
    }

    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return next(new AppError("Token d authentification manquant", 401));
    }

    // si Redis est indisponible on log et on continue sans verifier la blacklist
    try {
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return next(new AppError("Token invalide ou expire", 401));
      }
    } catch (redisErr) {
      if (env.nodeEnv === "development") {
        console.error("Redis indisponible, verification blacklist ignoree :", redisErr);
      }
    }

    const payload = jwtUtils.verifyToken(token);
    if (!payload) {
      return next(new AppError("Token invalide ou expire", 401));
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;