import pino from "pino";
import {context, trace} from "@opentelemetry/api";
import dotenv from "dotenv";

dotenv.config();

const LokiTransport = pino.transport({
  target: "pino-loki",
  options: {
    batching: true,
    interval: 5,
    host: process.env.LOKI_ENDPOINT,
  },
});

const logger = pino(
  {
    mixin() {
      const span = trace.getSpan(context.active());
      if (span) {
        const ctx = span.spanContext();
        return {
          traceId: ctx.traceId,
          spanId: ctx.spanId,
        };
      }
      return {};
    },
  },
  LokiTransport,
);

export const loggerMiddleware = (req, res, next) => {
  const span = trace.getSpan(context.active());

  logger.info(
    {
      method: req.method,
      path: req.path,
      traceId: span?.spanContext().traceId,
      spanId: span?.spanContext().spanId,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      ip:
        req.ip ||
        req.ips ||
        req.socket.remoteAddress ||
        req.connection.remoteAddress,
      hostname: req.hostname,
      protocol: req.protocol,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
    },
    "API--HIT!",
  );

  next();
}

export const logError = (error, req = null, additionalInfo = {}) => {
  const errorData = {
    name: error.name,
    message: error.message,
    category: error.category || "unknown",
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === "development" && {stack: error.stack})
  };

  const requestData = req ? {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get?.("User-Agent"),
    traceId: req.traceId
  } : {};

  logger.error("Application Error", {
    error: errorData,
    request: requestData,
    ...additionalInfo
  });
};

export const logInfo = (message, data = {}) => {
  logger.info({message, ...data, timestamp: new Date().toISOString()});
};

export const logWarning = (message, data = {}) => {
  logger.warn({message, ...data, timestamp: new Date().toISOString()});
};