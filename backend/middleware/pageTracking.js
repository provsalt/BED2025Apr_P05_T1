import { trackPageVisit } from '../models/admin/analyticsModel.js';
import { userPageVisits } from '../config/metrics.js';

/**
 * Middleware to track page visits for analytics
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
        pageTitle: req.path, // You can enhance this by parsing the response or using a custom header
        actionType: req.method === 'GET' ? 'view' : 'action',
        referrerUrl: req.get('Referrer') || null,
        userAgent: req.get('User-Agent') || null,
        deviceType: getDeviceType(req.get('User-Agent') || ''),
        sessionId: req.session?.id || null
      };
      
      // Track asynchronously without blocking the response
      trackPageVisit(req.user.id, pageData).catch(err => {
        console.error('Failed to track page visit:', err);
      });
      
      // Increment Prometheus metrics
      userPageVisits.labels(pageData.pageUrl, pageData.deviceType).inc();
    }
  };
  
  next();
};

/**
 * Helper function to determine device type from user agent
 */
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
 * Middleware to track specific page visits with custom data
 * Use this for more detailed tracking
 */
export const trackSpecificPage = (pageConfig) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      originalSend.call(this, data);
      
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const pageData = {
          pageUrl: req.originalUrl,
          pageTitle: pageConfig.title || req.path,
          actionType: pageConfig.actionType || 'view',
          referrerUrl: req.get('Referrer') || null,
          userAgent: req.get('User-Agent') || null,
          deviceType: getDeviceType(req.get('User-Agent') || ''),
          sessionId: req.session?.id || null
        };
        
        trackPageVisit(req.user.id, pageData).catch(err => {
          console.error('Failed to track specific page visit:', err);
        });
        
        // Increment Prometheus metrics
        userPageVisits.labels(pageData.pageUrl, pageData.deviceType).inc();
      }
    };
    
    next();
  };
}; 