import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/** route de base pour verifier que le serveur repond */
app.get("/", (_req: Request, res: Response) => {
    res.json({message: "blog restAPI is running"});
});

export default app;