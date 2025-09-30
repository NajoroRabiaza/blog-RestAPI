import statsService from "../../services/stats.service";

jest.mock("../../config/database", () => ({
  article: {
    aggregate: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  comment: {
    count: jest.fn(),
  },
  user: {
    count: jest.fn(),
  },
  $transaction: jest.fn(),
}));

import prisma from "../../config/database";

const mockArticleStats = {
  _count: { id: 3 },
  _sum: { views: 150 },
};

const mockTopArticles = [
  {
    id: 1,
    title: "Article populaire",
    slug: "article-populaire",
    views: 100,
    publishedAt: new Date(),
    _count: { comments: 5 },
  },
];

describe("getAuthorStats", () => {
  it("doit retourner les statistiques completes d un auteur", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      mockArticleStats,
      10,
      5,
    ]);

    const result = await statsService.getAuthorStats(1);

    expect(result.authorId).toBe(1);
    expect(result.publishedArticles).toBe(3);
    expect(result.totalViews).toBe(150);
    expect(result.totalComments).toBe(10);
    expect(result.totalArticles).toBe(5);
    expect(result.draftArticles).toBe(2);
    expect(result.averageViewsPerArticle).toBe(50);
  });

  it("doit retourner averageViewsPerArticle a 0 si aucun article publie", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      { _count: { id: 0 }, _sum: { views: null } },
      0,
      0,
    ]);

    const result = await statsService.getAuthorStats(1);

    expect(result.averageViewsPerArticle).toBe(0);
    expect(result.totalViews).toBe(0);
  });
});

describe("getTopArticlesByAuthor", () => {
  it("doit retourner les articles les plus vus", async () => {
    (prisma.article.findMany as jest.Mock).mockResolvedValue(mockTopArticles);

    const result = await statsService.getTopArticlesByAuthor(1, 5);

    expect(result).toHaveLength(1);
    expect(result[0].views).toBe(100);
    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
        orderBy: { views: "desc" },
      })
    );
  });

  it("doit limiter le nombre de resultats a 20 maximum", async () => {
    (prisma.article.findMany as jest.Mock).mockResolvedValue([]);

    await statsService.getTopArticlesByAuthor(1, 100);

    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 })
    );
  });
});

describe("getGlobalStats", () => {
  it("doit retourner les statistiques globales de la plateforme", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      10,
      25,
      20,
      100,
      { _sum: { views: 5000 } },
      mockTopArticles,
    ]);

    const result = await statsService.getGlobalStats();

    expect(result.totalUsers).toBe(10);
    expect(result.totalArticles).toBe(25);
    expect(result.publishedArticles).toBe(20);
    expect(result.draftArticles).toBe(5);
    expect(result.totalComments).toBe(100);
    expect(result.totalViews).toBe(5000);
    expect(result.topArticles).toHaveLength(1);
  });

  it("doit retourner totalViews a 0 si aucune vue", async () => {
    (prisma.$transaction as jest.Mock).mockResolvedValue([
      0,
      0,
      0,
      0,
      { _sum: { views: null } },
      [],
    ]);

    const result = await statsService.getGlobalStats();

    expect(result.totalViews).toBe(0);
    expect(result.topArticles).toHaveLength(0);
  });
});