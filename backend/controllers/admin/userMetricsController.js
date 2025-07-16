import {
  getUserMetricsByAge,
  getMostFrequentPages,
  getLoginAttemptStats,
  getFailedLoginAttempts,
  getUserMetricsDashboard,
  getAllUsersEngagementMetrics
} from "../../models/admin/analyticsModel.js";
import { z } from "zod/v4";

/**
 * @openapi
 * /api/admin/metrics/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get user metrics dashboard data
 *     description: Get comprehensive user metrics for the admin dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getDashboardMetricsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    const dateValidation = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    }).safeParse({ startDate, endDate });
    
    if (!dateValidation.success) {
      return res.status(400).json({
        error: "Invalid date parameters",
        details: dateValidation.error.issues
      });
    }
    
    const start = new Date(dateValidation.data.startDate);
    const end = new Date(dateValidation.data.endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }
    
    const dashboardData = await getUserMetricsDashboard(start, end);
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard metrics"
    });
  }
};

/**
 * @openapi
 * /api/admin/metrics/age-groups:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get user metrics by age group
 *     description: Get user engagement metrics broken down by age groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Age group metrics retrieved successfully
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getAgeGroupMetricsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    const dateValidation = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    }).safeParse({ startDate, endDate });
    
    if (!dateValidation.success) {
      return res.status(400).json({
        error: "Invalid date parameters",
        details: dateValidation.error.issues
      });
    }
    
    const start = new Date(dateValidation.data.startDate);
    const end = new Date(dateValidation.data.endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }
    
    const ageGroupData = await getUserMetricsByAge(start, end);
    
    res.status(200).json({
      success: true,
      data: ageGroupData
    });
  } catch (error) {
    console.error("Error fetching age group metrics:", error);
    res.status(500).json({
      error: "Failed to fetch age group metrics"
    });
  }
};

/**
 * @openapi
 * /api/admin/metrics/popular-pages:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get most frequently visited pages
 *     description: Get analytics on the most popular pages in the application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of pages to return
 *     responses:
 *       200:
 *         description: Popular pages data retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getPopularPagesController = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    // Validate parameters
    const validation = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
      limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50))
    }).safeParse({ startDate, endDate, limit });
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: validation.error.issues
      });
    }
    
    const start = new Date(validation.data.startDate);
    const end = new Date(validation.data.endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }
    
    const popularPages = await getMostFrequentPages(start, end, validation.data.limit);
    
    res.status(200).json({
      success: true,
      data: popularPages
    });
  } catch (error) {
    console.error("Error fetching popular pages:", error);
    res.status(500).json({
      error: "Failed to fetch popular pages"
    });
  }
};

/**
 * @openapi
 * /api/admin/metrics/login-attempts:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get login attempt statistics
 *     description: Get analytics on user login attempts (successful and failed)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Login attempt statistics retrieved successfully
 *       400:
 *         description: Invalid date parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getLoginAttemptStatsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    const dateValidation = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    }).safeParse({ startDate, endDate });
    
    if (!dateValidation.success) {
      return res.status(400).json({
        error: "Invalid date parameters",
        details: dateValidation.error.issues
      });
    }
    
    const start = new Date(dateValidation.data.startDate);
    const end = new Date(dateValidation.data.endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }
    
    const loginStats = await getLoginAttemptStats(start, end);
    
    res.status(200).json({
      success: true,
      data: loginStats
    });
  } catch (error) {
    console.error("Error fetching login attempt stats:", error);
    res.status(500).json({
      error: "Failed to fetch login attempt statistics"
    });
  }
};

/**
 * @openapi
 * /api/admin/metrics/failed-logins:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get failed login attempts
 *     description: Get details of failed login attempts for security monitoring
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of failed attempts to return
 *     responses:
 *       200:
 *         description: Failed login attempts retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getFailedLoginAttemptsController = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    
    // Validate parameters
    const validation = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
      limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(500))
    }).safeParse({ startDate, endDate, limit });
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: validation.error.issues
      });
    }
    
    const start = new Date(validation.data.startDate);
    const end = new Date(validation.data.endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }
    
    const failedAttempts = await getFailedLoginAttempts(start, end, validation.data.limit);
    
    res.status(200).json({
      success: true,
      data: failedAttempts
    });
  } catch (error) {
    console.error("Error fetching failed login attempts:", error);
    res.status(500).json({
      error: "Failed to fetch failed login attempts"
    });
  }
};

/**
 * @openapi
 * /api/admin/metrics/user-engagement:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get user engagement metrics
 *     description: Get detailed user engagement metrics for all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip
 *     responses:
 *       200:
 *         description: User engagement metrics retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getUserEngagementController = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    // Validate parameters
    const validation = z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
      limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(1000)),
      offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0))
    }).safeParse({ startDate, endDate, limit, offset });
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid parameters",
        details: validation.error.issues
      });
    }
    
    const start = new Date(validation.data.startDate);
    const end = new Date(validation.data.endDate);
    
    if (start > end) {
      return res.status(400).json({
        error: "Start date must be before end date"
      });
    }
    
    const engagementData = await getAllUsersEngagementMetrics(
      start, 
      end, 
      validation.data.limit, 
      validation.data.offset
    );
    
    res.status(200).json({
      success: true,
      data: engagementData
    });
  } catch (error) {
    console.error("Error fetching user engagement metrics:", error);
    res.status(500).json({
      error: "Failed to fetch user engagement metrics"
    });
  }
}; 