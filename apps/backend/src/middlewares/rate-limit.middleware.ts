import rateLimit from "express-rate-limit";

//1. Global Limiter (Generous: Protects against DDoS)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 mins
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Auth Limiter (Strict: Protects against Brute Force & OTP Spam)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register requests per 15 mins
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes to protect your account.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
