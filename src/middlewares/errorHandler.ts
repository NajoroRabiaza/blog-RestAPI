import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { env } from "../config/env";

/** Gestionnaire d erreurs global branche en dernier middleware dans app.ts */
const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    /** 4xx = fail (erreur du client), 5xx = error (erreur serveur) */
    const status = err.statusCode < 500 ? "fail" : "error";

    res.status(err.statusCode).json({
      status,
      message: err.message,
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    status: "error",
    message:
      env.nodeEnv === "development" ? err.message : "Une erreur est survenue",
  });
};

export default errorHandler;