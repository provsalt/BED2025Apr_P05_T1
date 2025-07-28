import { generateNutritionPredictionsNew as generateNutritionPredictions } from "../../services/openaiService.js";
import { getNutritionAnalytics, getCaloriesTrend } from "../../models/nutrition/nutritionAnalyticsModel.js";

/**
 * @openapi
 * /api/nutrition/ai-predictions:
 *   get:
 *     tags:
 *       - Nutrition
 *     summary: Get AI-powered nutrition predictions and recommendations
 *     description: Uses AI to analyze user's nutrition data and provide personalized predictions and recommendations.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: false
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days of data to analyze (7, 14, or 30).
 *     responses:
 *       200:
 *         description: AI predictions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 predictions:
 *                   type: object
 *                   properties:
 *                     weeklyCalorieGoal:
 *                       type: number
 *                     proteinTarget:
 *                       type: number
 *                     improvementAreas:
 *                       type: array
 *                       items:
 *                         type: string
 *                     trendAnalysis:
 *                       type: string
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       suggestion:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       reasoning:
 *                         type: string
 *                 insights:
 *                   type: object
 *                   properties:
 *                     healthScore:
 *                       type: number
 *                     consistencyRating:
 *                       type: number
 *                     balanceAssessment:
 *                       type: string
 *       401:
 *         description: User not authenticated
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Failed to generate predictions
 */
export const getAIPredictionsController = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const days = parseInt(req.query.days) || 7;
    
    // Get user's nutrition analytics and trend data with better error handling
    let analytics, trendData;
    
    try {
      [analytics, trendData] = await Promise.all([
        getNutritionAnalytics(req.user.id, days),
        getCaloriesTrend(req.user.id, days)
      ]);
    } catch (dbError) {
      console.error("Database error in AI predictions:", dbError);
      
      // Provide fallback data if database fails
      analytics = {
        avgDailyCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        totalMeals: 0,
        dailyBreakdown: [],
        period: days
      };
      trendData = [];
    }

    // Prepare data for AI analysis
    const nutritionData = {
      avgCalories: analytics.avgDailyCalories || 0,
      avgProtein: analytics.avgProtein || 0,
      avgCarbs: analytics.avgCarbs || 0,
      avgFat: analytics.avgFat || 0,
      totalMeals: analytics.totalMeals || 0,
      days: days,
      dailyBreakdown: analytics.dailyBreakdown || [],
      trendData: trendData || []
    };

    // Always attempt AI call first, provide fallbacks only if AI fails
    let aiResponse;
    
    try {
      aiResponse = await generateNutritionPredictions(nutritionData);
    } catch (aiError) {
      console.error("AI service error:", aiError);
      
      // Provide context-specific fallbacks based on data availability
      if (analytics.totalMeals > 0) {
        aiResponse = {
          predictions: {
            weeklyCalorieGoal: Math.round((analytics.avgDailyCalories || 2000) * 7),
            proteinTarget: Math.round(analytics.avgProtein || 60),
            improvementAreas: ["AI analysis temporarily unavailable"],
            trendAnalysis: "AI analysis is currently unavailable. Your current average is " + Math.round(analytics.avgDailyCalories || 0) + " calories per day."
          },
          recommendations: [
            {
              category: "Data Available",
              suggestion: "AI analysis is temporarily unavailable, but your nutrition data shows you're tracking meals.",
              priority: "medium",
              reasoning: "Continue tracking for personalized insights when AI service is restored."
            }
          ],
          insights: {
            healthScore: 75,
            consistencyRating: Math.min(analytics.totalMeals, 10),
            balanceAssessment: "AI analysis temporarily unavailable. Continue tracking meals for insights."
          }
        };
      } else {
        // Default response for users with no meal data
        aiResponse = {
          predictions: {
            weeklyCalorieGoal: 14000,
            proteinTarget: 60,
            improvementAreas: ["Start meal tracking", "Focus on balanced nutrition"],
            trendAnalysis: "No meal data available yet. Start tracking your nutrition to see personalized insights!"
          },
          recommendations: [
            {
              category: "Getting Started",
              suggestion: "Upload your first meal photo to begin nutrition tracking.",
              priority: "high",
              reasoning: "Building a meal history is the first step to personalized nutrition insights."
            },
            {
              category: "Health",
              suggestion: "Include protein-rich foods in each meal for muscle health.",
              priority: "medium",
              reasoning: "Adequate protein is especially important for maintaining muscle mass and strength."
            },
            {
              category: "Consistency",
              suggestion: "Try to eat meals at regular times each day.",
              priority: "low",
              reasoning: "Regular meal timing can help establish healthy eating patterns."
            }
          ],
          insights: {
            healthScore: 50,
            consistencyRating: 0,
            balanceAssessment: "Welcome to nutrition tracking! Upload your meals to get personalized insights."
          }
        };
      }
    }
    
    res.status(200).json({ 
      message: "AI predictions generated successfully",
      ...aiResponse,
      dataAnalyzed: {
        daysOfData: days,
        totalMeals: analytics.totalMeals,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error generating AI predictions:", error);
    
    res.status(500).json({ 
      error: "Failed to generate AI predictions",
      details: error.message 
    });
  }
};
