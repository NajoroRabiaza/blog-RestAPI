import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import AppError from "../utils/AppError";

// middleware generique de validation Joi applicable sur n'importe quelle route
const validate = (schema: ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // on concatene tous les messages d'erreur en une seule chaine lisible
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
    }
    next();
  };
};

export default validate;