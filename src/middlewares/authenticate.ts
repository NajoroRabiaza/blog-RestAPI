import { Request, Response, NextFunction } from "express";
import jwtUtils from "../utils/jwt";
import redis from "../config/redis";
import AppError from "../utils/AppError";

// extension de l'interface Request pour ajouter l'utilisateur authentifie
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

    // verification si le token est en blacklist Redis
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new AppError("Token invalide ou expire", 401));
    }

    const payload = jwtUtils.verifyToken(token);
    if (!payload) {
      return next(new AppError("Token invalide ou expire", 401));
    }

    // decoration de req.user pour les middlewares et controllers suivants
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