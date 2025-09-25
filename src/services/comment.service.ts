import commentRepository from "../repositories/comment.repository";
import articleRepository from "../repositories/article.repository";
import AppError from "../utils/AppError";

/**
 * Ajoute un commentaire sur un article publie.
 * Refuse si l article n existe pas ou n est pas publie.
 */
const addComment = async (data: {
  content: string;
  articleId: number;
  authorId: number;
}) => {
  const article = await articleRepository.findArticleById(data.articleId);
  if (!article) {
    throw new AppError("Article introuvable", 404);
  }

  if (!article.published) {
    throw new AppError(
      "Impossible de commenter un article non publie",
      403
    );
  }
  return commentRepository.createComment(data);
};

/**
 * Retourne les commentaires d un article avec pagination.
 * Verifie que l article existe avant de chercher ses commentaires.
 */
const getCommentsByArticle = async (
  articleId: number,
  options: { page?: number; limit?: number } = {}
) => {
  const article = await articleRepository.findArticleById(articleId);

  if (!article) {
    throw new AppError("Article introuvable", 404);
  }
  return commentRepository.findCommentsByArticle(articleId, options);
};

/**
 * Modifie le contenu d un commentaire.
 * Seul l auteur du commentaire peut le modifier.
 */
const editComment = async (
  commentId: number,
  content: string,
  requesterId: number
) => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new AppError("Commentaire introuvable", 404);
  }

  if (comment.authorId !== requesterId) {
    throw new AppError(
      "Vous n avez pas les droits pour modifier ce commentaire",
      403
    );
  }
  return commentRepository.updateComment(commentId, content);
};

/**
 * Supprime un commentaire.
 * L auteur ou un ADMIN peut supprimer un commentaire.
 */
const removeComment = async (
  commentId: number,
  requesterId: number,
  requesterRole: string
): Promise<void> => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new AppError("Commentaire introuvable", 404);
  }

  if (comment.authorId !== requesterId && requesterRole !== "ADMIN") {
    throw new AppError(
      "Vous n avez pas les droits pour supprimer ce commentaire",
      403
    );
  }

  const article = await articleRepository.findArticleById(comment.articleId);
  if (!article) {
    throw new AppError("L article associe a ce commentaire n existe plus", 404);
  }
  await commentRepository.deleteComment(commentId);
};

export default {
  addComment,
  getCommentsByArticle,
  editComment,
  removeComment,
};