import prisma from "../config/database";

const findOrCreateTag = async (name: string) => {
  const normalizedName = name.toLowerCase().trim();

  return prisma.tag.upsert({
    where: { name: normalizedName },
    update: {},
    create: { name: normalizedName },
  });
};

const associateTagsToArticle = async (
  articleId: number,
  tagIds: number[]
): Promise<void> => {
  await prisma.articleTag.deleteMany({
    where: { articleId },
  });

  if (tagIds.length === 0) return;

  await prisma.articleTag.createMany({
    data: tagIds.map((tagId) => ({ articleId, tagId })),
    skipDuplicates: true,
  });
};

const getTagsByArticle = async (articleId: number) => {
  return prisma.articleTag.findMany({
    where: { articleId },
    include: { tag: true },
  });
};

const getAllTags = async () => {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
};

// normalisation de la query avant la recherche
const searchTags = async (query: string) => {
  const normalizedQuery = query.toLowerCase().trim();
  return prisma.tag.findMany({
    where: {
      name: {
        contains: normalizedQuery,
        mode: "insensitive",
      },
    },
    take: 10,
    orderBy: { name: "asc" },
  });
};

export default { findOrCreateTag, associateTagsToArticle, getTagsByArticle, getAllTags, searchTags };