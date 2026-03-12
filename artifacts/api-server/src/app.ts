import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import { replitAuthMiddleware } from "./middlewares/replitAuth";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Attach Replit Auth user info from headers
app.use(replitAuthMiddleware);

app.use("/api", router);

export default app;
