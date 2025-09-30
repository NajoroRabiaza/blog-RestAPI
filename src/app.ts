import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import articleRoutes from "./routes/article.routes";
import tagRoutes from "./routes/tag.routes";
import statsRoutes from "./routes/stats.routes";
import { swaggerSpec } from "./config/swagger";

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

// interface Swagger UI disponible sur /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/articles", articleRoutes);
app.use("/tags", tagRoutes);
app.use("/stats", statsRoutes);

app.use(errorHandler);

export default app;