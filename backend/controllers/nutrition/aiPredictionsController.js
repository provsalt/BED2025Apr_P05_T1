import { generateNutritionPredictionsNew as generateNutritionPredictions } from "../../services/openai/openaiService.js";
import { getNutritionAnalytics, getCaloriesTrend } from "../../models/nutrition/nutritionAnalyticsModel.js";
import { getUser } from "../../models/user/userModel.js";
import { GENDER, CALORIE_LIMITS, HEALTH_SCORES } from "../../utils/constants.js";

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

    // Prepare comprehensive data for AI analysis with fresh user data
    const genderString = parseInt(currentUser.gender) === GENDER.FEMALE ? 'female' : 
                        parseInt(currentUser.gender) === GENDER.MALE ? 'male' : 'unknown';
    
    const nutritionData = {
      // User profile information
      userId: req.user.id,
      gender: genderString,
      userAge: currentUser.date_of_birth ? 
        Math.floor((new Date() - new Date(currentUser.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
      
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

    // Always attempt AI call first, provide fallbacks only if AI fails
    let aiResponse;
    
    try {
      aiResponse = await generateNutritionPredictions(nutritionData);
      
      // Validate and enforce gender-specific calorie limits
      if (aiResponse && aiResponse.predictions && aiResponse.predictions.weeklyCalorieGoal) {
        const gender = parseInt(currentUser.gender);
        const weeklyGoal = aiResponse.predictions.weeklyCalorieGoal;
        const dailyGoal = Math.round(weeklyGoal / 7);
        
        // Enforce gender-specific limits (0 = female, 1 = male)
        if (gender === GENDER.FEMALE && dailyGoal > CALORIE_LIMITS.FEMALE.MAX) {
          aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.FEMALE.DEFAULT * 7;
        } else if (gender === GENDER.MALE && dailyGoal < CALORIE_LIMITS.MALE.MIN) {
          aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.MALE.DEFAULT * 7;
        } else if (gender === GENDER.FEMALE && dailyGoal < CALORIE_LIMITS.FEMALE.MIN) {
          aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.FEMALE.MIN * 7;
        } else if (gender === GENDER.MALE && dailyGoal > CALORIE_LIMITS.MALE.MAX) {
          aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.MALE.MAX * 7;
        }
      }
      
    } catch (aiError) {
      
      // Provide context-specific fallbacks based on data availability
      if (analytics.totalMeals > 0) {
        // Gender-aware fallback calorie goals using constants
        const gender = parseInt(currentUser.gender);
        let fallbackDailyCalories, genderSpecificAdvice;
        
        if (gender === GENDER.FEMALE) {
          fallbackDailyCalories = Math.min(Math.max(analytics.avgDailyCalories || CALORIE_LIMITS.FEMALE.DEFAULT, CALORIE_LIMITS.FEMALE.MIN), CALORIE_LIMITS.FEMALE.MAX);
          genderSpecificAdvice = "Focus on calcium-rich foods for bone health and iron-rich foods to maintain energy levels.";
        } else if (gender === GENDER.MALE) {
          fallbackDailyCalories = Math.min(Math.max(analytics.avgDailyCalories || CALORIE_LIMITS.MALE.DEFAULT, CALORIE_LIMITS.MALE.MIN), CALORIE_LIMITS.MALE.MAX);
          genderSpecificAdvice = "Focus on lean proteins for muscle maintenance and heart-healthy fats for cardiovascular health.";
        } else {
          fallbackDailyCalories = analytics.avgDailyCalories || 1900;
          genderSpecificAdvice = "Maintain a balanced diet with adequate protein and nutrients.";
        }
        
        aiResponse = {
          predictions: {
            weeklyCalorieGoal: Math.round(fallbackDailyCalories * 7),
            proteinTarget: Math.round(analytics.avgProtein || (gender === GENDER.FEMALE ? 50 : 65)),
            improvementAreas: ["AI analysis temporarily unavailable", "Continue tracking meals"],
            trendAnalysis: `Based on your ${genderString} profile, your current average of ${Math.round(analytics.avgDailyCalories || 0)} calories per day. ${genderSpecificAdvice}`
          },
          recommendations: [
            {
              category: "Gender-Specific Nutrition",
              suggestion: gender === GENDER.FEMALE ? 
                "Focus on calcium and iron-rich foods for bone and energy health" : 
                gender === GENDER.MALE ? 
                "Prioritize lean proteins and heart-healthy fats for muscle and cardiovascular health" :
                "Maintain a balanced diet with adequate nutrients",
              priority: "medium",
              reasoning: "Tailored advice based on your gender-specific nutritional needs."
            },
            {
              category: "Data Tracking",
              suggestion: "AI analysis is temporarily unavailable, but continue tracking meals for better insights.",
              priority: "low",
              reasoning: "Consistent meal tracking improves AI prediction accuracy."
            }
          ],
          insights: {
            healthScore: HEALTH_SCORES.DEFAULT_WITH_DATA,
            balanceAssessment: `Based on your ${genderString} profile: ${genderSpecificAdvice} Continue tracking for personalized insights.`
          }
        };
      } else {
        // Gender-aware default response for users with no meal data
        const gender = parseInt(currentUser.gender);
        let defaultDailyCalories, genderWelcomeMessage, genderRecommendations;
        
        if (gender === GENDER.FEMALE) {
          defaultDailyCalories = CALORIE_LIMITS.FEMALE.DEFAULT;
          genderWelcomeMessage = "As a female user, focus on calcium for bone health and iron for energy.";
          genderRecommendations = [
            {
              category: "Bone Health",
              suggestion: "Include calcium-rich foods like dairy, leafy greens, and fortified foods.",
              priority: "high",
              reasoning: "Calcium is essential for maintaining strong bones, especially important for women."
            },
            {
              category: "Energy & Iron",
              suggestion: "Add iron-rich foods like lean meats, beans, and spinach to your meals.",
              priority: "medium",
              reasoning: "Women have higher iron needs to maintain energy levels and prevent deficiency."
            }
          ];
        } else if (gender === GENDER.MALE) {
          defaultDailyCalories = CALORIE_LIMITS.MALE.DEFAULT;
          genderWelcomeMessage = "As a male user, focus on lean proteins for muscle maintenance and heart-healthy fats.";
          genderRecommendations = [
            {
              category: "Muscle Health",
              suggestion: "Include lean proteins like chicken, fish, and legumes in each meal.",
              priority: "high",
              reasoning: "Men typically have higher muscle mass and protein needs for maintenance."
            },
            {
              category: "Heart Health",
              suggestion: "Choose heart-healthy fats from nuts, olive oil, and fatty fish.",
              priority: "medium",
              reasoning: "Heart disease prevention is crucial, with omega-3s supporting cardiovascular health."
            }
          ];
        } else {
          defaultDailyCalories = 1900;
          genderWelcomeMessage = "Focus on balanced nutrition with adequate protein and nutrients.";
          genderRecommendations = [
            {
              category: "Balanced Nutrition",
              suggestion: "Aim for a variety of foods from all food groups.",
              priority: "medium",
              reasoning: "A balanced approach ensures you get all essential nutrients."
            }
          ];
        }
        
        aiResponse = {
          predictions: {
            weeklyCalorieGoal: defaultDailyCalories * 7,
            proteinTarget: gender === GENDER.FEMALE ? 50 : gender === GENDER.MALE ? 65 : 60,
            improvementAreas: ["Start meal tracking", `Focus on ${genderString}-specific nutrition`],
            trendAnalysis: `Welcome! ${genderWelcomeMessage} Start tracking your nutrition to see personalized insights!`
          },
          recommendations: [
            {
              category: "Getting Started",
              suggestion: "Upload your first meal photo to begin nutrition tracking.",
              priority: "high",
              reasoning: "Building a meal history is the first step to personalized nutrition insights."
            },
            ...genderRecommendations,
            {
              category: "Consistency",
              suggestion: "Try to eat meals at regular times each day.",
              priority: "low",
              reasoning: "Regular meal timing can help establish healthy eating patterns."
            }
          ],
          insights: {
            healthScore: HEALTH_SCORES.DEFAULT_NO_DATA,
            balanceAssessment: `Welcome to gender-specific nutrition tracking! ${genderWelcomeMessage} Upload your meals to get personalized insights.`
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
    
    res.status(500).json({ 
      error: "Failed to generate AI predictions",
      details: error.message 
    });
  }
};
