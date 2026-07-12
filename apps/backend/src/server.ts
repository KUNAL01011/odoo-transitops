import http from "http";
import app from "./app";
import { myEnvironment } from "@/configs";
import { prisma } from "./configs";
import { logger } from "./utils";

const PORT = myEnvironment.PORT || 8080;

const server = http.createServer(app);

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      // startCronJobs();
      console.log("Server started");
      logger.info(`🚀 Server running on port: ${myEnvironment.PORT}`);
      logger.info(
        `📑 Health check: http://localhost:${myEnvironment.PORT}/health`
      );
    });
  } catch (error) {
    logger.error("❌ Failed to start server", error);
    process.exit(1);
  }
};

startServer();

// Add these BEFORE startServer()
process.on("uncaughtException", error => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

/* -------------------- GRACEFUL SHUTDOWN -------------------- */
let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`\n🛑 ${signal} received. Starting graceful shutdown...`);

  try {
    // 1. Stop accepting new requests
    await new Promise<void>(resolve => {
      server.close(() => {
        logger.info("✅ HTTP server closed");
        resolve();
      });
    });

    // 2. Stop cron jobs
    // stopCronJobs();
    logger.info("✅ Cron jobs stopped");

    // 3. Close database connections
    await prisma.$disconnect();
    logger.info("✅ Database disconnected");
    logger.info("👋 Shutdown complete. Exiting process.");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error during shutdown", error);
    process.exit(1);
  }
};

/* -------------------- SIGNAL HANDLERS -------------------- */
process.on("SIGINT", shutdown); // Ctrl + C
process.on("SIGTERM", shutdown); // Docker / K8s
