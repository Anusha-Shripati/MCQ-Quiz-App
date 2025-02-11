// config imports
import dotenv from "dotenv";
dotenv.config();

// Initializing Server
import appInstance from "./lib/ExpressAppProvider";
appInstance.startServer();

// Registering Signal Kill Events
process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
