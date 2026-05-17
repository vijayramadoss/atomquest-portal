import mongoose, { Document, Schema } from 'mongoose';

export enum UnitOfMeasurement {
  NUMERIC = 'Numeric',
  PERCENTAGE = '%',
  TIMELINE = 'Timeline',
  ZERO_BASED = 'Zero-based',
}

export interface IGoal extends Document {
  ownerId: mongoose.Types.ObjectId;
  sheetId: mongoose.Types.ObjectId;
  thrustArea: string;
  title: string;
  description: string;
  uom: UnitOfMeasurement;
  target: number; 
  targetDate?: Date; 
  weightage: number; 
  isShared: boolean; 
  sourceGoalId?: mongoose.Types.ObjectId; 
  q1: { achievement: number; status: string; checkInComment?: string };
  q2: { achievement: number; status: string; checkInComment?: string };
  q3: { achievement: number; status: string; checkInComment?: string };
  q4: { achievement: number; status: string; checkInComment?: string };
  createdAt: Date;
  updatedAt: Date;
}

const QuarterlyAchievement = new Schema({
  achievement: { type: Number, default: 0 },
  status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' },
  checkInComment: { type: String }
}, { _id: false });

const GoalSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sheetId: { type: Schema.Types.ObjectId, ref: 'GoalSheet', required: true },
    thrustArea: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    uom: { type: String, enum: Object.values(UnitOfMeasurement), required: true },
    target: { type: Number, required: true },
    targetDate: { type: Date },
    weightage: { type: Number, required: true, min: 10 },
    isShared: { type: Boolean, default: false },
    sourceGoalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    q1: { type: QuarterlyAchievement, default: () => ({}) },
    q2: { type: QuarterlyAchievement, default: () => ({}) },
    q3: { type: QuarterlyAchievement, default: () => ({}) },
    q4: { type: QuarterlyAchievement, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model<IGoal>('Goal', GoalSchema);
