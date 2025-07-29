import { 
  getPageVisitFrequency, 
  getLoginAttemptsAnalytics, 
  getFailedLoginAttempts,
  getDailyActiveUsers,
  getNewUserSignupsSummary
} from "../../models/analytics/analyticsModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/admin/analytics/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get comprehensive analytics for admin dashboard
 *     description: Retrieve aggregated analytics data for admin dashboard visualization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getDashboardAnalyticsController = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all analytics data in parallel
    const [
      pageVisits,
      loginAttempts,
      failedLogins,
      dailyActiveUsers,
      newUserSignups
    ] = await Promise.all([
      getPageVisitFrequency(startDate, endDate, 10), // Top 10 most visited pages
      getLoginAttemptsAnalytics(startDate, endDate),
      getFailedLoginAttempts(24), // Last 24 hours
      getDailyActiveUsers(startDate, endDate),
      getNewUserSignupsSummary(parseInt(days)) // New user signups for the period
    ]);

    // Calculate summary statistics
    const totalPageVisits = pageVisits.reduce((sum, page) => sum + page.visit_count, 0);
    const totalLoginAttempts = loginAttempts.reduce((sum, attempt) => sum + attempt.total_attempts, 0);
    const totalFailedAttempts = loginAttempts.reduce((sum, attempt) => sum + attempt.failed_attempts, 0);
    const successRate = totalLoginAttempts > 0 ? ((totalLoginAttempts - totalFailedAttempts) / totalLoginAttempts * 100).toFixed(2) : 0;

    // Get most popular features
    const featureUsage = pageVisits
      .filter(page => page.feature_name !== 'page_view')
      .reduce((acc, page) => {
        if (!acc[page.feature_name]) {
          acc[page.feature_name] = 0;
        }
        acc[page.feature_name] += page.visit_count;
        return acc;
      }, {});

    const popularFeatures = Object.entries(featureUsage)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalPageVisits,
          totalLoginAttempts,
          totalFailedAttempts,
          successRate: parseFloat(successRate),
          newUserSignups: newUserSignups?.total_new_users || 0,
          last7DaysSignups: newUserSignups?.last_7_days || 0,
          last30DaysSignups: newUserSignups?.last_30_days || 0,
          avgUserAgeDays: newUserSignups?.avg_user_age_days || 0,
          daysAnalyzed: parseInt(days)
        },
        pageVisits: pageVisits.slice(0, 10), // Top 10 pages
        popularFeatures,
        loginAttempts: loginAttempts.slice(0, 10), // Top 10 users by attempts
        failedLogins: failedLogins.slice(0, 10), // Top 10 failed attempts
        dailyActiveUsers,
        newUserSignups: {
          totalRegularUsers: newUserSignups?.total_regular_users || 0,
          totalAdminUsers: newUserSignups?.total_admin_users || 0,
          growthMetrics: {
            last7Days: newUserSignups?.last_7_days || 0,
            last30Days: newUserSignups?.last_30_days || 0
          }
        },
        securityAlerts: failedLogins.length > 0 ? {
          suspiciousIPs: failedLogins.filter(attempt => attempt.failed_attempts >= 5).length,
          totalSuspiciousAttempts: failedLogins.reduce((sum, attempt) => sum + attempt.failed_attempts, 0)
        } : null
      },
      meta: {
        startDate,
        endDate,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/admin/analytics/elderly-engagement:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get elderly user engagement analytics
 *     description: Retrieve analytics focused on elderly user behavior and feature usage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Elderly engagement analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getElderlyEngagementController = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get page visits for elderly-focused features
    const pageVisits = await getPageVisitFrequency(startDate, endDate, 50);
    
    // Filter for features most relevant to elderly users
    const elderlyFeatures = [
      'medical', 'nutrition', 'announcements', 'support', 'community'
    ];
    
    const elderlyEngagement = pageVisits.filter(page => 
      elderlyFeatures.includes(page.feature_name)
    );

    // Calculate feature popularity for elderly
    const featurePopularity = elderlyFeatures.map(feature => {
      const visits = elderlyEngagement.filter(page => page.feature_name === feature);
      const totalVisits = visits.reduce((sum, page) => sum + page.visit_count, 0);
      const uniqueUsers = visits.reduce((sum, page) => sum + page.unique_users, 0);
      
      return {
        feature,
        totalVisits,
        uniqueUsers,
        averageVisitsPerUser: uniqueUsers > 0 ? (totalVisits / uniqueUsers).toFixed(2) : 0
      };
    }).sort((a, b) => b.totalVisits - a.totalVisits);

    res.json({
      success: true,
      data: {
        featurePopularity,
        mostVisitedPages: elderlyEngagement.slice(0, 10),
        summary: {
          totalElderlyFeatureVisits: elderlyEngagement.reduce((sum, page) => sum + page.visit_count, 0),
          uniqueElderlyUsers: new Set(elderlyEngagement.flatMap(page => page.unique_users)).size,
          daysAnalyzed: parseInt(days)
        }
      },
      meta: {
        startDate,
        endDate,
        generatedAt: new Date(),
        note: "Analytics focused on features most relevant to elderly users"
      }
    });
  } catch (error) {
    next(error);
  }
}; 