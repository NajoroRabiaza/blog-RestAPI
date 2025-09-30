import commentService from "../../services/comment.service";

jest.mock("../../repositories/comment.repository");
jest.mock("../../repositories/article.repository");

import commentRepository from "../../repositories/comment.repository";
import articleRepository from "../../repositories/article.repository";

const mockArticle = {
  id: 1,
  title: "Mon article",
  slug: "mon-article",
  content: "Contenu",
  published: true,
  authorId: 1,
  views: 0,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockComment = {
  id: 1,
  content: "Super article",
  articleId: 1,
  authorId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 2, username: "lecteur" },
};

beforeEach(() => {
  (articleRepository.findArticleById as jest.Mock).mockResolvedValue(mockArticle);
  (commentRepository.findCommentById as jest.Mock).mockResolvedValue(mockComment);
  (commentRepository.createComment as jest.Mock).mockResolvedValue(mockComment);
  (commentRepository.deleteComment as jest.Mock).mockResolvedValue(mockComment);
});

describe("addComment", () => {
  it("doit ajouter un commentaire sur un article publie", async () => {
    const result = await commentService.addComment({
      content: "Super article",
      articleId: 1,
      authorId: 2,
    });

    expect(commentRepository.createComment).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockComment);
  });

  it("doit lancer une erreur 404 si l'article n'existe pas", async () => {
    (articleRepository.findArticleById as jest.Mock).mockResolvedValue(null);

    await expect(
      commentService.addComment({
        content: "Super article",
        articleId: 999,
        authorId: 2,
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("doit lancer une erreur 403 si l'article n'est pas publie", async () => {
    (articleRepository.findArticleById as jest.Mock).mockResolvedValue({
      ...mockArticle,
      published: false,
    });

    await expect(
      commentService.addComment({
        content: "Super article",
        articleId: 1,
        authorId: 2,
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("removeComment", () => {
  it("doit supprimer un commentaire si l'utilisateur est l'auteur", async () => {
    await commentService.removeComment(1, 2, "AUTHOR");

    expect(commentRepository.deleteComment).toHaveBeenCalledWith(1);
  });

  it("doit lancer une erreur 403 si l'utilisateur n'est pas l'auteur", async () => {
    await expect(
      commentService.removeComment(1, 99, "AUTHOR")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("doit permettre a un ADMIN de supprimer n'importe quel commentaire", async () => {
    await commentService.removeComment(1, 99, "ADMIN");

    expect(commentRepository.deleteComment).toHaveBeenCalledWith(1);
  });

  it("doit lancer une erreur 404 si le commentaire n'existe pas", async () => {
    (commentRepository.findCommentById as jest.Mock).mockResolvedValue(null);

    await expect(
      commentService.removeComment(999, 2, "AUTHOR")
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("editComment", () => {
  it("doit modifier le commentaire si l'utilisateur est l'auteur", async () => {
    (commentRepository.updateComment as jest.Mock).mockResolvedValue({
      ...mockComment,
      content: "Contenu modifie",
    });

    const result = await commentService.editComment(1, "Contenu modifie", 2);

    expect(commentRepository.updateComment).toHaveBeenCalledWith(
      1,
      "Contenu modifie"
    );
    expect(result).toMatchObject({ content: "Contenu modifie" });
  });

  it("doit lancer une erreur 403 si l'utilisateur n'est pas l'auteur", async () => {
    await expect(
      commentService.editComment(1, "Contenu modifie", 99)
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});