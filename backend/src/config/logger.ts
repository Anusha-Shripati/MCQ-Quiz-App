import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ level, message, timestamp }) => {
      // Colorize the output based on log level
      let logLevel = `[${level.toUpperCase()}]`;
      if (level === "error") {
        logLevel = `\x1b[31m[${level.toUpperCase()}]\x1b[0m`; // Red color
      } else if (level === "warn") {
        logLevel = `\x1b[33m[${level.toUpperCase()}]\x1b[0m`; // Yellow color
      } else if (level === "info") {
        logLevel = `\x1b[36m[${level.toUpperCase()}]\x1b[0m`; // Cyan color
      }
      return `${timestamp} ${logLevel}: ${message}`;
    }),
  ),
  transports: [
    // Console transport
    new winston.transports.Console(),
  ],
});
