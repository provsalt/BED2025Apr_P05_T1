import winston from "winston";

const createLogger = () => {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  const transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let output = `${timestamp} [${level}]: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            output += `\n${JSON.stringify(meta, null, 2)}`;
          }
          
          return output;
        })
      )
    })
  ];

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports,
    exitOnError: false
  });
};

export const logger = createLogger();

export const logError = (error, req = null, additionalInfo = {}) => {
  const errorData = {
    name: error.name,
    message: error.message,
    category: error.category || "unknown",
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
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
  logger.info({ message, ...data, timestamp: new Date().toISOString() });
};

export const logWarning = (message, data = {}) => {
  logger.warn({ message, ...data, timestamp: new Date().toISOString() });
};