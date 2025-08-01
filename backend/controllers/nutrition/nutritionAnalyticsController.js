import { getNutritionAnalytics, getDailyNutritionBreakdown, getCaloriesTrend } from "../../models/nutrition/nutritionAnalyticsModel.js";
import { logError } from "../../utils/logger.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/nutrition/analytics:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Get nutrition analytics for a specific time period
 *     description: Returns comprehensive nutrition analytics including averages, totals, and daily breakdown for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to include in analytics (7 or 30).
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     avgDailyCalories:
 *                       type: number
 *                     avgProtein:
 *                       type: number
 *                     avgCarbs:
 *                       type: number
 *                     avgFat:
 *                       type: number
 *                     totalMeals:
 *                       type: integer
 *                     dailyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                     period:
 *                       type: integer
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch analytics
 */
export const getNutritionAnalyticsController = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;

    // Validate days parameter
    if (![7, 30].includes(days)) {
      throw ErrorFactory.validation("Days parameter must be 7 or 30");
    }

    const analytics = await getNutritionAnalytics(req.user.id, days);

    res.status(200).json({ 
      message: "Analytics retrieved successfully", 
      analytics: analytics || {}
    });
  } catch (error) {
    logError(error, req, { message: "Error fetching nutrition analytics" });
    next(error);
  }
};

/**
 * @openapi
 * /api/nutrition/analytics/daily:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Get daily nutrition breakdown
 *     description: Returns detailed daily nutrition breakdown for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to include in breakdown.
 *     responses:
 *       200:
 *         description: Daily breakdown retrieved successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch daily breakdown
 */
export const getDailyBreakdownController = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const breakdown = await getDailyNutritionBreakdown(req.user.id, days);

    res.status(200).json({ 
      message: "Daily breakdown retrieved successfully", 
      breakdown: breakdown || []
    });
  } catch (error) {
    logError(error, req, { message: "Error fetching daily breakdown" });
    next(error);
  }
};

/**
 * @openapi
 * /api/nutrition/analytics/trend:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Get calories trend data
 *     description: Returns calories trend data for charts for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to include in trend.
 *     responses:
 *       200:
 *         description: Trend data retrieved successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Failed to fetch trend data
 */
export const getCaloriesTrendController = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trend = await getCaloriesTrend(req.user.id, days);

    res.status(200).json({ 
      message: "Trend data retrieved successfully", 
      trend: trend || []
    });
  } catch (error) {
    logError(error, req, { message: "Error fetching calories trend" });
    next(error)
  }
};
