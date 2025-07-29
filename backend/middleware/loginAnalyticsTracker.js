import { trackLoginAttempt } from "../models/analytics/analyticsModel.js";

/**
 * Middleware to track login attempts for analytics
 * This middleware should be applied to login routes
 */
export const loginAnalyticsTracker = async (req, res, next) => {
  // Store original methods to restore them later
  const originalJson = res.json;
  const originalStatus = res.status;
  
  // Track the login attempt data
  let loginData = {
    attemptedEmail: req.body?.email,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers["user-agent"],
    success: false,
    userId: null,
    failureReason: null
  };

  // Override res.json to capture the response
  res.json = function(data) {
    // If we get a successful response with user data, it was a successful login
    if (data && data.user && data.token) {
      loginData.success = true;
      loginData.userId = data.user.id;
      loginData.failureReason = null;
    }
    
    // Track the login attempt (non-blocking)
    trackLoginAttempt(loginData).catch(err => {
      console.error("Analytics tracking failed:", err);
    });
    
    // Call the original res.json
    return originalJson.call(this, data);
  };

  // Override res.status to capture error responses
  res.status = function(code) {
    // If we get a 401 status, it was a failed login
    if (code === 401) {
      loginData.success = false;
      // We'll determine the reason in the error handler
    }
    return originalStatus.call(this, code);
  };

  // Override next to capture errors
  const originalNext = next;
  next = function(error) {
    if (error) {
      // If it's an unauthorized error, track it
      if (error.message === "Invalid email or password") {
        loginData.success = false;
        // Try to determine if it's user not found or wrong password
        // This is a simplified approach - you might want to enhance this
        loginData.failureReason = "authentication_failed";
      }
      
      // Track the failed login attempt (non-blocking)
      trackLoginAttempt(loginData).catch(err => {
        console.error("Analytics tracking failed:", err);
      });
    }
    
    return originalNext.call(this, error);
  };

  next();
}; 