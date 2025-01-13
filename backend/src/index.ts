// config imports
import dotenv from "dotenv";
dotenv.config();

// Initializing Server
import appInstance from "./lib/ExpressAppProvider";
appInstance.startServer();

// Registering Signal Kill Events
process.on("SIGINT", () => {
  console.log("Received SIGINT. Gracefully shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Gracefully shutting down...");
  process.exit(0);
});
