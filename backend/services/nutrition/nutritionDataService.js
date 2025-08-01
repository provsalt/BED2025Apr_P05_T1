import { getNutritionAnalytics, getCaloriesTrend } from "../../models/nutrition/nutritionAnalyticsModel.js";
import { getUser } from "../../models/user/userModel.js";

/**
 * Service for handling nutrition data operations
 */
export class NutritionDataService {
  /**
   * Get comprehensive nutrition data for a user
   * @param {number} userId - User ID
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Nutrition data including analytics and trends
   */
  static async getUserNutritionData(userId, days = 7) {
    const [user, analytics, trendData] = await Promise.allSettled([
      getUser(userId),
      getNutritionAnalytics(userId, days),
      getCaloriesTrend(userId, days)
    ]);

    // Handle user data
    let currentUser;
    if (user.status === 'fulfilled' && user.value) {
      currentUser = user.value;
    } else {
      console.warn('Failed to fetch fresh user data:', user.reason?.message);
      // This should be handled by the caller
      throw new Error('User not found');
    }

    // Handle analytics data with fallbacks
    const analyticsData = analytics.status === 'fulfilled' 
      ? analytics.value 
      : this.getDefaultAnalytics(days);

    const trendDataResult = trendData.status === 'fulfilled' 
      ? trendData.value 
      : [];

    if (analytics.status === 'rejected') {
      console.warn('Failed to fetch analytics data:', analytics.reason?.message);
    }
    if (trendData.status === 'rejected') {
      console.warn('Failed to fetch trend data:', trendData.reason?.message);
    }

    return {
      user: currentUser,
      analytics: analyticsData,
      trendData: trendDataResult
    };
  }

  /**
   * Transform user data for AI analysis
   * @param {Object} user - User object
   * @param {Object} analytics - Analytics data
   * @param {Array} trendData - Trend data
   * @param {number} days - Number of days analyzed
   * @returns {Object} Formatted nutrition data for AI
   */
  static formatForAIAnalysis(user, analytics, trendData, days) {
    const genderString = this.getGenderString(user.gender);
    
    return {
      // User profile information
      userId: user.id,
      gender: genderString,
      userAge: this.calculateAge(user.date_of_birth),
      
      // Nutrition analytics
      avgCalories: analytics.avgDailyCalories || 0,
      avgProtein: analytics.avgProtein || 0,
      avgCarbs: analytics.avgCarbs || 0,
      avgFat: analytics.avgFat || 0,
      totalMeals: analytics.totalMeals || 0,
      days: days,
      dailyBreakdown: analytics.dailyBreakdown || [],
      trendData: trendData || [],
      
      // Analysis metadata
      analysisDate: new Date().toISOString(),
      hasHistoricalData: analytics.totalMeals > 0
    };
  }

  /**
   * Get default analytics when database fails
   */
  static getDefaultAnalytics(days) {
    return {
      avgDailyCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      totalMeals: 0,
      dailyBreakdown: [],
      period: days
    };
  }

  /**
   * Helper methods
   */
  static getGenderString(gender) {
    const genderInt = parseInt(gender);
    return genderInt === 0 ? 'female' : 
           genderInt === 1 ? 'male' : 'unknown';
  }

  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    
    const birth = new Date(dateOfBirth);
    const now = new Date();
    return Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));
  }
}
