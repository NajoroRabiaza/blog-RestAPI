import { Router, IRouter } from "express";
import statsController from "../controllers/stats.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router: IRouter = Router();

// GET /stats/me — statistique de l'user connecté
router.get(
  "/me",
  authenticate,
  statsController.getMyStats
);

// GET /stats/authors/:authorId — statistiques d'un auteur specifique
router.get(
  "/authors/:authorId",
  authenticate,
  statsController.getAuthorStats
);

// GET /stats/global — statistiques globales, admin uniquement
router.get(
  "/global",
  authenticate,
  authorize("ADMIN"),
  statsController.getGlobalStats
);

export default router;