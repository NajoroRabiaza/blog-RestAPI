import prisma from "../config/database";
import { Prisma } from "@prisma/client";

// rechercher un tag par son nom ou le cree s'il n existe pas
const findOrCreateTag = async (name: string) => {
  const normalizedName = name.toLowerCase().trim();

  return prisma.tag.upsert({
    where: { name: normalizedName },
    update: {},
    create: { name: normalizedName },
  });
};

// association de plusieurs tags à un article en ignorant les doublons
const associateTagsToArticle = async (
  articleId: number,
  tagIds: number[]
): Promise<void> => {
  // on supprime les associations existantes avant de recreer
  await prisma.articleTag.deleteMany({
    where: { articleId },
  });

  if (tagIds.length === 0) return;

  await prisma.articleTag.createMany({
    data: tagIds.map((tagId) => ({ articleId, tagId })),
    skipDuplicates: true,
  });
};

// recuperation de tous les tags d'un article
const getTagsByArticle = async (articleId: number) => {
  return prisma.articleTag.findMany({
    where: { articleId },
    include: {
      tag: true,
    },
  });
};

// recuperation de tous les tags existants avec le nombre d articles associes
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

// recherche des tags par nom partiel pour l'autocompletion
const searchTags = async (query: string) => {
  return prisma.tag.findMany({
    where: {
      name: {
        contains: query.toLowerCase().trim(),
        mode: "insensitive",
      },
    },
    take: 10,
    orderBy: { name: "asc" },
  });
};

export default { findOrCreateTag, associateTagsToArticle, getTagsByArticle, getAllTags, searchTags };