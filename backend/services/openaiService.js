import OpenAI from 'openai';
import dotenv from 'dotenv';
import {z} from "zod/v4";
import {nutritionSchema} from "../utils/validation/nutrition.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze food image using OpenAI GPT-4 Vision API
 * @param {Buffer} imageBuffer - The processed image buffer
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeFoodImage = async (imageBuffer) => {
  try {
    const res = nutritionSchema.extend({
      error: z.string().describe("Error message if no food is detected")
    });

    const response = await openai.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "Analyze the food image and provide detailed nutritional information. If the image does not contain any food, please do not analyze the image. Be as accurate as possible with the nutritional estimates. Even if you cannot identify exact details, you can estimate it. If it does not contain any food, please do not analyze the image and place an error message."
        },
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
            }
          ]
        }
      ],
      text: {
        format: {
          name: "nutrition-analysis",
          type: "json_schema",
          strict: true,
          schema: z.toJSONSchema(res, {target: 'draft-7'}),
        },
      },
    });

   return response.output_parsed

  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze food image");
  }
}; 

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
          - STRICT adherence to gender-specific nutrition needs for elderly users
          - MANDATORY gender-based calorie ranges: Males 1800-2400, Females 1600-2000
          - Weekly calorie goals should be 7x daily target (11,200-16,800 total)
          - Evidence-based nutrition advice tailored to gender
          - Practical, actionable suggestions
          - Encouraging tone while being informative
          
          IMPORTANT: Always respect gender-specific calorie limits. Never exceed 2000 calories daily for females or go below 1800 for males.`
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

          CRITICAL: Use gender-specific calorie recommendations based on the user's gender above.

          MANDATORY Gender-Specific Guidelines for elderly nutrition:
          
          If Gender is MALE or male:
          - MUST set daily calorie target between 1800-2400 calories ONLY
          - Weekly calorie goal = daily target × 7 (12,600-16,800 range)
          - Protein target: 56-75g daily
          - Focus: Heart health, prostate health, muscle maintenance
          
          If Gender is FEMALE or female:
          - MUST set daily calorie target between 1600-2000 calories ONLY  
          - Weekly calorie goal = daily target × 7 (11,200-14,000 range)
          - Protein target: 46-65g daily
          - Focus: Bone health (calcium, vitamin D), iron, heart health
          
          VALIDATION RULES:
          - If gender is female/FEMALE: weeklyCalorieGoal must be ≤ 14,000 (2000×7)
          - If gender is male/MALE: weeklyCalorieGoal must be ≥ 12,600 (1800×7)
          - Consider user's current intake when setting realistic goals within gender ranges
          - If user's current intake is very low, suggest gradual increases within gender limits

          Based on this data and STRICT gender-specific needs, provide personalized nutrition predictions and recommendations.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const content = response.choices[0].message.content.trim();
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Could not parse AI predictions from response");
    }

  } catch (error) {
    console.error("Dashboard AI API error:", error);
    throw new Error("Failed to generate nutrition predictions: " + error.message);
  }
}; 