import tagRepository from "../repositories/tag.repository";
import articleRepository from "../repositories/article.repository";
import slugUtils from "../utils/slug";
import AppError from "../utils/AppError";

const findOrCreateTag = async (name: string) => {
  if (!name || name.trim().length === 0) {
    throw new AppError("Le nom du tag ne peut pas etre vide", 400);
  }
  if (name.trim().length > 50) {
    throw new AppError("Le nom du tag ne peut pas depasser 50 caracteres", 400);
  }

  return tagRepository.findOrCreateTag(name);
};

const attachTagsToArticle = async (
  articleId: number,
  tagNames: string[],
  requesterId: number,
  requesterRole: string
) => {
  const article = await articleRepository.findArticleById(articleId);

  if (!article) {
    throw new AppError("Article introuvable", 404);
  }
  if (article.authorId !== requesterId && requesterRole !== "ADMIN") {
    throw new AppError(
      "Vous n avez pas les droits pour modifier les tags de cet article",
      403
    );
  }

  if (tagNames.length === 0) {
    await tagRepository.associateTagsToArticle(articleId, []);
    return [];
  }

  // deduplication avec la normalisation centralisee
  const uniqueNames = [
    ...new Set(tagNames.map((n) => slugUtils.normalizeTagName(n))),
  ];

  const tagRecords = await Promise.all(
    uniqueNames.map((name) => tagRepository.findOrCreateTag(name))
  );

  await tagRepository.associateTagsToArticle(
    articleId,
    tagRecords.map((t) => t.id)
  );
  return tagRepository.getTagsByArticle(articleId);
};

const getAllTags = async () => {
  return tagRepository.getAllTags();
};

const searchTags = async (query: string) => {
  if (!query || query.trim().length === 0) {
    return tagRepository.getAllTags();
  }
  return tagRepository.searchTags(query);
};

export default {
  findOrCreateTag,
  attachTagsToArticle,
  getAllTags,
  searchTags,
};