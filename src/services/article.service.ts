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

  const article = await articleRepository.createArticle({
    title: data.title,
    slug,
    content: data.content,
    authorId: data.authorId,
  });

  // si l'article est publié on enregistre la date de publication
  if (data.published) {
    await articleRepository.updateArticle(article.id, {
      published: true,
      publishedAt: new Date(),
    });
  }
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
  // seul l'auteur ou un admin peut modifier l'article
  if (existing.authorId !== authorId && role !== "ADMIN") {
    throw new AppError("Vous n avez pas les droits pour modifier cet article", 403);
  }

  const updateData: any = { ...data };

  // regeneration du slug uniquement si le titre a change
  if (data.title && data.title !== existing.title) {
    updateData.slug = await resolveUniqueSlug(data.title);
  }
  // mise a jour de publishedAt si on publie pour la premiere fois
  if (data.published && !existing.published) {
    updateData.publishedAt = new Date();
  }
  return articleRepository.updateArticle(id, updateData);
};

export default { createArticle, updateArticle, resolveUniqueSlug };