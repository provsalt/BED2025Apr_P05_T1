import { httpRequestsTotal, httpRequestDuration } from '../config/metrics.js';

export const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Increment request counter
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
      
    httpRequestDuration
      .labels(req.method, route)
      .observe(duration);
  });
  
  next();
};
