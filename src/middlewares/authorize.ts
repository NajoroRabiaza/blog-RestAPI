import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

// roles disponibles dans l'appl alignés avec l'enum Prisma
type Role = "AUTHOR" | "ADMIN";

// middleware de verification de role, on utilise toujours apres authenticate
const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Utilisateur non authentifié", 401));
    }
    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AppError("Vous n'avez pas les droits pour cette action", 403)
      );
    }
    next();
  };
};

export default authorize;