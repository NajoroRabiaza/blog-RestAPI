import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler";

const app: Application = express();

/** Middlewares de securite en premier */
app.use(helmet());
app.use(cors());

/** Logger HTTP avant tout parsing pour capturer toutes les requetes */
app.use(morgan("dev"));

/** Parsing du corps des requetes */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Route de base pour verifier que le serveur repond */
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Blog RestAPI is running" });
});

/** Gestionnaire d erreurs global en dernier */
app.use(errorHandler);

export default app;