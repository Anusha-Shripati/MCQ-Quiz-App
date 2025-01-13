import { PrismaClient } from "@prisma/client";
import { logger } from "../config/logger";

const prisma = new PrismaClient();

async function connectToDatabase() {
  try {
    await prisma.$connect(); // Explicitly connect to the database
    logger.info("Database connected successfully!");
  } catch (error) {
    logger.error("Failed to connect to the database:", error);
  }
}

export { prisma, connectToDatabase };
