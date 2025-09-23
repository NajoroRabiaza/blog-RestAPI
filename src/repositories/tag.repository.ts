import prisma from "../config/database";
import slugUtils from "../utils/slug";

const findOrCreateTag = async (name: string) => {
  const normalizedName = slugUtils.normalizeTagName(name);
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

const searchTags = async (query: string) => {
  const normalizedQuery = slugUtils.normalizeTagName(query);

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

export default {
  findOrCreateTag,
  associateTagsToArticle,
  getTagsByArticle,
  getAllTags,
  searchTags,
};