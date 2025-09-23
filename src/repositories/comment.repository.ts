import prisma from "../config/database";
import { Prisma } from "@prisma/client";

// creation d'un commentaire sur un article
const createComment = async (data: {
  content: string;
  articleId: number;
  authorId: number;
}) => {
  return prisma.comment.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

// recuperation des commentaires d'un article avec pagination
const findCommentsByArticle = async (
  articleId: number,
  options: { page?: number; limit?: number } = {}
) => {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const [comments, total] = await prisma.$transaction([
    prisma.comment.findMany({
      where: { articleId },
      skip,
      take: limit,
      // tri chronologique croissant pour lire les commentaires dans l ordre
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
    prisma.comment.count({ where: { articleId } }),
  ]);

  return {
    comments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
};

// recherche d'un commentaire par id
const findCommentById = async (id: number) => {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

// suppression d'un commentaire par id
const deleteComment = async (id: number) => {
  try {
    return await prisma.comment.delete({
      where: { id },
    });
  } catch (err: any) {
    if (err.code === "P2025") {
      return null;
    }
    throw err;
  }
};

export default {
  createComment,
  findCommentsByArticle,
  findCommentById,
  deleteComment,
};