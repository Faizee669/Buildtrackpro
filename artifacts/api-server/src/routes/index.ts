import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import expensesRouter from "./expenses";
import phasesRouter from "./phases";
import dashboardRouter from "./dashboard";
import aiInsightsRouter from "./ai-insights";
import analyticsRouter from "./analytics";
import crewRouter from "./crew";
import inventoryRouter from "./inventory";
import settingsRouter from "./settings";
import notificationsRouter from "./notifications";
import publicRouter from "./public";
import auditLogsRouter from "./audit-logs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(projectsRouter);
router.use(phasesRouter);
router.use(expensesRouter);
router.use(dashboardRouter);
router.use(aiInsightsRouter);
router.use(analyticsRouter);
router.use(crewRouter);
router.use(inventoryRouter);
router.use(settingsRouter);
router.use(notificationsRouter);
router.use(auditLogsRouter);
router.use(publicRouter);

export default router;
