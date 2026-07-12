import dotenv from "dotenv";
dotenv.config();

const _environment = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,

  ACCESS_SECRET: process.env.ACCESS_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FRONTEND_URL_LOGIN: process.env.FRONTEND_URL_LOGIN,
};

const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "DIRECT_URL",
  "ACCESS_SECRET",
  "REFRESH_SECRET",
  "RESEND_API_KEY",
  "FRONTEND_URL_LOGIN",
] as const;

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables",
    missingEnvVars.join(", ")
  );
  console.error(
    "Please check your .env and ensure all required variables are set."
  );
  process.exit(1);
}

export const myEnvironment = Object.freeze(_environment);
