import { Response } from "express";
import Goal from "../models/Goal";
import { AuthRequest } from "../middleware/rbac";
import { Role } from "../models/User";

export const updateQuarterlyAchievement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { goalId } = req.params;
  const { quarter, achievement, status } = req.body;

  try {
    const goal: any = await Goal.findById(goalId);

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    const isOwner = goal.ownerId.toString() === req.user?.id;
    const isManager = req.user?.role === Role.MANAGER;

    if (!isOwner && !isManager) {
      res.status(403).json({ message: "Not authorized to update this goal" });
      return;
    }

    const computeProgress = (ach: number, uom: string, target: any) => {
      if (uom === "Zero-based") {
        return ach === 0 ? 100 : 0;
      }

      if (uom === "Timeline") {
        return status === "Completed" ? 100 : 0;
      }

      const targetNum = Number(target);

      if (targetNum > 0) {
        return Math.min(100, Math.round((ach / targetNum) * 100));
      }

      return 0;
    };

    const progressScore = computeProgress(
      Number(achievement),
      goal.uom,
      goal.target
    );

    goal[quarter] = Object.assign({}, goal[quarter], {
      achievement: Number(achievement),
      status,
      progressScore,
    });

    await goal.save();

    res.json({
      message: `Updated ${quarter} achievement successfully`,
      progressScore,
      goal,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const managerCheckInReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { goalId } = req.params;
  const { quarter, checkInComment } = req.body;

  try {
    const goal: any = await Goal.findById(goalId);

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    if (req.user?.role !== Role.MANAGER) {
      res.status(403).json({ message: "Only managers can review check-ins" });
      return;
    }

    goal[quarter] = Object.assign({}, goal[quarter], {
      checkInComment,
    });

    await goal.save();

    res.json({
      message: "Manager feedback recorded",
      goal,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};