import statsService from "../services/stats.service";
import AppError from "../utils/AppError";
import { AsyncController } from "../types";

/**
 * Retourne les statistiques de l'utilisateur connecte.
 */
const getMyStats: AsyncController = async (req, res, next) => {
  try {
    const authorId = req.user!.id;
    const [stats, topArticles] = await Promise.all([
      statsService.getAuthorStats(authorId),
      statsService.getTopArticlesByAuthor(authorId),
    ]);

    res.status(200).json({
      status: "success",
      data: { stats, topArticles },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retourne les statistiques d'un auteur specifique par son id.
 * Accessible par l'auteur lui meme ou un ADMIN.
 */
const getAuthorStats: AsyncController = async (req, res, next) => {
  try {
    const authorId = parseInt(req.params.authorId as string, 10);
    if (isNaN(authorId)) {
      return next(new AppError("Identifiant d auteur invalide", 400));
    }

    // un auteur ne peut voir que ses propres stats
    if (req.user!.role !== "ADMIN" && req.user!.id !== authorId) {
      return next(
        new AppError("Vous n avez pas acces aux statistiques de cet auteur", 403)
      );
    }

    const [stats, topArticles] = await Promise.all([
      statsService.getAuthorStats(authorId),
      statsService.getTopArticlesByAuthor(authorId),
    ]);

    res.status(200).json({
      status: "success",
      data: { stats, topArticles },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retourne les statistiques globales de la plateforme.
 * Reserve aux ADMIN uniquement.
 */
const getGlobalStats: AsyncController = async (req, res, next) => {
  try {
    const stats = await statsService.getGlobalStats();

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getMyStats,
  getAuthorStats,
  getGlobalStats,
};