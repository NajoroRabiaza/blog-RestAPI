import prisma from "../config/database";
import AppError from "../utils/AppError";

/**
 * Retourne les statistiques d un auteur specifique.
 * Inclut le nombre d articles, de vues totales et de commentaires recus.
 */
const getAuthorStats = async (authorId: number) => {
  const [articleStats, commentCount, totalArticles] =
    await prisma.$transaction([
      prisma.article.aggregate({
        where: {
          authorId,
          published: true,
        },
        _count: { id: true },
        _sum: { views: true },
      }),
      // correction : on ne compte que les commentaires sur articles publies
      prisma.comment.count({
        where: {
          article: {
            authorId,
            published: true,
          },
        },
      }),
      prisma.article.count({
        where: { authorId },
      }),
    ]);

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

/**
 * Retourne les statistiques globales de la plateforme.
 * Reserve aux utilisateurs avec le role ADMIN.
 */
const getGlobalStats = async () => {
  const [
    totalUsers,
    totalArticles,
    publishedArticles,
    totalComments,
    totalViewsResult,
    topArticles,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({ where: { published: true } }),
    prisma.comment.count(),
    prisma.article.aggregate({
      _sum: { views: true },
    }),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        _count: { select: { comments: true } },
        author: {
          select: { id: true, username: true },
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalArticles,
    publishedArticles,
    draftArticles: totalArticles - publishedArticles,
    totalComments,
    totalViews: totalViewsResult._sum.views ?? 0,
    topArticles,
  };
};

export default {
  getAuthorStats,
  getTopArticlesByAuthor,
  getGlobalStats,
};