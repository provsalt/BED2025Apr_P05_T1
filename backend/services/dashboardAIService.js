import Op/**
 * Generate AI nutrition predictions and recommendations based on user's meal history
 * @param {Object} nutritionData - User's nutrition data and trends
 * @returns {Promise<Object>} AI predictions and recommendations
 */
export const generateNutritionPredictionsNew = async (nutritionData) => {
  try {
    const response = await openai.chat.completions.create({'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI nutrition predictions and recommendations based on user's meal history
 * @param {Object} nutritionData - User's nutrition data and trends
 * @returns {Promise<Object>} AI predictions and recommendations
 */
export const generateNutritionPredictions = async (nutritionData) => {
  try {
    console.log("🚀 AI Service: Generating predictions for data:", JSON.stringify(nutritionData, null, 2));
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert AI assistant. Analyze nutrition data and provide personalized predictions and recommendations for elderly users.

          Respond with ONLY a valid JSON object in this exact structure:
          {
            "predictions": {
              "weeklyCalorieGoal": number,
              "proteinTarget": number,
              "improvementAreas": [string, string],
              "trendAnalysis": "detailed analysis string"
            },
            "recommendations": [
              {
                "category": "category name",
                "suggestion": "specific suggestion",
                "priority": "high|medium|low",
                "reasoning": "why this matters"
              }
            ],
            "insights": {
              "healthScore": number (0-100),
              "consistencyRating": number (0-10),
              "balanceAssessment": "assessment string"
            }
          }

          Focus on:
          - Realistic goals for elderly users
          - Evidence-based nutrition advice
          - Practical, actionable suggestions
          - Encouraging tone while being informative`
        },
        {
          role: "user",
          content: `Analyze this nutrition data and provide predictions:

          User's Nutrition Summary:
          - Daily average calories: ${nutritionData.avgCalories || 0}
          - Daily average protein: ${nutritionData.avgProtein || 0}g
          - Daily average carbs: ${nutritionData.avgCarbs || 0}g
          - Daily average fat: ${nutritionData.avgFat || 0}g
          - Total meals tracked: ${nutritionData.totalMeals || 0}
          - Analysis period: ${nutritionData.days || 7} days

          Based on this data, provide personalized nutrition predictions and recommendations.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const content = response.choices[0].message.content.trim();
    
    console.log("📝 AI Service: Response received");
    console.log("Content length:", content.length);
    console.log("Content preview:", content.substring(0, 200) + "...");
    
    try {
      const parsed = JSON.parse(content);
      console.log("✅ AI Service: Successfully parsed JSON with keys:", Object.keys(parsed));
      return parsed;
    } catch (parseError) {
      console.error("❌ AI Service: JSON parse error:", parseError.message);
      console.log("Full content that failed to parse:", content);
      
      // Try to extract JSON from markdown or other formatting
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("🔧 AI Service: Attempting to parse extracted JSON...");
        const extracted = JSON.parse(jsonMatch[0]);
        console.log("✅ AI Service: Successfully parsed extracted JSON");
        return extracted;
      }
      
      throw new Error("Could not parse AI predictions from response");
    }

  } catch (error) {
    console.error("💥 AI Service: API error:", error);
    throw new Error("Failed to generate nutrition predictions: " + error.message);
  }
};
