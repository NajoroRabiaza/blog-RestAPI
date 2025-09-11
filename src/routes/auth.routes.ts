import { Router, IRouter } from "express";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router();

// POST /auth/register — inscription d'un nouvel user
router.post(
  "/register",
  validate(validators.registerSchema),
  authController.register
);

// POST /auth/login — connexion et generation du token JWT
router.post(
  "/login",
  validate(validators.loginSchema),
  authController.login
);

// POST /auth/logout — invalidation du token en blacklist Redis
router.post("/logout", authController.logout);

export default router;