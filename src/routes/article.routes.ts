import { Router, IRouter } from "express";
import articleController from "../controllers/article.controller";
import tagController from "../controllers/tag.controller";
import commentRoutes from "./comment.routes";
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

router.post(
  "/:id/tags",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  tagController.attachTagsToArticle
);

// routes des commentaires imbriquees sous les articles
router.use("/:articleId/comments", commentRoutes);

export default router;