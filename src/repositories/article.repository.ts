import prisma from "../config/database";
import { Prisma } from "@prisma/client";

interface FindAllOptions {
  published?: boolean;
  authorId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title" | "views";
  sortOrder?: "asc" | "desc";
}

const createArticle = async (data: {
    title: string;
    slug: string;
    content: string;
    authorId: number;
    published?: boolean;
    publishedAt?: Date | null;
  }) => {
    return prisma.article.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
};

const findArticleById = async (id: number) => {
  return prisma.article.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });
};

const findArticleBySlug = async (slug: string) => {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });
};

const findAllArticles = async (options: FindAllOptions = {}) => {
  const {
    published,
    authorId,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // type Prisma correct pour la clause where
  const where: Prisma.ArticleWhereInput = {};

  if (published !== undefined) {
    where.published = published;
  }
  if (authorId !== undefined) {
    where.authorId = authorId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
    hasNextPage: safePage < Math.ceil(total / safeLimit),
    hasPreviousPage: safePage > 1,
  };
};

// mise a jour partielle d'un article, seuls les champs fournis sont modifies
const updateArticle = async (
    id: number,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      published: boolean;
      publishedAt: Date | null;
    }>
  ) => {
    try {
      return await prisma.article.update({
        where: { id },
        data,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    } catch (err: any) {
      if (err.code === "P2025") {
        return null;
      }
      throw err;
    }
};
  
// suppression d'un article et de ses donnees associees en cascade
const deleteArticle = async (id: number) => {
    try {
      return await prisma.article.delete({
        where: { id },
      });
    } catch (err: any) {
      // P2025 = record not found dans Prisma
      if (err.code === "P2025") {
        return null;
      }
      throw err;
    }
};
  
// incrementation du compteur de vues de facon atomique
const incrementViews = async (id: number) => {
    return prisma.article.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
      select: { views: true },
    });
};

export default {
    createArticle,
    findArticleById,
    findArticleBySlug,
    findAllArticles,
    updateArticle,
    deleteArticle,
    incrementViews,
};