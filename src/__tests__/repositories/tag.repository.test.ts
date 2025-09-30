import tagRepository from "../../repositories/tag.repository";

jest.mock("../../config/database", () => ({
  tag: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  articleTag: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
}));

jest.mock("../../utils/slug", () => ({
  default: {
    normalizeTagName: jest.fn((name: string) => name.toLowerCase().trim()),
    generateSlug: jest.fn(),
    generateUniqueSlug: jest.fn(),
  },
}));

import prisma from "../../config/database";

const mockTag = {
  id: 1,
  name: "javascript",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("findOrCreateTag", () => {
  it("doit normaliser le nom et faire un upsert", async () => {
    (prisma.tag.upsert as jest.Mock).mockResolvedValue(mockTag);

    const result = await tagRepository.findOrCreateTag("JavaScript");

    expect(prisma.tag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: "javascript" },
        create: { name: "javascript" },
      })
    );
    expect(result).toEqual(mockTag);
  });
});

describe("associateTagsToArticle", () => {
  it("doit supprimer les associations existantes et recreer les nouvelles", async () => {
    (prisma.articleTag.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.articleTag.createMany as jest.Mock).mockResolvedValue({ count: 3 });

    await tagRepository.associateTagsToArticle(1, [1, 2, 3]);

    expect(prisma.articleTag.deleteMany).toHaveBeenCalledWith({
      where: { articleId: 1 },
    });
    expect(prisma.articleTag.createMany).toHaveBeenCalledWith({
      data: [
        { articleId: 1, tagId: 1 },
        { articleId: 1, tagId: 2 },
        { articleId: 1, tagId: 3 },
      ],
      skipDuplicates: true,
    });
  });

  it("doit supprimer toutes les associations si tagIds est vide", async () => {
    (prisma.articleTag.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

    await tagRepository.associateTagsToArticle(1, []);

    expect(prisma.articleTag.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.articleTag.createMany).not.toHaveBeenCalled();
  });
});

describe("getAllTags", () => {
  it("doit retourner tous les tags tries par nom", async () => {
    const mockTags = [
      { ...mockTag, _count: { articles: 3 } },
      { id: 2, name: "typescript", createdAt: new Date(), updatedAt: new Date(), _count: { articles: 1 } },
    ];
    (prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

    const result = await tagRepository.getAllTags();

    expect(result).toHaveLength(2);
    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: "asc" } })
    );
  });
});

describe("searchTags", () => {
  it("doit chercher les tags par nom avec insensibilite a la casse", async () => {
    (prisma.tag.findMany as jest.Mock).mockResolvedValue([mockTag]);

    const result = await tagRepository.searchTags("java");

    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ mode: "insensitive" }),
        }),
        take: 10,
      })
    );
    expect(result).toHaveLength(1);
  });
});