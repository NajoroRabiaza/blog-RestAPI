import { Request, Response, NextFunction } from "express";

// type generique pour tous les controllers Express asynchrones du projet
export type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;