import articleRepository from "../../repositories/article.repository";

jest.mock("../../config/database", () => ({
  article: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}));

import prisma from "../../config/database";

const mockArticle = {
  id: 1,
  title: "Mon article",
  slug: "mon-article",
  content: "Contenu de l article",
  published: false,
  publishedAt: null,
  views: 0,
  authorId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 1, username: "testuser", email: "test@example.com" },
  tags: [],
  _count: { comments: 0 },
};

describe("createArticle", () => {
  it("doit creer un article et le retourner avec auteur et tags", async () => {
    (prisma.article.create as jest.Mock).mockResolvedValue(mockArticle);

    const result = await articleRepository.createArticle({
      title: "Mon article",
      slug: "mon-article",
      content: "Contenu de l article",
      authorId: 1,
    });

    expect(result).toEqual(mockArticle);
    expect(prisma.article.create).toHaveBeenCalledTimes(1);
  });
});

describe("findArticleById", () => {
  it("doit retourner un article existant", async () => {
    (prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle);

    const result = await articleRepository.findArticleById(1);

    expect(result).toEqual(mockArticle);
  });

  it("doit retourner null si l'article n'existe pas", async () => {
    (prisma.article.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await articleRepository.findArticleById(999);

    expect(result).toBeNull();
  });
});

describe("findAllArticles", () => {
  it("doit retourner une liste paginee d'articles", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      [mockArticle],
      1,
    ]);

    const result = await articleRepository.findAllArticles({ page: 1, limit: 10 });

    expect(result.articles).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });

  it("doit retourner hasNextPage true si il y a plus de resultats", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      [mockArticle],
      25,
    ]);

    const result = await articleRepository.findAllArticles({ page: 1, limit: 10 });

    expect(result.hasNextPage).toBe(true);
    expect(result.totalPages).toBe(3);
  });

  it("doit retourner totalPages 0 si aucun article", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

    const result = await articleRepository.findAllArticles();

    expect(result.articles).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

describe("deleteArticle", () => {
  it("doit retourner null si l'article n'existe pas", async () => {
    const prismaError = { code: "P2025" };
    (prisma.article.delete as jest.Mock).mockRejectedValue(prismaError);

    const result = await articleRepository.deleteArticle(999);

    expect(result).toBeNull();
  });

  it("doit propager les erreurs non P2025", async () => {
    const prismaError = { code: "P2002", message: "Unique constraint" };
    (prisma.article.delete as jest.Mock).mockRejectedValue(prismaError);

    await expect(articleRepository.deleteArticle(1)).rejects.toEqual(prismaError);
  });
});