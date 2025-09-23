import tagService from "../services/tag.service";
import articleRepository from "../repositories/article.repository";
import AppError from "../utils/AppError";
import { AsyncController } from "../types";

const getAllTags: AsyncController = async (req, res, next) => {
  try {
    const { q } = req.query;

    const tags = q
      ? await tagService.searchTags(q as string)
      : await tagService.getAllTags();

    res.status(200).json({
      status: "success",
      data: { tags },
    });
  } catch (err) {
    next(err);
  }
};

const attachTagsToArticle: AsyncController = async (req, res, next) => {
  try {
    const articleId = parseInt(req.params.id as string, 10);
    if (isNaN(articleId)) {
      return next(new AppError("Identifiant d article invalide", 400));
    }

    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return next(new AppError("Le champ tags doit etre un tableau", 400));
    }

    await tagService.attachTagsToArticle(
      articleId,
      tags,
      req.user!.id,
      req.user!.role
    );

    // on retourne l'article complet avec les tags mis a jour
    const article = await articleRepository.findArticleById(articleId);

    res.status(200).json({
      status: "success",
      data: { article },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllTags,
  attachTagsToArticle,
};