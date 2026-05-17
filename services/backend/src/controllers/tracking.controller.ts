import { Response } from 'express';
import Goal, { UnitOfMeasurement } from '../models/Goal';
import { AuthRequest } from '../middleware/rbac';

export const updateQuarterlyAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  const { goalId } = req.params;
  const { quarter, achievement, status } = req.body; 

  try {
    const goal: any = await Goal.findById(goalId);
    if (!goal) {
       res.status(404).json({ message: 'Goal not found' });
       return;
    }

    if (goal.ownerId.toString() !== req.user?.id && req.user?.role !== 'Manager L1') {
      res.status(403).json({ message: 'Not authorized to update this goal' });
      return;
    }

    const computeProgress = (ach: number, uom: string, target: any) => {
        if (uom === 'Zero-based') {
            return ach === 0 ? 100 : 0;
        }
        if (uom === 'Timeline') {
            // Very simplified: 100 if completed status, else 0
            return status === 'Completed' ? 100 : 0;
        }
        // Min/Max numeric
        // If target > 0, assume higher is better (Min uom logic)
        // This calculates percentage of completion
        const targetNum = Number(target);
        if (targetNum > 0) {
            return Math.min(100, Math.round((ach / targetNum) * 100)); // Min UoM formula
        }
        return 0;
    };

    const progressScore = computeProgress(Number(achievement), goal.uom, goal.target);

    // Update the specific quarter
    const quarterData = {
        achievement: Number(achievement),
        status,
        progressScore 
    };

    goal[quarter] = Object.assign({}, goal[quarter], quarterData);
    await goal.save();

    res.json({ message: `Updated ${quarter} achievement successfully`, progressScore, goal });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const managerCheckInReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { goalId } = req.params;
  const { quarter, checkInComment } = req.body;

  try {
    const goal: any = await Goal.findById(goalId);
    if (!goal) {
       res.status(404).json({ message: 'Goal not found' });
       return;
    }

    goal[quarter] = Object.assign({}, goal[quarter], { checkInComment });
    await goal.save();

    res.json({ message: 'Manager feedback recorded', goal });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
