import { Router, IRouter } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, username]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               username:
 *                 type: string
 *                 minLength: 3
 *     responses:
 *       201:
 *         description: Utilisateur cree avec succes
 *       409:
 *         description: Email deja utilise
 */
router.post(
  "/register",
  validate(validators.registerSchema),
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d un utilisateur existant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion reussie avec token JWT
 *       401:
 *         description: Credentials invalides
 */
router.post(
  "/login",
  validate(validators.loginSchema),
  authController.login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Deconnexion et invalidation du token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deconnexion reussie
 *       400:
 *         description: Token manquant
 */
router.post("/logout", authController.logout);

export default router;