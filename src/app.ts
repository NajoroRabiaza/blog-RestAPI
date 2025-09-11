import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Blog RestAPI is running" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// routes d'authentification
app.use("/auth", authRoutes);

app.use(errorHandler);

export default app;