import { randomUUID } from "crypto";

export const tracingMiddleware = (req, res, next) => {
  req.traceId = req.headers["x-trace-id"] || randomUUID();
  
  res.setHeader("X-Trace-ID", req.traceId);
  
  const startTime = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[${req.traceId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  
  next();
};