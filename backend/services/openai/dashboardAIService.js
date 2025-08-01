import OpenAI from 'openai';
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
export const generateNutritionPredictionsNew = async (nutritionData) => {
  try {
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
              "balanceAssessment": "assessment string"
            }
          }

          Focus on:
          - Gender-specific nutrition needs for elderly users
          - Realistic goals for elderly users (1600-2000 daily calories)
          - Weekly calorie goals should be 7x daily target (11,200-16,800 total)
          - Evidence-based nutrition advice tailored to gender
          - Practical, actionable suggestions
          - Encouraging tone while being informative`
        },
        {
          role: "user",
          content: `Analyze this nutrition data and provide predictions:

          User's Nutrition Summary:
          - Gender: ${nutritionData.gender || 'unknown'}
          - Daily average calories: ${nutritionData.avgCalories || 0}
          - Daily average protein: ${nutritionData.avgProtein || 0}g
          - Daily average carbs: ${nutritionData.avgCarbs || 0}g
          - Daily average fat: ${nutritionData.avgFat || 0}g
          - Total meals tracked: ${nutritionData.totalMeals || 0}
          - Analysis period: ${nutritionData.days || 7} days

          Gender-Specific Guidelines for elderly nutrition:
          
          For MALES:
          - Daily calorie needs: 1800-2400 calories (generally higher due to larger body mass)
          - Protein target: 56-75g daily (1.0-1.2g per kg body weight)
          - Focus areas: Heart health, prostate health, muscle maintenance
          - Common deficiencies: Fiber, potassium, magnesium
          
          For FEMALES:
          - Daily calorie needs: 1600-2000 calories (generally lower due to smaller body mass)
          - Protein target: 46-65g daily (1.0-1.2g per kg body weight)
          - Focus areas: Bone health (calcium, vitamin D), iron, heart health
          - Common deficiencies: Calcium, iron, vitamin D, folate
          
          General guidelines:
          - Weekly calorie goal should be 7 times the daily target
          - Consider user's current intake when setting realistic goals
          - If user's current intake is very low, suggest gradual increases
          - Tailor recommendations based on gender-specific health needs

          Based on this data and gender-specific needs, provide personalized nutrition predictions and recommendations.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const content = response.choices[0].message.content.trim();
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      // Try to extract JSON from markdown or other formatting
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return extracted;
      }
      
      throw new Error("Could not parse AI predictions from response");
    }

  } catch (error) {
    console.error("AI Service API error:", error);
    throw new Error("Failed to generate nutrition predictions: " + error.message);
  }
};
