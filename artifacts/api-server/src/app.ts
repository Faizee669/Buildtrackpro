import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";

const app: Express = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173"]
  : true; // allow all in development

app.use(cors({ credentials: true, origin: allowedOrigins }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

// Global error handler to ensure JSON responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error:", err);
  const message = err.message || "Internal Server Error";
  
  if (message.includes("connect ECONNREFUSED") || message.includes("password authentication failed")) {
    res.status(500).json({ error: "Database connection failed! You need to add a real DATABASE_URL to your .env file." });
    return;
  }
  
  res.status(500).json({ error: message });
});

export default app;
