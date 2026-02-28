import express from "express";
import cors from "cors";
import workerRoutes from "./routes/worker.route.js";
import locationRouter from "./routes/location.route.js";
import { morganMiddleware, logger } from "./utils/logger.js";
import { prometheusMiddleware, metricsRouter } from "./utils/metrics.js";

const app = express();

// Logging & metrics middlewares
app.use(morganMiddleware);
app.use(prometheusMiddleware);

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/worker", workerRoutes);
app.use("/location", locationRouter);

app.use(metricsRouter);

export default app;
