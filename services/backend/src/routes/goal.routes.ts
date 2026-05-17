import { Router } from "express";
import {
  createGoals,
  submitGoalSheet,
  getMyGoals,
  getManagerTeam,
  approveGoalSheet,
  rejectGoalSheet,
  managerEditGoal,
} from "../controllers/goal.controller";

import { authenticate, authorize } from "../middleware/rbac";
import { Role } from "../models/User";

import {
  updateQuarterlyAchievement,
  managerCheckInReview,
} from "../controllers/tracking.controller";

import { enforceCheckInWindow } from "../middleware/calendar.middleware";

const router = Router();

// Employee goal creation
router.post("/", authenticate, authorize([Role.EMPLOYEE]), createGoals);

// Employee submits full sheet
router.post("/:sheetId/submit", authenticate, authorize([Role.EMPLOYEE]), submitGoalSheet);

// Employee fetches their own goals
router.get("/", authenticate, getMyGoals);

// Manager fetches their team's goals
router.get("/manager/team", authenticate, authorize([Role.MANAGER]), getManagerTeam);

// Manager edits individual employee goal
router.put("/:goalId/manager-edit", authenticate, authorize([Role.MANAGER]), managerEditGoal);

// Manager approves a goal sheet
router.put("/:sheetId/approve", authenticate, authorize([Role.MANAGER]), approveGoalSheet);

// Manager rejects a goal sheet
router.put("/:sheetId/reject", authenticate, authorize([Role.MANAGER]), rejectGoalSheet);

// Quarterly updates (Employee)
router.put(
  "/:goalId/tracking/q1",
  authenticate,
  authorize([Role.EMPLOYEE]),
  enforceCheckInWindow("Q1"),
  (req, res, next) => {
    req.body.quarter = "q1";
    next();
  },
  updateQuarterlyAchievement
);

router.put(
  "/:goalId/tracking/q2",
  authenticate,
  authorize([Role.EMPLOYEE]),
  enforceCheckInWindow("Q2"),
  (req, res, next) => {
    req.body.quarter = "q2";
    next();
  },
  updateQuarterlyAchievement
);

router.put(
  "/:goalId/tracking/q3",
  authenticate,
  authorize([Role.EMPLOYEE]),
  enforceCheckInWindow("Q3"),
  (req, res, next) => {
    req.body.quarter = "q3";
    next();
  },
  updateQuarterlyAchievement
);

router.put(
  "/:goalId/tracking/q4",
  authenticate,
  authorize([Role.EMPLOYEE]),
  enforceCheckInWindow("Q4"),
  (req, res, next) => {
    req.body.quarter = "q4";
    next();
  },
  updateQuarterlyAchievement
);

// Manager check-in review – Q1 through Q4
router.put(
  "/:goalId/review/q1",
  authenticate,
  authorize([Role.MANAGER]),
  (req, res, next) => {
    req.body.quarter = "q1";
    next();
  },
  managerCheckInReview
);

router.put(
  "/:goalId/review/q2",
  authenticate,
  authorize([Role.MANAGER]),
  (req, res, next) => {
    req.body.quarter = "q2";
    next();
  },
  managerCheckInReview
);

router.put(
  "/:goalId/review/q3",
  authenticate,
  authorize([Role.MANAGER]),
  (req, res, next) => {
    req.body.quarter = "q3";
    next();
  },
  managerCheckInReview
);

router.put(
  "/:goalId/review/q4",
  authenticate,
  authorize([Role.MANAGER]),
  (req, res, next) => {
    req.body.quarter = "q4";
    next();
  },
  managerCheckInReview
);

export default router;