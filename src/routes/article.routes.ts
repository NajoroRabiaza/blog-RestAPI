import { Router, IRouter } from "express";
import articleController from "../controllers/article.controller";
import tagController from "../controllers/tag.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router();

router.get(
  "/",
  validate(validators.getArticlesSchema, "query"),
  articleController.getArticles
);

router.get("/:slug", articleController.getArticleBySlug);

router.post(
  "/",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  validate(validators.createArticleSchema),
  articleController.createArticle
);

router.patch(
  "/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  validate(validators.updateArticleSchema),
  articleController.updateArticle
);

router.delete(
  "/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  articleController.deleteArticle
);

// POST /articles/:id/tags — mise a jour des tags d'un article
router.post(
  "/:id/tags",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  tagController.attachTagsToArticle
);

export default router;