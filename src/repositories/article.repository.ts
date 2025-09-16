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

export default { createArticle, findArticleById, findArticleBySlug, findAllArticles };