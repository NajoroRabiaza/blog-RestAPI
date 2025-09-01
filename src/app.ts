import express, { Application, Request, Response } from "express";
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/** route de base pour verifier que le serveur repond */
app.get("/", (_req: Request, res: Response) => {
    res.json({message: "blog restAPI is running"});
});

export default app;