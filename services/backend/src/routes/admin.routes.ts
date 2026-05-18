import { Router } from "express";
import { authenticate, authorize } from "../middleware/rbac";
import { Role } from "../models/User";

import {
  getAdminAnalytics,
  getAllGoalSheets,
  unlockGoalSheet,
  createSharedGoal,
  exportGoalsReport,
  getEscalationSettings,
  updateEscalationSettings,
} from "../controllers/admin.controller";

const router = Router();

router.get("/analytics", authenticate, authorize([Role.ADMIN]), getAdminAnalytics);

router.get("/goalsheets", authenticate, authorize([Role.ADMIN]), getAllGoalSheets);

router.put(
  "/goalsheets/:sheetId/unlock",
  authenticate,
  authorize([Role.ADMIN]),
  unlockGoalSheet
);

router.post(
  "/shared-goals",
  authenticate,
  authorize([Role.ADMIN]),
  createSharedGoal
);

router.get(
  "/reports/goals.csv",
  authenticate,
  authorize([Role.ADMIN]),
  exportGoalsReport
);

router.get(
  "/escalations",
  authenticate,
  authorize([Role.ADMIN]),
  getEscalationSettings
);

router.put(
  "/escalations",
  authenticate,
  authorize([Role.ADMIN]),
  updateEscalationSettings
);

export default router;