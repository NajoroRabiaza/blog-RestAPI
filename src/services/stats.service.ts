import prisma from "../config/database";
import AppError from "../utils/AppError";

/**
 * Retourne les statistiques d un auteur specifique.
 * Inclut le nombre d articles, de vues totales et de commentaires recus.
 */
const getAuthorStats = async (authorId: number) => {
  const [articleStats, commentCount] = await prisma.$transaction([
    prisma.article.aggregate({
      where: {
        authorId,
        // on exclut les articles supprimes et on ne compte que les publies
        published: true,
      },
      _count: { id: true },
      _sum: { views: true },
    }),
    prisma.comment.count({
      where: {
        article: {
          authorId,
          published: true,
        },
      },
    }),
  ]);

  const totalArticles = await prisma.article.count({
    where: { authorId },
  });

  const publishedArticles = articleStats._count.id;
  const totalViews = articleStats._sum.views ?? 0;

  return {
    authorId,
    totalArticles,
    publishedArticles,
    draftArticles: totalArticles - publishedArticles,
    totalViews,
    totalComments: commentCount,
    averageViewsPerArticle:
      publishedArticles > 0
        ? Math.round(totalViews / publishedArticles)
        : 0,
  };
};

/**
 * Retourne les articles les plus vus de l auteur.
 */
const getTopArticlesByAuthor = async (
  authorId: number,
  limit: number = 5
) => {
  return prisma.article.findMany({
    where: {
      authorId,
      published: true,
    },
    orderBy: { views: "desc" },
    take: Math.min(20, Math.max(1, limit)),
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      publishedAt: true,
      _count: {
        select: { comments: true },
      },
    },
  });
};

export default {
  getAuthorStats,
  getTopArticlesByAuthor,
};