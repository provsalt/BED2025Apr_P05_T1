import { AIPredictionService } from "../../services/nutrition/aiPredictionService.js";
import { NutritionDataService } from "../../services/nutrition/nutritionDataService.js";
import { logError } from "../../utils/logger.js";/**
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
 *       - in: query
 *         name: agentic
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to use agentic AI with web search and code interpreter.
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
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const days = parseInt(req.query.days) || 7;
    const useAgentic = req.query.agentic !== 'false'; // Default to true
    
    logError(`Generating AI predictions for user ${req.user.id}, days: ${days}, agentic: ${useAgentic}`);
    
    // Get user nutrition data
    const { user, analytics, trendData } = await NutritionDataService.getUserNutritionData(
      req.user.id, 
      days
    );
    
    // Format data for AI analysis
    const nutritionData = NutritionDataService.formatForAIAnalysis(
      user, 
      analytics, 
      trendData, 
      days
    );

    // Generate AI predictions with agentic capabilities
    const aiResponse = await AIPredictionService.generatePredictions(
      nutritionData, 
      user, 
      useAgentic
    );
    
    res.status(200).json({ 
      message: "AI predictions generated successfully",
      ...aiResponse,
      dataAnalyzed: {
        daysOfData: days,
        totalMeals: analytics.totalMeals,
        agenticMode: useAgentic,
        agenticSuccess: aiResponse.agenticSuccess || false,
        enhancedAnalysis: aiResponse.enhancedAnalysis || false,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logError(error, req, { message: "Error generating AI predictions" });
    if (error.message === 'User not found') {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({
      error: "Failed to generate AI predictions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};