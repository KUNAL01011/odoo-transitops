import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { morganMiddleware } from "./utils";
import { errorHandler, globalLimiter, notFoundHandler } from "./middlewares";
import routes from "./routes";

const app: Application = express();

// Security middlewares
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(globalLimiter);
app.disable("x-powered-by");

// Body parsers && cookie (for all other routes)
app.use(express.json({ limit: "2kb" }));
app.use(express.urlencoded({ extended: true, limit: "2kb" }));
app.use(cookieParser());

// Compression && Logging
app.use(compression());
app.use(morganMiddleware);

// Static files
app.use(express.static("public"));
// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api", routes);

// Error handler (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
