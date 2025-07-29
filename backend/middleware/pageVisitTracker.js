import { trackPageVisit } from "../models/analytics/analyticsModel.js";

/**
 * Middleware to track page visits for analytics
 * Uses database tracking for detailed user behavior analysis
 */
export const pageVisitTracker = async (req, res, next) => {
  try {
    // Only track if user is authenticated and route is meaningful
    if (req.user && req.originalUrl) {
      // Filter out static assets, health checks, and non-meaningful routes
      const meaningfulRoutes = [
        '/api/users',
        '/api/chats',
        '/api/nutrition',
        '/api/medications',
        '/api/announcements',
        '/api/community',
        '/api/transport',
        '/api/support'
      ];
      
      const isMeaningfulRoute = meaningfulRoutes.some(route => 
        req.originalUrl.startsWith(route)
      );
      
      if (isMeaningfulRoute) {
        // Extract feature name from URL for better categorization
        let featureName = 'page_view';
        if (req.originalUrl.includes('/chats')) featureName = 'chat';
        else if (req.originalUrl.includes('/nutrition')) featureName = 'nutrition';
        else if (req.originalUrl.includes('/medications')) featureName = 'medical';
        else if (req.originalUrl.includes('/announcements')) featureName = 'announcements';
        else if (req.originalUrl.includes('/community')) featureName = 'community';
        else if (req.originalUrl.includes('/transport')) featureName = 'transport';
        else if (req.originalUrl.includes('/support')) featureName = 'support';
        else if (req.originalUrl.includes('/users')) featureName = 'user_profile';
        
        // Database tracking for detailed analytics
        await trackPageVisit(
          req.user.id,
          req.originalUrl,
          req.session?.id || null, // If you implement session tracking
          featureName
        );
      }
    }
  } catch (error) {
    // Log but don't block the request - analytics shouldn't break functionality
    console.error("Error tracking page visit:", error);
  }
  
  next();
}; 