import { Router, IRouter } from "express";
import articleController from "../controllers/article.controller";
import tagController from "../controllers/tag.controller";
import commentRoutes from "./comment.routes";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";
import validate from "../middlewares/validate";
import validators from "../utils/validators";

const router: IRouter = Router();

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Liste paginee des articles avec filtres
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title, views]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Liste des articles avec pagination
 */
router.get(
  "/",
  validate(validators.getArticlesSchema, "query"),
  articleController.getArticles
);

/**
 * @swagger
 * /articles/{slug}:
 *   get:
 *     summary: Detail d un article par son slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article trouve
 *       404:
 *         description: Article introuvable
 */
router.get("/:slug", articleController.getArticleBySlug);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Creation d un article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *                 default: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Article cree avec succes
 *       401:
 *         description: Non authentifie
 */
router.post(
  "/",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  validate(validators.createArticleSchema),
  articleController.createArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   patch:
 *     summary: Mise a jour partielle d un article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Article mis a jour
 *       403:
 *         description: Droits insuffisants
 *       404:
 *         description: Article introuvable
 */
router.patch(
  "/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  validate(validators.updateArticleSchema),
  articleController.updateArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Suppression d un article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Article supprime
 *       403:
 *         description: Droits insuffisants
 */
router.delete(
  "/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  articleController.deleteArticle
);

router.post(
  "/:id/tags",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  tagController.attachTagsToArticle
);

router.use("/:articleId/comments", commentRoutes);

export default router;