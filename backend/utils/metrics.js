import client from "prom-client";
import express from "express";

// Create a registry to register the metrics
const register = new client.Registry();

// Default system metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom counters for requests
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});
register.registerMetric(httpRequestCounter);

// Middleware to count requests
const prometheusMiddleware = (req, res, next) => {
    res.on("finish", () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status: res.statusCode,
        });
    });
    next();
};

// Metrics endpoint
const metricsRouter = express.Router();
metricsRouter.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

export { prometheusMiddleware, metricsRouter };
