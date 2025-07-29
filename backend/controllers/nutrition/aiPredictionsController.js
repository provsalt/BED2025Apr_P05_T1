import { generateNutritionPredictionsNew as generateNutritionPredictions } from "../../services/openaiService.js";
import { getNutritionAnalytics, getCaloriesTrend } from "../../models/nutrition/nutritionAnalyticsModel.js";
import { getUser } from "../../models/user/userModel.js";

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
    
    // Get fresh user data to ensure we have current gender setting
    let currentUser;
    try {
      currentUser = await getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (userError) {
      console.error("Error fetching current user:", userError);
      // Fallback to req.user if database query fails
      currentUser = req.user;
    }
    
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

    // Prepare data for AI analysis with fresh user data
    const nutritionData = {
      avgCalories: analytics.avgDailyCalories || 0,
      avgProtein: analytics.avgProtein || 0,
      avgCarbs: analytics.avgCarbs || 0,
      avgFat: analytics.avgFat || 0,
      totalMeals: analytics.totalMeals || 0,
      days: days,
      dailyBreakdown: analytics.dailyBreakdown || [],
      trendData: trendData || [],
      gender: (currentUser.gender == 0 || currentUser.gender === '0') ? 'female' : 
              (currentUser.gender == 1 || currentUser.gender === '1') ? 'male' : 'unknown'
    };

    console.log(`AI Nutrition Generation - User Gender: ${currentUser.gender} (${nutritionData.gender}), User ID: ${req.user.id}`);

    // Always attempt AI call first, provide fallbacks only if AI fails
    let aiResponse;
    
    try {
      aiResponse = await generateNutritionPredictions(nutritionData);
      
      // Validate and enforce gender-specific calorie limits
      if (aiResponse && aiResponse.predictions && aiResponse.predictions.weeklyCalorieGoal) {
        const gender = currentUser.gender; // 0 or "0" = female, 1 or "1" = male
        const weeklyGoal = aiResponse.predictions.weeklyCalorieGoal;
        const dailyGoal = Math.round(weeklyGoal / 7);
        
        // Enforce gender-specific limits (0/"0" = female, 1/"1" = male)
        if ((gender == 0 || gender === '0') && dailyGoal > 2000) { // Female
          console.log(`Correcting female calorie goal from ${dailyGoal} to 1800`);
          aiResponse.predictions.weeklyCalorieGoal = 1800 * 7; // 12,600
        } else if ((gender == 1 || gender === '1') && dailyGoal < 1800) { // Male
          console.log(`Correcting male calorie goal from ${dailyGoal} to 2000`);
          aiResponse.predictions.weeklyCalorieGoal = 2000 * 7; // 14,000
        } else if ((gender == 0 || gender === '0') && dailyGoal < 1600) { // Female
          console.log(`Correcting female calorie goal from ${dailyGoal} to 1600`);
          aiResponse.predictions.weeklyCalorieGoal = 1600 * 7; // 11,200
        } else if ((gender == 1 || gender === '1') && dailyGoal > 2400) { // Male
          console.log(`Correcting male calorie goal from ${dailyGoal} to 2200`);
          aiResponse.predictions.weeklyCalorieGoal = 2200 * 7; // 15,400
        }
      }
      
    } catch (aiError) {
      console.error("AI service error:", aiError);
      
      // Provide context-specific fallbacks based on data availability
      if (analytics.totalMeals > 0) {
        // Gender-aware fallback calorie goals (0/"0" = female, 1/"1" = male)
        const gender = currentUser.gender; // 0 or "0" = female, 1 or "1" = male
        let fallbackDailyCalories;
        if (gender == 0 || gender === '0') { // Female
          fallbackDailyCalories = Math.min(Math.max(analytics.avgDailyCalories || 1800, 1600), 2000);
        } else if (gender == 1 || gender === '1') { // Male
          fallbackDailyCalories = Math.min(Math.max(analytics.avgDailyCalories || 2000, 1800), 2400);
        } else {
          fallbackDailyCalories = analytics.avgDailyCalories || 2000;
        }
        
        aiResponse = {
          predictions: {
            weeklyCalorieGoal: Math.round(fallbackDailyCalories * 7),
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
            balanceAssessment: "AI analysis temporarily unavailable. Continue tracking meals for insights."
          }
        };
      } else {
        // Gender-aware default response for users with no meal data (0/"0" = female, 1/"1" = male)
        const gender = currentUser.gender; // 0 or "0" = female, 1 or "1" = male
        let defaultDailyCalories;
        if (gender == 0 || gender === '0') { // Female
          defaultDailyCalories = 1800; // Mid-range for females
        } else if (gender == 1 || gender === '1') { // Male
          defaultDailyCalories = 2000; // Mid-range for males
        } else {
          defaultDailyCalories = 1900; // Neutral default
        }
        
        aiResponse = {
          predictions: {
            weeklyCalorieGoal: defaultDailyCalories * 7,
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
