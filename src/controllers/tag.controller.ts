import tagService from "../services/tag.service";
import AppError from "../utils/AppError";
import { AsyncController } from "../types";

// liste de tous les tags avec leur nombre d articles
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

// association de tags a un article existant
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

    const updatedTags = await tagService.attachTagsToArticle(
      articleId,
      tags,
      req.user!.id,
      req.user!.role
    );

    res.status(200).json({
      status: "success",
      data: { tags: updatedTags },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllTags,
  attachTagsToArticle,
};