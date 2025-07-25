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
        winston.format.simple()
      )
    })
  ];

  if (process.env.NODE_ENV === "production") {
    transports.push(
      new winston.transports.File({
        filename: "logs/error.log",
        level: "error"
      }),
      new winston.transports.File({
        filename: "logs/combined.log"
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports,
    exitOnError: false
  });
};

export const logger = createLogger();

export const logError = (error, req = null, additionalInfo = {}) => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      category: error.category || "unknown",
      statusCode: error.statusCode
    },
    ...additionalInfo
  };

  if (req) {
    logData.request = {
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      traceId: req.traceId
    };
  }

  logger.error(logData);
};

export const logInfo = (message, data = {}) => {
  logger.info({ message, ...data, timestamp: new Date().toISOString() });
};

export const logWarning = (message, data = {}) => {
  logger.warn({ message, ...data, timestamp: new Date().toISOString() });
};