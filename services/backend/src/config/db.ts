import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI not found — check your .env file!");
    }

    // DEBUG LINE — prints your URI to verify .env is loading
    console.log("Loaded URI:", process.env.MONGO_URI);

    // Important for compatibility
    mongoose.set("strictQuery", false);

    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully:", mongoose.connection.host);
  } catch (error: any) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};