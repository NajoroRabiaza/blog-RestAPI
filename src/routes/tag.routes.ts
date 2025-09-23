import { Router, IRouter } from "express";
import tagController from "../controllers/tag.controller";
import authenticate from "../middlewares/authenticate";
import authorize from "../middlewares/authorize";

const router: IRouter = Router();

// GET /tags — liste publique de tous les tags avec recherche optionnelle
router.get("/", tagController.getAllTags);

// POST /tags/articles/:id — association de tags a un article
router.post(
  "/articles/:id",
  authenticate,
  authorize("AUTHOR", "ADMIN"),
  tagController.attachTagsToArticle
);

export default router;