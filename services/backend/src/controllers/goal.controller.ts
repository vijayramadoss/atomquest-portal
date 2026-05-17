import { Response } from "express";
import GoalSheet, { SheetStatus } from "../models/GoalSheet";
import Goal from "../models/Goal";
import User from "../models/User";
import { AuthRequest } from "../middleware/rbac";

export const createGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  const employeeId = req.user?.id;
  const { year, goals } = req.body;

  try {
    if (!goals || goals.length === 0 || goals.length > 8) {
      res.status(400).json({ message: "Must have between 1 and 8 goals" });
      return;
    }

    const totalWeightage = goals.reduce(
      (sum: number, g: any) => sum + Number(g.weightage),
      0
    );

    if (totalWeightage !== 100) {
      res.status(400).json({ message: "Total weightage must be exactly 100%" });
      return;
    }

    const invalidWeightage = goals.some((g: any) => Number(g.weightage) < 10);
    if (invalidWeightage) {
      res.status(400).json({ message: "Minimum weightage per goal must be >= 10%" });
      return;
    }

    let sheet = await GoalSheet.findOne({ employeeId, year });

    if (!sheet) {
      sheet = await GoalSheet.create({
        employeeId,
        year,
        status: SheetStatus.DRAFT,
        goalsCount: goals.length,
        totalWeightage,
      });
    } else {
      if (
        sheet.status !== SheetStatus.DRAFT &&
        sheet.status !== SheetStatus.UNLOCKED_BY_ADMIN &&
        sheet.status !== SheetStatus.REJECTED
      ) {
        res.status(400).json({
          message: "Cannot edit goals unless in Draft, Rejected, or Unlocked state",
        });
        return;
      }

      sheet.goalsCount = goals.length;
      sheet.totalWeightage = totalWeightage;
      await sheet.save();

      await Goal.deleteMany({ sheetId: sheet._id, isShared: false });
    }

    const goalDocs = goals.map((g: any) => ({
      ...g,
      weightage: Number(g.weightage),
      target: Number(g.target),
      ownerId: employeeId,
      sheetId: sheet?._id,
    }));

    await Goal.insertMany(goalDocs);

    res.status(201).json({
      message: "Goals created successfully",
      sheet,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const submitGoalSheet = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sheetId } = req.params;

  try {
    const sheet = await GoalSheet.findOneAndUpdate(
      { _id: sheetId, employeeId: req.user?.id },
      { status: SheetStatus.SUBMITTED },
      { new: true }
    );

    if (!sheet) {
      res.status(404).json({ message: "GoalSheet not found" });
      return;
    }

    res.json(sheet);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMyGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  const employeeId = req.user?.id;
  const yearQuery = req.query.year;
  const year = yearQuery ? parseInt(yearQuery as string, 10) : new Date().getFullYear();

  try {
    const sheet = await GoalSheet.findOne({ employeeId, year });

    if (!sheet) {
      res.json({ sheet: null, goals: [] });
      return;
    }

    const goals = await Goal.find({ sheetId: sheet._id });

    res.json({ sheet, goals });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getManagerTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  const managerId = req.user?.id;
  const yearQuery = req.query.year;
  const year = yearQuery ? parseInt(yearQuery as string, 10) : new Date().getFullYear();

  try {
    const employees = await User.find({ managerId }).select("-passwordHash");

    const teamData = await Promise.all(
      employees.map(async (employee) => {
        const sheet = await GoalSheet.findOne({
          employeeId: employee._id,
          year,
        });

        const goals = sheet ? await Goal.find({ sheetId: sheet._id }) : [];

        return {
          employee,
          sheet,
          goals,
        };
      })
    );

    res.json({ teamData });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const approveGoalSheet = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sheetId } = req.params;

  try {
    const sheet = await GoalSheet.findById(sheetId);

    if (!sheet) {
      res.status(404).json({ message: "Goal sheet not found" });
      return;
    }

    if (sheet.status !== SheetStatus.SUBMITTED) {
      res.status(400).json({ message: "Only submitted sheets can be approved" });
      return;
    }

    const goals = await Goal.find({ sheetId: sheet._id });
    const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0);

    if (goals.length === 0) {
      res.status(400).json({ message: "Cannot approve a sheet with no goals" });
      return;
    }

    if (goals.length > 8) {
      res.status(400).json({ message: "Cannot approve more than 8 goals" });
      return;
    }

    if (totalWeightage !== 100) {
      res.status(400).json({
        message: "Cannot approve: total weightage must be exactly 100%",
      });
      return;
    }

    const invalidWeightage = goals.some((g) => Number(g.weightage) < 10);
    if (invalidWeightage) {
      res.status(400).json({
        message: "Cannot approve: each goal weightage must be at least 10%",
      });
      return;
    }

    sheet.status = SheetStatus.APPROVED;
    sheet.totalWeightage = totalWeightage;
    sheet.goalsCount = goals.length;
    await sheet.save();

    res.json({
      message: "Goal sheet approved successfully",
      sheet,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const rejectGoalSheet = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sheetId } = req.params;
  const { rejectionComment } = req.body;

  try {
    const sheet = await GoalSheet.findById(sheetId);

    if (!sheet) {
      res.status(404).json({ message: "Goal sheet not found" });
      return;
    }

    if (sheet.status !== SheetStatus.SUBMITTED) {
      res.status(400).json({ message: "Only submitted sheets can be rejected" });
      return;
    }

    if (!rejectionComment || rejectionComment.trim() === "") {
      res.status(400).json({ message: "Rejection comment is required" });
      return;
    }

    sheet.status = SheetStatus.REJECTED;
    sheet.rejectionComment = rejectionComment;
    await sheet.save();

    res.json({
      message: "Goal sheet rejected and sent back for rework",
      sheet,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const managerEditGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const { goalId } = req.params;

  const {
    title,
    description,
    thrustArea,
    target,
    targetDate,
    weightage,
    uom,
    isShared,
  } = req.body;

  try {
    const goal = await Goal.findById(goalId);

    if (!goal) {
      res.status(404).json({ message: "Goal not found" });
      return;
    }

    const sheet = await GoalSheet.findById(goal.sheetId);

    if (!sheet) {
      res.status(404).json({ message: "GoalSheet not found" });
      return;
    }

    if (
      sheet.status !== SheetStatus.SUBMITTED &&
      sheet.status !== SheetStatus.REJECTED &&
      sheet.status !== SheetStatus.UNLOCKED_BY_ADMIN
    ) {
      res.status(400).json({
        message: "Manager can only edit Submitted, Rejected, or Unlocked sheets",
      });
      return;
    }

    const newWeightage =
      weightage !== undefined ? Number(weightage) : Number(goal.weightage);

    if (newWeightage < 10) {
      res.status(400).json({
        message: "Minimum weightage per goal must be >= 10%",
      });
      return;
    }

    const allGoals = await Goal.find({ sheetId: goal.sheetId });

    const totalAfterEdit = allGoals.reduce((sum, currentGoal) => {
      if (currentGoal._id.toString() === goalId) {
        return sum + newWeightage;
      }
      return sum + Number(currentGoal.weightage);
    }, 0);

    if (totalAfterEdit !== 100) {
      res.status(400).json({
        message: `Total weightage must remain exactly 100%. Current total would be ${totalAfterEdit}%`,
      });
      return;
    }

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (thrustArea !== undefined) goal.thrustArea = thrustArea;
    if (uom !== undefined) goal.uom = uom;
    if (target !== undefined) goal.target = Number(target);
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (weightage !== undefined) goal.weightage = newWeightage;
    if (isShared !== undefined) goal.isShared = Boolean(isShared);

    await goal.save();

    sheet.totalWeightage = totalAfterEdit;
    sheet.goalsCount = allGoals.length;
    await sheet.save();

    res.json({
      message: "Goal updated successfully by manager",
      goal,
      sheet,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};