import { userPageVisits } from '../config/metrics.js';

/**
 * Middleware to track page visits for analytics (Prometheus-only)
 * This should be applied to routes that you want to track
 */
export const pageTrackingMiddleware = async (req, res, next) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send function to track after response is sent
  res.send = function(data) {
    // Call original send first
    originalSend.call(this, data);
    
    // Track page visit if user is authenticated and response is successful
    if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
      const pageData = {
        pageUrl: req.originalUrl,
        deviceType: getDeviceType(req.get('User-Agent') || '')
      };
      // Increment Prometheus metrics only
      userPageVisits.labels(pageData.pageUrl, pageData.deviceType).inc();
    }
  };
  
  next();
};

function getDeviceType(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Middleware to track specific page visits with custom data (Prometheus-only)
 */
export const trackSpecificPage = (pageConfig) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      originalSend.call(this, data);
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const pageData = {
          pageUrl: req.originalUrl,
          deviceType: getDeviceType(req.get('User-Agent') || '')
        };
        // Increment Prometheus metrics only
        userPageVisits.labels(pageData.pageUrl, pageData.deviceType).inc();
      }
    };
    next();
  };
}; 