import { connectDB } from "~~/server/config/db";
import { IBroker } from "~~/server/types/broker.types";

export default defineEventHandler(async (event) => {
  // ================= DB =================
  try {
    const db = await connectDB();

    const broker = event.context.broker as IBroker;

    console.log("Authenticated Broker:", broker);
    return {
      status: true,

      message: "Broker details retrieved successfully",
      data: broker,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection failed",
    });
  }
});
