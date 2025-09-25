import commentService from "../services/comment.service";
import AppError from "../utils/AppError";
import { AsyncController } from "../types";

// ajout d'un commentaire sur un article
const addComment: AsyncController = async (req, res, next) => {
  try {
    const articleId = parseInt(req.params.articleId as string, 10);
    if (isNaN(articleId)) {
      return next(new AppError("Identifiant d article invalide", 400));
    }

    const { content } = req.body;
    const comment = await commentService.addComment({
      content,
      articleId,
      authorId: req.user!.id,
    });

    res.status(201).json({
      status: "success",
      data: { comment },
    });
  } catch (err) {
    next(err);
  }
};

// liste des commentaires d'un article avec pagination
const getCommentsByArticle: AsyncController = async (req, res, next) => {
  try {
    const articleId = parseInt(req.params.articleId as string, 10);
    if (isNaN(articleId)) {
      return next(new AppError("Identifiant d article invalide", 400));
    }

    const { page, limit } = req.query;
    const result = await commentService.getCommentsByArticle(articleId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// modification d'un commentaire
const editComment: AsyncController = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id as string, 10);
    if (isNaN(commentId)) {
      return next(new AppError("Identifiant de commentaire invalide", 400));
    }

    const { content } = req.body;
    const comment = await commentService.editComment(
      commentId,
      content,
      req.user!.id
    );

    res.status(200).json({
      status: "success",
      data: { comment },
    });
  } catch (err) {
    next(err);
  }
};

// suppression d'un commentaire
const removeComment: AsyncController = async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id as string, 10);
    if (isNaN(commentId)) {
      return next(new AppError("Identifiant de commentaire invalide", 400));
    }

    await commentService.removeComment(
      commentId,
      req.user!.id,
      req.user!.role
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default {
  addComment,
  getCommentsByArticle,
  editComment,
  removeComment,
};