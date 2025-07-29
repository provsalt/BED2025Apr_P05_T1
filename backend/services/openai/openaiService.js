import OpenAI from 'openai';
import dotenv from 'dotenv';
import {z} from "zod/v4";
import {nutritionSchema} from "../../utils/validation/nutrition.js";

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
 * Check if content violates OpenAI usage policies using moderation API
 * @param {string} content - Content to moderate
 * @returns {Promise<Object>} Moderation result with flagged status and categories
 */
export const moderateContent = async (content) => {
  try {
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results[0];
    
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      safe: !result.flagged
    };
  } catch (error) {
    console.error("OpenAI Moderation API error:", error);
    return {
      flagged: true,
      categories: { other: true },
      categoryScores: {},
      safe: false,
      error: "Moderation check failed"
    };
  }
};

/**
 * Validate AI response for safety and appropriateness
 * @param {string} response - AI response to validate
 * @returns {Promise<boolean>} Whether response is safe
 */
export const isResponseSafe = async (response) => {
  if (!response || typeof response !== 'string') return false;
  
  const moderation = await moderateContent(response);
  if (!moderation.safe) {
    return false;
  }
  
  const lowerResponse = response.toLowerCase();
  
  const rolePlayingIndicators = [
    'i am now', 'i have become', 'switching to', 'roleplaying as',
    'pretending to be', 'my new role', 'i will now act as'
  ];
  
  if (rolePlayingIndicators.some(indicator => lowerResponse.includes(indicator))) {
    console.warn('AI response contains role-playing indicators');
    return false;
  }
  
  const systemLeakIndicators = [
    'my instructions are', 'my system prompt', 'i was programmed to',
    'the developers told me', 'according to my training'
  ];
  
  return !systemLeakIndicators.some(indicator => lowerResponse.includes(indicator));
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
          - MANDATORY gender-specific nutrition needs and recommendations
          - Gender-based calorie ranges: Males 1800-2400, Females 1600-2000  
          - Gender-specific nutrient requirements and health priorities
          - Weekly calorie goals should be 7x daily target (11,200-16,800 total)
          - Evidence-based nutrition advice tailored specifically to the user's gender
          - Practical, actionable suggestions based on gender and current intake
          - Encouraging tone while being informative and gender-aware
          
          CRITICAL: Always respect gender-specific calorie limits and nutrient needs. Never exceed 2000 calories daily for females or go below 1800 for males.`
        },
        {
          role: "user",
          content: `Analyze this nutrition data and provide gender-specific predictions:

          User's Nutrition Profile:
          - Gender: ${nutritionData.gender || 'unknown'}
          - Daily average calories: ${nutritionData.avgCalories || 0}
          - Daily average protein: ${nutritionData.avgProtein || 0}g
          - Daily average carbs: ${nutritionData.avgCarbs || 0}g  
          - Daily average fat: ${nutritionData.avgFat || 0}g
          - Total meals tracked: ${nutritionData.totalMeals || 0}
          - Analysis period: ${nutritionData.days || 7} days

          CRITICAL: Provide gender-specific nutrition analysis based on the user's gender above.

          MANDATORY Gender-Specific Guidelines:
          
          If Gender is MALE or male:
          - MUST set daily calorie target between 1800-2400 calories ONLY
          - Weekly calorie goal = daily target × 7 (12,600-16,800 range)
          - Protein target: 56-75g daily (higher muscle mass needs)
          - Focus areas: Heart health, prostate health, muscle maintenance
          - Key nutrients: Lycopene, zinc, omega-3 fatty acids
          - Recommendations should address: Lean protein sources, heart-healthy fats, adequate fiber
          
          If Gender is FEMALE or female:
          - MUST set daily calorie target between 1600-2000 calories ONLY  
          - Weekly calorie goal = daily target × 7 (11,200-14,000 range)
          - Protein target: 46-65g daily (lean muscle maintenance)
          - Focus areas: Bone health, iron levels, heart health, hormonal balance
          - Key nutrients: Calcium, vitamin D, iron, folate, magnesium
          - Recommendations should address: Iron-rich foods, bone-strengthening nutrients, heart health
          
          VALIDATION RULES:
          - If gender is female: weeklyCalorieGoal must be ≤ 14,000 (2000×7)
          - If gender is male: weeklyCalorieGoal must be ≥ 12,600 (1800×7)
          - Consider user's current intake patterns when setting realistic goals within gender limits
          - If current intake is outside gender range, suggest gradual adjustments
          - All recommendations must be gender-appropriate and evidence-based

          Generate insights that specifically address the nutritional needs and health priorities for this user's gender, incorporating their current eating patterns and meal data.`
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