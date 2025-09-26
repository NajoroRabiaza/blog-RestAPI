import articleRepository from "../repositories/article.repository";
import tagRepository from "../repositories/tag.repository";
import slugUtils from "../utils/slug";
import AppError from "../utils/AppError";
import redis from "../config/redis";

// duree du cache en secondes
const CACHE_TTL = 600;

// generation d une cle de cache unique par utilisateur et filtres
const buildCacheKey = (options: Record<string, unknown>): string => {
  const sorted = Object.keys(options)
    .sort()
    .reduce((acc, key) => {
      if (options[key] !== undefined) {
        acc[key] = options[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

  return `articles:${JSON.stringify(sorted)}`;
};

const resolveUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = slugUtils.generateSlug(title);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await articleRepository.findArticleBySlug(slug);
    if (!existing) break;
    slug = slugUtils.generateUniqueSlug(title, suffix);
    suffix++;
  }
  return slug;
};

const createArticle = async (data: {
  title: string;
  content: string;
  published?: boolean;
  authorId: number;
  tags?: string[];
}) => {
  const slug = await resolveUniqueSlug(data.title);

  const article = await articleRepository.createArticle({
    title: data.title,
    slug,
    content: data.content,
    authorId: data.authorId,
    published: data.published ?? false,
    publishedAt: data.published ? new Date() : null,
  });

  if (data.tags && data.tags.length > 0) {
    const tagRecords = await Promise.all(
      data.tags.map((name) => tagRepository.findOrCreateTag(name))
    );
    await tagRepository.associateTagsToArticle(
      article.id,
      tagRecords.map((t) => t.id)
    );
  }

  // invalidation du cache apres creation
  await invalidateArticleCache();

  return articleRepository.findArticleById(article.id);
};

const updateArticle = async (
  id: number,
  authorId: number,
  role: string,
  data: Partial<{
    title: string;
    content: string;
    published: boolean;
    tags: string[];
  }>
) => {
  const existing = await articleRepository.findArticleById(id);

  if (!existing) {
    throw new AppError("Article introuvable", 404);
  }
  if (existing.authorId !== authorId && role !== "ADMIN") {
    throw new AppError("Vous n avez pas les droits pour modifier cet article", 403);
  }

  const updateData: Partial<{
    title: string;
    slug: string;
    content: string;
    published: boolean;
    publishedAt: Date | null;
  }> = {};

  if (data.title) updateData.title = data.title;
  if (data.content) updateData.content = data.content;
  if (data.published !== undefined) updateData.published = data.published;

  if (data.title && data.title !== existing.title) {
    updateData.slug = await resolveUniqueSlug(data.title);
  }
  if (data.published && !existing.published) {
    updateData.publishedAt = new Date();
  }

  if (data.published === false && existing.published) {
    updateData.publishedAt = null;
  }

  if (data.tags !== undefined) {
    const tagRecords = await Promise.all(
      data.tags.map((name) => tagRepository.findOrCreateTag(name))
    );
    await tagRepository.associateTagsToArticle(
      id,
      tagRecords.map((t) => t.id)
    );
  }

  // invalidation du cache apres modification
  await invalidateArticleCache();

  return articleRepository.updateArticle(id, updateData);
};

const deleteArticle = async (
  id: number,
  authorId: number,
  role: string
): Promise<void> => {
  const existing = await articleRepository.findArticleById(id);

  if (!existing) {
    throw new AppError("Article introuvable", 404);
  }
  if (existing.authorId !== authorId && role !== "ADMIN") {
    throw new AppError("Vous n avez pas les droits pour supprimer cet article", 403);
  }

  await articleRepository.deleteArticle(id);

  // invalidation du cache apres suppression
  await invalidateArticleCache();
};

// invalidation de toutes les cles de cache des articles
const invalidateArticleCache = async (): Promise<void> => {
  try {
    const keys = await redis.keys("articles:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // on ne bloque pas si Redis est indisponible
  }
};

const getArticles = async (options: {
  published?: boolean;
  authorId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title" | "views";
  sortOrder?: "asc" | "desc";
  requesterId?: number;
  requesterRole?: string;
}) => {
  const { requesterId, requesterRole, ...repositoryOptions } = options;

  if (requesterRole !== "ADMIN") {
    const isOwnArticles =
      requesterId !== undefined && options.authorId === requesterId;

    if (!isOwnArticles) {
      repositoryOptions.published = true;
    }
  }

  // tentative de lecture depuis le cache
  const cacheKey = buildCacheKey({ ...repositoryOptions, requesterId, requesterRole });

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // cache miss ou Redis indisponible, on continue vers la base
  }

  const result = await articleRepository.findAllArticles(repositoryOptions);

  // mise en cache du resultat
  try {
    await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);
  } catch {
    // on ne bloque pas si Redis est indisponible
  }

  return result;
};

const getArticleBySlug = async (
  slug: string,
  requesterId?: number
): Promise<NonNullable<Awaited<ReturnType<typeof articleRepository.findArticleBySlug>>>> => {
  const article = await articleRepository.findArticleBySlug(slug);

  if (!article) {
    throw new AppError("Article introuvable", 404);
  }
  if (!requesterId || requesterId !== article.authorId) {
    await articleRepository.incrementViews(article.id);
  }

  return article;
};

export default {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticles,
  getArticleBySlug,
  resolveUniqueSlug,
};