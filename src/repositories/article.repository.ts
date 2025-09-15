import prisma from "../config/database";

// creation d'un nouvel article en base avec ses tags associes
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

// recherche d'un article par id avec auteur et tags
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

// recherche d'un article par slug pour les URLs publiques
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

export default { createArticle, findArticleById, findArticleBySlug };