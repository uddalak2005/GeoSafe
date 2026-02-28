import winston from "winston";
import LokiTransport from "winston-loki";
import morgan from "morgan";

// Setup Loki transport
const logger = winston.createLogger({
    transports: [
        new LokiTransport({
            host: process.env.LOKI_URL || "http://localhost:3100", // Loki endpoint
            labels: { app: "minesafe-backend" }, // You can add custom labels
            json: true,
        }),
        new winston.transports.Console(),
    ],
});

// Morgan + Winston
morgan.token("origin", (req) => req.get("origin") || req.get("referer") || "unknown");
morgan.token("time", () => new Date().toISOString());

const format = "[:time] :method :url from :origin -> :status";

// Log with winston instead of console
const morganMiddleware = morgan(format, {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
});

export { logger, morganMiddleware };
