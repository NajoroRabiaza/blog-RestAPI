import articleRepository from "../repositories/article.repository";
import slugUtils from "../utils/slug";
import AppError from "../utils/AppError";

// verification de disponibilite d'un slug avec incrementation automatique du suffixe
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

// creation d'un article avec generation automatique du slug unique
const createArticle = async (data: {
  title: string;
  content: string;
  published?: boolean;
  authorId: number;
}) => {
  const slug = await resolveUniqueSlug(data.title);

  // on fusionne published et publishedAt dans un seul appel Prisma
  const article = await articleRepository.createArticle({
    title: data.title,
    slug,
    content: data.content,
    authorId: data.authorId,
    published: data.published ?? false,
    publishedAt: data.published ? new Date() : null,
  });

  return article;
};

// mise a jour d'un article avec regeneration du slug si le titre change
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

  // si on depublie un article on remet publishedAt a null
  if (data.published === false && existing.published) {
    updateData.publishedAt = null;
  }

  return articleRepository.updateArticle(id, updateData);
};

// suppression d'un article avec verification de propriete
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

export default { createArticle, updateArticle, deleteArticle, resolveUniqueSlug };