import prisma from "../config/database";

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

// mise a jour du contenu d'un commentaire
const updateComment = async (id: number, content: string) => {
  try {
    return await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
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
  updateComment,
  deleteComment,
};