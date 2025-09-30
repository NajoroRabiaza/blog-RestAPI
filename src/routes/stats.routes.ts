import { Router, IRouter } from "express";
import statsController from "../controllers/stats.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router: IRouter = Router();

/**
 * @swagger
 * /stats/me:
 *   get:
 *     summary: Statistiques de l utilisateur connecte
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de l auteur connecte
 *       401:
 *         description: Non authentifie
 */
router.get("/me", authenticate, statsController.getMyStats);

/**
 * @swagger
 * /stats/authors/{authorId}:
 *   get:
 *     summary: Statistiques d un auteur specifique
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statistiques de l auteur
 *       403:
 *         description: Acces refuse
 */
router.get("/authors/:authorId", authenticate, statsController.getAuthorStats);

/**
 * @swagger
 * /stats/global:
 *   get:
 *     summary: Statistiques globales de la plateforme, admin uniquement
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales
 *       403:
 *         description: Reserve aux administrateurs
 */
router.get(
  "/global",
  authenticate,
  authorize("ADMIN"),
  statsController.getGlobalStats
);

export default router;