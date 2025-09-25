import { Router, IRouter } from "express";
import commentController from "../controllers/comment.controller";
import authenticate from "../middlewares/authenticate";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router({ mergeParams: true });

router.get("/", commentController.getCommentsByArticle);

router.post(
  "/",
  authenticate,
  validate(validators.commentSchema),
  commentController.addComment
);

router.patch(
  "/:id",
  authenticate,
  validate(validators.commentSchema),
  commentController.editComment
);

router.delete(
  "/:id",
  authenticate,
  commentController.removeComment
);

export default router;