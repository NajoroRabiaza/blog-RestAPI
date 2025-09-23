import { Router, IRouter } from "express";
import tagController from "../controllers/tag.controller";

const router: IRouter = Router();

// GET /tags — liste publique de tous les tags avec recherche optionnelle
router.get("/", tagController.getAllTags);

export default router;