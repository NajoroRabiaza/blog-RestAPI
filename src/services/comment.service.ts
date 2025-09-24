import commentRepository from "../repositories/comment.repository";
import articleRepository from "../repositories/article.repository";
import AppError from "../utils/AppError";

// ajout d'un commentaire sur un article publie
const addComment = async (data: {
  content: string;
  articleId: number;
  authorId: number;
}) => {
  const article = await articleRepository.findArticleById(data.articleId);
  if (!article) {
    throw new AppError("Article introuvable", 404);
  }

  // on refuse les commentaires sur les articles non publies
  if (!article.published) {
    throw new AppError(
      "Impossible de commenter un article non publie",
      403
    );
  }
  return commentRepository.createComment(data);
};

// recuperation des commentaires d'un article avec pagination
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

// modification d'un commentaire existant
const editComment = async (
  commentId: number,
  content: string,
  requesterId: number
) => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new AppError("Commentaire introuvable", 404);
  }

  // seul l'auteur peut modifier son commentaire
  if (comment.authorId !== requesterId) {
    throw new AppError(
      "Vous n avez pas les droits pour modifier ce commentaire",
      403
    );
  }
  return commentRepository.updateComment(commentId, content);
};

// suppression d'un commentaire avec verification de propriete
const removeComment = async (
  commentId: number,
  requesterId: number,
  requesterRole: string
): Promise<void> => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new AppError("Commentaire introuvable", 404);
  }

  // l'auteur du commentaire ou un admin peut le supprimer
  if (comment.authorId !== requesterId && requesterRole !== "ADMIN") {
    throw new AppError(
      "Vous n avez pas les droits pour supprimer ce commentaire",
      403
    );
  }
  await commentRepository.deleteComment(commentId);
};

export default {
  addComment,
  getCommentsByArticle,
  editComment,
  removeComment,
};