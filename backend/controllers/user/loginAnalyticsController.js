import {
  getUserLoginAttemptsAnalytics,
  getUserRecentLoginAttempts,
  getUserFailedLoginAttempts,
  getLoginAttemptsByEmail,
  getOverallLoginAnalytics
} from '../../models/user/userModel.js';
import { ErrorFactory } from '../../utils/AppError.js';

/**
 * Get login analytics for a specific user
 */
export const getUserLoginAnalyticsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const days = parseInt(req.query.days) || 30;

    if (isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }

    const analytics = await getUserLoginAttemptsAnalytics(userId, days);
    
    if (!analytics) {
      // Return default values when no data found
      return res.json({
        total_attempts: 0,
        successful_attempts: 0,
        failed_attempts: 0,
        days_with_attempts: 0,
        first_attempt: null,
        last_attempt: null,
        success_rate: 0
      });
    }

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent login attempts for a specific user
 */
export const getUserRecentLoginAttemptsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 20;

    if (isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }

    const attempts = await getUserRecentLoginAttempts(userId, limit);
    res.json(attempts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get failed login attempts for a specific user (for security monitoring)
 */
export const getUserFailedLoginAttemptsController = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const hours = parseInt(req.query.hours) || 24;

    if (isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }

    const failedAttempts = await getUserFailedLoginAttempts(userId, hours);
    res.json(failedAttempts || { failed_attempts: 0, unique_ip_addresses: 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * Get login attempts by email (admin only - for non-existent users)
 */
export const getLoginAttemptsByEmailController = async (req, res, next) => {
  try {
    const { email } = req.query;
    const days = parseInt(req.query.days) || 30;

    if (!email) {
      throw ErrorFactory.validation("Email parameter is required");
    }

    const attempts = await getLoginAttemptsByEmail(email, days);
    res.json(attempts || { total_attempts: 0, successful_attempts: 0, failed_attempts: 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overall login analytics for admin dashboard
 */
export const getOverallLoginAnalyticsController = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const analytics = await getOverallLoginAnalytics(days);
    res.json(analytics || { 
      total_attempts: 0, 
      successful_attempts: 0, 
      failed_attempts: 0,
      unique_users: 0,
      unique_emails: 0,
      overall_success_rate: 0,
      days_with_activity: 0
    });
  } catch (error) {
    next(error);
  }
}; 