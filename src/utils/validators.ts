import Joi from "joi";

// schema de validation pour l'inscription d'un nouvel user
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "L email fourni n est pas valide",
    "any.required": "L email est obligatoire",
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/)
    .required()
    .messages({
      "string.min": "Le mot de passe doit contenir au moins 8 caracteres",
      "string.pattern.base":
        "Le mot de passe doit contenir au moins une lettre et un chiffre",
      "any.required": "Le mot de passe est obligatoire",
    }),
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      "string.min": "Le nom d utilisateur doit contenir au moins 3 caracteres",
      "string.max": "Le nom d utilisateur ne peut pas depasser 30 caracteres",
      "string.pattern.base":
        "Le nom d utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores",
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

// schema de validation pour la creation d'un article
const createArticleSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Le titre doit contenir au moins 3 caracteres",
    "string.max": "Le titre ne peut pas depasser 200 caracteres",
    "any.required": "Le titre est obligatoire",
  }),
  content: Joi.string().min(10).required().messages({
    "string.min": "Le contenu doit contenir au moins 10 caracteres",
    "any.required": "Le contenu est obligatoire",
  }),
  published: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string().min(1).max(50)).max(10).default([]),
});

// schema de validation pour la mise a jour partielle d'un article
const updateArticleSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    "string.min": "Le titre doit contenir au moins 3 caracteres",
    "string.max": "Le titre ne peut pas depasser 200 caracteres",
  }),
  content: Joi.string().min(10).messages({
    "string.min": "Le contenu doit contenir au moins 10 caracteres",
  }),
  published: Joi.boolean(),
  tags: Joi.array().items(Joi.string().min(1).max(50)).max(10),
}).min(1);

export default {
  registerSchema,
  loginSchema,
  createArticleSchema,
  updateArticleSchema,
};