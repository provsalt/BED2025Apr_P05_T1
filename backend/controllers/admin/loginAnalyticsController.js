import {
  getLoginAnalyticsByUserId,
  getLoginAnalyticsSummary,
  getLoginAttemptsByDay,
  getTopUsersByLoginAttempts,
  getSuspiciousLoginAttempts,
  getLoginAttemptsAnalytics
} from "../../models/analytics/analyticsModel.js";

/**
 * Get login analytics summary for admin dashboard
 */
export const getLoginAnalyticsSummaryController = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const summary = await getLoginAnalyticsSummary(parseInt(days));
    const attemptsByDay = await getLoginAttemptsByDay(parseInt(days));
    const topUsers = await getTopUsersByLoginAttempts(10, parseInt(days));
    const suspiciousAttempts = await getSuspiciousLoginAttempts(24, 3);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalAttempts: summary?.total_attempts || 0,
          totalSuccessful: summary?.total_successful || 0,
          totalFailed: summary?.total_failed || 0,
          uniqueUsers: summary?.unique_users || 0,
          uniqueEmails: summary?.unique_emails || 0,
          uniqueIPs: summary?.unique_ips || 0,
          successRate: summary?.success_rate || 0,
          lastAttempt: summary?.last_attempt,
          firstAttempt: summary?.first_attempt
        },
        attemptsByDay,
        topUsers,
        suspiciousAttempts: suspiciousAttempts.slice(0, 10) // Limit to top 10
      },
      meta: {
        days: parseInt(days),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get login analytics for a specific user
 */
export const getUserLoginAnalyticsController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const userAnalytics = await getLoginAnalyticsByUserId(
      parseInt(userId), 
      start, 
      end
    );
    
    // Calculate summary for this user
    const totalAttempts = userAnalytics.reduce((sum, record) => sum + record.total_attempts, 0);
    const successfulAttempts = userAnalytics.reduce((sum, record) => sum + record.successful_attempts, 0);
    const failedAttempts = userAnalytics.reduce((sum, record) => sum + record.failed_attempts, 0);
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        userId: parseInt(userId),
        summary: {
          totalAttempts,
          successfulAttempts,
          failedAttempts,
          successRate: parseFloat(successRate.toFixed(2)),
          lastAttempt: userAnalytics[0]?.last_attempt || null
        },
        details: userAnalytics
      },
      meta: {
        startDate: start,
        endDate: end,
        total: userAnalytics.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get login attempts by day for charts
 */
export const getLoginAttemptsByDayController = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const attemptsByDay = await getLoginAttemptsByDay(parseInt(days));
    
    res.json({
      success: true,
      data: attemptsByDay,
      meta: {
        days: parseInt(days),
        total: attemptsByDay.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top users by login attempts
 */
export const getTopUsersByLoginAttemptsController = async (req, res, next) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    
    const topUsers = await getTopUsersByLoginAttempts(parseInt(limit), parseInt(days));
    
    res.json({
      success: true,
      data: topUsers,
      meta: {
        limit: parseInt(limit),
        days: parseInt(days),
        total: topUsers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suspicious login attempts
 */
export const getSuspiciousLoginAttemptsController = async (req, res, next) => {
  try {
    const { hours = 24, minFailures = 3 } = req.query;
    
    const suspiciousAttempts = await getSuspiciousLoginAttempts(
      parseInt(hours), 
      parseInt(minFailures)
    );
    
    res.json({
      success: true,
      data: suspiciousAttempts,
      meta: {
        hours: parseInt(hours),
        minFailures: parseInt(minFailures),
        total: suspiciousAttempts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed login attempts analytics
 */
export const getDetailedLoginAttemptsController = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const detailedAttempts = await getLoginAttemptsAnalytics(start, end);
    
    // Limit results
    const limitedAttempts = detailedAttempts.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: limitedAttempts,
      meta: {
        startDate: start,
        endDate: end,
        limit: parseInt(limit),
        total: detailedAttempts.length,
        returned: limitedAttempts.length
      }
    });
  } catch (error) {
    next(error);
  }
}; 