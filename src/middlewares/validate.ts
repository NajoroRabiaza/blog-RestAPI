import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import AppError from "../utils/AppError";

type ValidationSource = "body" | "query";

// middleware generique de validation Joi applicable sur body ou query
const validate = (schema: ObjectSchema, source: ValidationSource = "body") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = source === "query" ? req.query : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      // stripUnknown supprime les champs non declares dans le schema
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
    }

    // on remplace req.body ou req.query par la valeur validee et nettoyee
    if (source === "query") {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

export default validate;