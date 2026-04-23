import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import expensesRouter from "./expenses";
import phasesRouter from "./phases";
import dashboardRouter from "./dashboard";
import aiInsightsRouter from "./ai-insights";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(projectsRouter);
router.use(phasesRouter);
router.use(expensesRouter);
router.use(dashboardRouter);
router.use(aiInsightsRouter);
router.use(analyticsRouter);

export default router;
