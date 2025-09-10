import Joi from "joi";

// schema de validation pour l'inscription d un nouvel user
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "L email fourni n est pas valide",
    "any.required": "L email est obligatoire",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])/)
    .required()
    .messages({
      "string.min": "Le mot de passe doit contenir au moins 8 caracteres",
      "string.pattern.base":
        "Le mot de passe doit contenir au moins une lettre et un chiffre",
      "any.required": "Le mot de passe est obligatoire",
    }),
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Le nom d utilisateur doit contenir au moins 3 caracteres",
    "string.max": "Le nom d utilisateur ne peut pas depasser 30 caracteres",
    "any.required": "Le nom d utilisateur est obligatoire",
  }),
});

// schema de validation pour la connexion
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "L email fourni n est pas valide",
    "any.required": "L email est obligatoire",
  }),
  password: Joi.string().required().messages({
    "any.required": "Le mot de passe est obligatoire",
  }),
});

export default {
  registerSchema,
  loginSchema,
};