import { Response } from "express";
import Goal from "../models/Goal";
import GoalSheet, { SheetStatus } from "../models/GoalSheet";
import User, { Role } from "../models/User";
import { AuthRequest } from "../middleware/rbac";

let escalationSettings = {
  q1Month: 7,
  q2Month: 10,
  q3Month: 1,
  q4Month: 4,
  penaltyEnabled: true,
  reminderDaysBefore: 5,
};

export const getAdminAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const usersCount = await User.countDocuments();
    const employeesCount = await User.countDocuments({ role: Role.EMPLOYEE });
    const managersCount = await User.countDocuments({ role: Role.MANAGER });
    const sheetsCount = await GoalSheet.countDocuments();
    const goalsCount = await Goal.countDocuments();

    const statuses = await GoalSheet.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const uomDistribution = await Goal.aggregate([
      { $group: { _id: "$uom", frequency: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", frequency: 1 } },
    ]);

    const allGoals = await Goal.find();
    const quarters = ["q1", "q2", "q3", "q4"];

    const qOqData = quarters.map((q) => {
      const totalTarget = allGoals.reduce(
        (sum, g: any) => sum + Number(g.target || 0),
        0
      );

      const totalAchieved = allGoals.reduce(
        (sum, g: any) => sum + Number(g[q]?.achievement || 0),
        0
      );

      return {
        quarter: q.toUpperCase(),
        target: totalTarget || 0,
        achieved: totalAchieved || 0,
      };
    });

    res.json({
      summary: {
        usersCount,
        employeesCount,
        managersCount,
        sheetsCount,
        goalsCount,
      },
      statuses,
      uomDistribution,
      qOqData,
      escalationSettings,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getAllGoalSheets = async (req: AuthRequest, res: Response) => {
  try {
    const sheets = await GoalSheet.find()
      .populate("employeeId", "name email department role managerId")
      .sort({ updatedAt: -1 });

    res.json({ sheets });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const unlockGoalSheet = async (req: AuthRequest, res: Response) => {
  const { sheetId } = req.params;

  try {
    const sheet = await GoalSheet.findById(sheetId);

    if (!sheet) {
      res.status(404).json({ message: "GoalSheet not found" });
      return;
    }

    sheet.status = SheetStatus.UNLOCKED_BY_ADMIN;
    await sheet.save();

    res.json({
      message: "GoalSheet unlocked successfully by admin",
      sheet,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createSharedGoal = async (req: AuthRequest, res: Response) => {
  const {
    department,
    year = new Date().getFullYear(),
    thrustArea,
    title,
    description,
    uom,
    target,
    weightage,
  } = req.body;

  try {
    if (
      !thrustArea ||
      !title ||
      !description ||
      !uom ||
      target === undefined ||
      !weightage
    ) {
      res.status(400).json({ message: "All shared goal fields are required" });
      return;
    }

    const employeeQuery: any = { role: Role.EMPLOYEE };

    if (department && department !== "All") {
      employeeQuery.department = department;
    }

    const employees = await User.find(employeeQuery);

    if (employees.length === 0) {
      res.status(404).json({ message: "No employees found for this department" });
      return;
    }

    const results = [];

    for (const employee of employees) {
      let sheet = await GoalSheet.findOne({
        employeeId: employee._id,
        year,
      });

      if (!sheet) {
        sheet = await GoalSheet.create({
          employeeId: employee._id,
          year,
          status: SheetStatus.DRAFT,
          totalWeightage: 0,
          goalsCount: 0,
        });
      }

      const currentGoals = await Goal.find({ sheetId: sheet._id });
      const currentTotal = currentGoals.reduce(
        (sum, g) => sum + Number(g.weightage || 0),
        0
      );

      if (currentTotal + Number(weightage) > 100) {
        results.push({
          employee: employee.email,
          status: "Skipped",
          reason: "Adding shared goal would exceed 100% total weightage",
        });
        continue;
      }

      const sharedGoal = await Goal.create({
        ownerId: employee._id,
        sheetId: sheet._id,
        thrustArea,
        title,
        description,
        uom,
        target: Number(target),
        weightage: Number(weightage),
        isShared: true,
      });

      sheet.totalWeightage = currentTotal + Number(weightage);
      sheet.goalsCount = currentGoals.length + 1;
      await sheet.save();

      results.push({
        employee: employee.email,
        status: "Created",
        goalId: sharedGoal._id,
      });
    }

    res.status(201).json({
      message: "Shared goal processing completed",
      results,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const exportGoalsReport = async (req: AuthRequest, res: Response) => {
  try {
    const goals = await Goal.find()
      .populate("ownerId", "name email department")
      .populate("sheetId", "year status totalWeightage");

    const rows = [
      [
        "Employee Name",
        "Email",
        "Department",
        "Year",
        "Sheet Status",
        "Thrust Area",
        "Title",
        "UOM",
        "Target",
        "Weightage",
        "Q1 Achievement",
        "Q1 Status",
        "Q2 Achievement",
        "Q2 Status",
        "Q3 Achievement",
        "Q3 Status",
        "Q4 Achievement",
        "Q4 Status",
      ],
    ];

    goals.forEach((goal: any) => {
      rows.push([
        goal.ownerId?.name || "",
        goal.ownerId?.email || "",
        goal.ownerId?.department || "",
        goal.sheetId?.year || "",
        goal.sheetId?.status || "",
        goal.thrustArea || "",
        goal.title || "",
        goal.uom || "",
        goal.target || "",
        goal.weightage || "",
        goal.q1?.achievement || 0,
        goal.q1?.status || "Not Started",
        goal.q2?.achievement || 0,
        goal.q2?.status || "Not Started",
        goal.q3?.achievement || 0,
        goal.q3?.status || "Not Started",
        goal.q4?.achievement || 0,
        goal.q4?.status || "Not Started",
      ]);
    });

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=goals-report.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getManagers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const managers = await User.find({ role: Role.MANAGER })
      .select("-passwordHash")
      .sort({ name: 1 });

    res.json({ managers });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await User.find({ role: Role.EMPLOYEE })
      .populate("managerId", "name email department role")
      .select("-passwordHash")
      .sort({ name: 1 });

    res.json({ employees });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const assignEmployeeToManager = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { employeeId } = req.params;
  const { managerId } = req.body;

  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }

    if (employee.role !== Role.EMPLOYEE) {
      res.status(400).json({ message: "Selected user is not an employee" });
      return;
    }

    if (!managerId) {
      employee.managerId = undefined;
      await employee.save();

      res.json({
        message: "Manager assignment removed successfully",
        employee,
      });
      return;
    }

    const manager = await User.findById(managerId);

    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    if (manager.role !== Role.MANAGER) {
      res.status(400).json({ message: "Selected user is not a manager" });
      return;
    }

    employee.managerId = manager._id as any;
    await employee.save();

    const updatedEmployee = await User.findById(employee._id)
      .populate("managerId", "name email department role")
      .select("-passwordHash");

    res.json({
      message: "Employee assigned to manager successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getEscalationSettings = async (req: AuthRequest, res: Response) => {
  res.json({ escalationSettings });
};

export const updateEscalationSettings = async (req: AuthRequest, res: Response) => {
  escalationSettings = {
    ...escalationSettings,
    ...req.body,
  };

  res.json({
    message: "Escalation settings updated successfully",
    escalationSettings,
  });
};