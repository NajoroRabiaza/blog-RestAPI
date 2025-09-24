import commentRepository from "../repositories/comment.repository";
import articleRepository from "../repositories/article.repository";
import AppError from "../utils/AppError";

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

  // verification que l'article parent existe encore avant suppression
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