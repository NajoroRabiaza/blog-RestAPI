import articleService from "../services/article.service";
import { AsyncController } from "../types";

const getArticles: AsyncController = async (req, res, next) => {
  try {
    const {
      search,
      authorId,
      published,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await articleService.getArticles({
      search: search as string | undefined,
      authorId: authorId ? parseInt(authorId as string, 10) : undefined,
      published:
        published === "true" ? true
        : published === "false" ? false
        : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sortBy: sortBy as "createdAt" | "updatedAt" | "title" | "views" | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
      requesterId: req.user?.id,
      requesterRole: req.user?.role,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getArticleBySlug: AsyncController = async (req, res, next) => {
  try {
    // cast explicite car req.params retourne ParamsDictionary avec string | string[]
    const slug = req.params.slug as string;
    const article = await articleService.getArticleBySlug(slug, req.user?.id);

    res.status(200).json({
      status: "success",
      data: { article },
    });
  } catch (err) {
    next(err);
  }
};

const createArticle: AsyncController = async (req, res, next) => {
  try {
    const { title, content, published } = req.body;
    const authorId = req.user!.id;

    const article = await articleService.createArticle({
      title,
      content,
      published,
      authorId,
    });

    res.status(201).json({
      status: "success",
      data: { article },
    });
  } catch (err) {
    next(err);
  }
};

const updateArticle: AsyncController = async (req, res, next) => {
  try {
    // cast explicite sur req.params.id
    const id = parseInt(req.params.id as string, 10);
    const { title, content, published } = req.body;

    const article = await articleService.updateArticle(
      id,
      req.user!.id,
      req.user!.role,
      { title, content, published }
    );

    res.status(200).json({
      status: "success",
      data: { article },
    });
  } catch (err) {
    next(err);
  }
};

const deleteArticle: AsyncController = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    await articleService.deleteArticle(id, req.user!.id, req.user!.role);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };