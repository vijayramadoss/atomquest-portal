import mongoose, { Document, Schema } from "mongoose";

export enum Role {
  ADMIN = "Admin",
  MANAGER = "Manager",
  EMPLOYEE = "Employee",
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  managerId?: mongoose.Types.ObjectId;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.EMPLOYEE,
    },

    managerId: { type: Schema.Types.ObjectId, ref: "User" },

    department: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);