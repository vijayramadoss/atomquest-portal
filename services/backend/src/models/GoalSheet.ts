import mongoose, { Document, Schema } from 'mongoose';

export enum SheetStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved', 
  REJECTED = 'Rejected',
  UNLOCKED_BY_ADMIN = 'Unlocked by Admin',
}

export interface IGoalSheet extends Document {
  employeeId: mongoose.Types.ObjectId;
  year: number;
  status: SheetStatus;
  totalWeightage: number; 
  goalsCount: number; 
  rejectionComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSheetSchema: Schema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    status: { type: String, enum: Object.values(SheetStatus), default: SheetStatus.DRAFT },
    totalWeightage: { type: Number, default: 0 },
    goalsCount: { type: Number, default: 0 },
    rejectionComment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IGoalSheet>('GoalSheet', GoalSheetSchema);
