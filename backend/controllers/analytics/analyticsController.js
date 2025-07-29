import { 
  getPageVisitFrequency, 
  getLoginAttemptsAnalytics, 
  getFailedLoginAttempts,
  getUserEngagementByPages,
  getNewUserSignupsByDay,
  getNewUserSignupsSummary
} from "../../models/analytics/analyticsModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/analytics/page-visits:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get page visit frequency analytics
 *     description: Retrieve analytics on page visit frequency to understand user behavior
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics (ISO format)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Page visit analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getPageVisitFrequencyController = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const analytics = await getPageVisitFrequency(start, end, parseInt(limit));
    
    res.json({
      success: true,
      data: analytics,
      meta: {
        startDate: start,
        endDate: end,
        limit: parseInt(limit),
        total: analytics.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/analytics/login-attempts:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get login attempts analytics
 *     description: Retrieve analytics on login attempts for UX improvement and security monitoring
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics (ISO format)
 *     responses:
 *       200:
 *         description: Login attempts analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getLoginAttemptsAnalyticsController = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const analytics = await getLoginAttemptsAnalytics(start, end);
    
    res.json({
      success: true,
      data: analytics,
      meta: {
        startDate: start,
        endDate: end,
        total: analytics.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/analytics/failed-logins:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get failed login attempts for security monitoring
 *     description: Retrieve failed login attempts to identify potential security threats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back for failed attempts
 *     responses:
 *       200:
 *         description: Failed login attempts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getFailedLoginAttemptsController = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;
    
    const failedAttempts = await getFailedLoginAttempts(parseInt(hours));
    
    res.json({
      success: true,
      data: failedAttempts,
      meta: {
        hours: parseInt(hours),
        total: failedAttempts.length,
        securityThreshold: 3 // Minimum failed attempts to flag
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/analytics/user-engagement/{userId}:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get user engagement by page visits
 *     description: Retrieve page visit analytics for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to get engagement for
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics (ISO format)
 *     responses:
 *       200:
 *         description: User engagement analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getUserEngagementController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!userId || isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const engagement = await getUserEngagementByPages(parseInt(userId), start, end);
    
    res.json({
      success: true,
      data: engagement,
      meta: {
        userId: parseInt(userId),
        startDate: start,
        endDate: end,
        total: engagement.length
      }
    });
  } catch (error) {
    next(error);
  }
}; 

/**
 * @openapi
 * /api/analytics/new-user-signups:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get new user signups analytics
 *     description: Retrieve analytics on new user signups by day for growth tracking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics (ISO format)
 *     responses:
 *       200:
 *         description: New user signups analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getNewUserSignupsController = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const signupsByDay = await getNewUserSignupsByDay(start, end);
    const signupsSummary = await getNewUserSignupsSummary(30); // Last 30 days summary
    
    // Calculate growth metrics
    const totalSignups = signupsByDay.reduce((sum, day) => sum + day.new_users, 0);
    const avgDailySignups = signupsByDay.length > 0 ? (totalSignups / signupsByDay.length).toFixed(2) : 0;
    
    // Calculate growth rate (comparing first half vs second half of period)
    const midPoint = Math.floor(signupsByDay.length / 2);
    const firstHalf = signupsByDay.slice(midPoint).reduce((sum, day) => sum + day.new_users, 0);
    const secondHalf = signupsByDay.slice(0, midPoint).reduce((sum, day) => sum + day.new_users, 0);
    const growthRate = firstHalf > 0 ? (((secondHalf - firstHalf) / firstHalf) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        signupsByDay,
        summary: {
          totalSignups,
          avgDailySignups: parseFloat(avgDailySignups),
          growthRate: parseFloat(growthRate),
          totalRegularUsers: signupsSummary?.total_regular_users || 0,
          totalAdminUsers: signupsSummary?.total_admin_users || 0,
          avgUserAgeDays: signupsSummary?.avg_user_age_days || 0
        }
      },
      meta: {
        startDate: start,
        endDate: end,
        total: signupsByDay.length
      }
    });
  } catch (error) {
    next(error);
  }
}; 