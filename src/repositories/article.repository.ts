import prisma from "../config/database";

// options de filtrage pour la liste des articles
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

// liste paginee des articles avec filtres optionnels et tri
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

  const where: any = {};

  if (published !== undefined) {
    where.published = published;
  }
  if (authorId !== undefined) {
    where.authorId = authorId;
  }

  // recherche insensible a la casse dans le titre et le contenu
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));
  const take = Math.min(100, Math.max(1, limit));

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      skip,
      take,
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
    page: Math.max(1, page),
    limit: take,
    totalPages: Math.ceil(total / take),
    hasNextPage: Math.max(1, page) < Math.ceil(total / take),
    hasPreviousPage: Math.max(1, page) > 1,
  };
};

export default { createArticle, findArticleById, findArticleBySlug, findAllArticles };