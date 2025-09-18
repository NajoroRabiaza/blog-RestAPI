import { Router, IRouter } from "express";
import articleController from "../controllers/article.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router();

// GET /articles — liste publique avec filtres et pagination
router.get("/", articleController.getArticles);

// GET /articles/:slug — detail d'un article par son slug
router.get("/:slug", articleController.getArticleBySlug);

// POST /articles — creation d'un article, authentification requise
router.post(
  "/",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  validate(validators.createArticleSchema),
  articleController.createArticle
);

// PATCH /articles/:id — mise a jour partielle, auteur ou admin uniquement
router.patch(
  "/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  validate(validators.updateArticleSchema),
  articleController.updateArticle
);

// DELETE /articles/:id — suppression, auteur ou admin uniquement
router.delete(
  "/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  articleController.deleteArticle
);

export default router;