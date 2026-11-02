import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { Role } from "../models/User";

const SALT_ROUNDS = 10;

// Accounts created before hashing was added still hold plain-text passwords.
// bcrypt hashes always start with "$2", so anything else is a legacy password.
const isBcryptHash = (value: string) => /^\$2[aby]\$\d{2}\$/.test(value);

// -------------------------
// REGISTER CONTROLLER
// -------------------------
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, managerId, department } = req.body;

  try {
    if (!name || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    let finalManagerId = managerId;

    if (role === Role.EMPLOYEE && !finalManagerId) {
      const defaultManager = await User.findOne({ role: Role.MANAGER });

      if (defaultManager) {
        finalManagerId = defaultManager._id;
      }
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      managerId: finalManagerId,
      department,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        managerId: newUser.managerId,
        department: newUser.department,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// -------------------------
// LOGIN CONTROLLER
// -------------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    let isMatch: boolean;

    if (isBcryptHash(user.passwordHash)) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Legacy plain-text account: check it once, then upgrade it to a hash
      isMatch = user.passwordHash === password;
      if (isMatch) {
        user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await user.save();
      }
    }

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        department: user.department,
      },
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};