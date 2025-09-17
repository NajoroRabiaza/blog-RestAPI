import articleRepository from "../repositories/article.repository";
import slugUtils from "../utils/slug";
import AppError from "../utils/AppError";

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
}) => {
  const slug = await resolveUniqueSlug(data.title);

  return articleRepository.createArticle({
    title: data.title,
    slug,
    content: data.content,
    authorId: data.authorId,
    published: data.published ?? false,
    publishedAt: data.published ? new Date() : null,
  });
};

const updateArticle = async (
  id: number,
  authorId: number,
  role: string,
  data: Partial<{
    title: string;
    content: string;
    published: boolean;
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
  }> = { ...data };

  if (data.title && data.title !== existing.title) {
    updateData.slug = await resolveUniqueSlug(data.title);
  }
  if (data.published && !existing.published) {
    updateData.publishedAt = new Date();
  }

  if (data.published === false && existing.published) {
    updateData.publishedAt = null;
  }

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

  // un admin peut filtrer sur published explicitement
  // un non admin ne voit que les articles publies sauf les siens
  if (requesterRole !== "ADMIN") {
    const isOwnArticles =
      requesterId !== undefined &&
      options.authorId === requesterId;

    if (!isOwnArticles) {
      repositoryOptions.published = true;
    }
  }
  return articleRepository.findAllArticles(repositoryOptions);
};

// recuperation d'un article par slug avec incrementation des vues
const getArticleBySlug = async (
  slug: string,
  requesterId?: number
): Promise<NonNullable<Awaited<ReturnType<typeof articleRepository.findArticleBySlug>>>> => {
  const article = await articleRepository.findArticleBySlug(slug);

  if (!article) {
    throw new AppError("Article introuvable", 404);
  }
  // on n incremente les vues que si ce n est pas l auteur qui consulte
  if (!requesterId || requesterId !== article.authorId) {
    await articleRepository.incrementViews(article.id);
  }

  return article;
};

export default { createArticle, updateArticle, deleteArticle, getArticles, getArticleBySlug, resolveUniqueSlug };