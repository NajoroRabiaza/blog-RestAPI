import articleService from "../../services/article.service";

jest.mock("../../repositories/article.repository");
jest.mock("../../repositories/tag.repository");
jest.mock("../../utils/slug");
jest.mock("../../config/redis");

import articleRepository from "../../repositories/article.repository";
import slugUtils from "../../utils/slug";
import redis from "../../config/redis";

const mockArticle = {
  id: 1,
  title: "Mon premier article",
  slug: "mon-premier-article",
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

beforeEach(() => {
  (slugUtils.generateSlug as jest.Mock).mockReturnValue("mon-premier-article");
  (slugUtils.generateUniqueSlug as jest.Mock).mockReturnValue("mon-premier-article");
  (articleRepository.findArticleBySlug as jest.Mock).mockResolvedValue(null);
  (articleRepository.createArticle as jest.Mock).mockResolvedValue(mockArticle);
  (articleRepository.findArticleById as jest.Mock).mockResolvedValue(mockArticle);
  (redis.get as jest.Mock).mockResolvedValue(null);
  (redis.set as jest.Mock).mockResolvedValue("OK");
});

describe("createArticle", () => {
  it("doit creer un article avec un slug genere depuis le titre", async () => {
    const result = await articleService.createArticle({
      title: "Mon premier article",
      content: "Contenu de l article",
      authorId: 1,
    });

    expect(articleRepository.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "mon-premier-article" })
    );
    expect(result).toBeDefined();
  });

  it("doit publier l'article et enregistrer publishedAt si published est true", async () => {
    await articleService.createArticle({
      title: "Mon premier article",
      content: "Contenu de l article",
      authorId: 1,
      published: true,
    });

    expect(articleRepository.createArticle).toHaveBeenCalledWith(
      expect.objectContaining({
        published: true,
        publishedAt: expect.any(Date),
      })
    );
  });

  it("doit invalider le cache apres creation", async () => {
    (redis.keys as jest.Mock) = jest.fn().mockResolvedValue([]);

    await articleService.createArticle({
      title: "Mon premier article",
      content: "Contenu de l article",
      authorId: 1,
    });

    expect(redis.keys).toHaveBeenCalledWith("articles:*");
  });
});

describe("updateArticle", () => {
  it("doit lancer une erreur 404 si l article n existe pas", async () => {
    (articleRepository.findArticleById as jest.Mock).mockResolvedValue(null);

    await expect(
      articleService.updateArticle(999, 1, "AUTHOR", { title: "Nouveau titre" })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("doit lancer une erreur 403 si l'utilisateur n'est pas l'auteur", async () => {
    await expect(
      articleService.updateArticle(1, 99, "AUTHOR", { title: "Nouveau titre" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("doit permettre a un ADMIN de modifier n'importe que l'article", async () => {
    (articleRepository.updateArticle as jest.Mock).mockResolvedValue(mockArticle);

    const result = await articleService.updateArticle(
      1,
      99,
      "ADMIN",
      { title: "Nouveau titre" }
    );

    expect(articleRepository.updateArticle).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });
});

describe("deleteArticle", () => {
  it("doit lancer une erreur 404 si l'article n existe pas", async () => {
    (articleRepository.findArticleById as jest.Mock).mockResolvedValue(null);

    await expect(
      articleService.deleteArticle(999, 1, "AUTHOR")
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("doit supprimer l'article si l'utilisateur est l'auteur", async () => {
    (articleRepository.deleteArticle as jest.Mock).mockResolvedValue(mockArticle);
    (redis.keys as jest.Mock) = jest.fn().mockResolvedValue([]);

    await articleService.deleteArticle(1, 1, "AUTHOR");

    expect(articleRepository.deleteArticle).toHaveBeenCalledWith(1);
  });
});