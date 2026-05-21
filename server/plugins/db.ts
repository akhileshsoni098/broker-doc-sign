import { connectDB } from "../config/db";

export default defineNitroPlugin(async () => {
  try {
    await connectDB();

    console.log("Drizzle Database Initialized");
  } catch (error) {
    console.error("DB Init Failed:", error);
  }
}); 