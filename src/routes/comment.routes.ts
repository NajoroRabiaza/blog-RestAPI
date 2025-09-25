import { Router, IRouter } from "express";
import commentController from "../controllers/comment.controller";
import authenticate from "../middlewares/authenticate";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router({ mergeParams: true });

// GET /articles/:articleId/comments — liste des commentaires
router.get("/", commentController.getCommentsByArticle);

// POST /articles/:articleId/comments — ajout d'un commentaire
router.post(
  "/",
  authenticate,
  validate(validators.createCommentSchema),
  commentController.addComment
);

// PATCH /articles/:articleId/comments/:id — modification d'un commentaire
router.patch(
  "/:id",
  authenticate,
  validate(validators.updateCommentSchema),
  commentController.editComment
);

// DELETE /articles/:articleId/comments/:id — suppression d'un commentaire
router.delete(
  "/:id",
  authenticate,
  commentController.removeComment
);

export default router;