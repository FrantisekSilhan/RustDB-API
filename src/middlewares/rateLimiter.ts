import rateLimit from "express-rate-limit";

export const itemListLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  limit: 25,
  standardHeaders: true,
  legacyHeaders: true,
  handler: (_, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      status: 429,
    });
  },
});

export const itemDetailLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 50,
  standardHeaders: true,
  legacyHeaders: true,
  handler: (_, res) => {
    res.status(429).json({
      message: "Too many requests, please try again later.",
      status: 429,
    });
  },
});