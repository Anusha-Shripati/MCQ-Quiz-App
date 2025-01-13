import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes.",
});
