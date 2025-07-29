import { 
  generateNutritionPredictionsNew as generateNutritionPredictions,
  generateAgenticNutritionPredictions 
} from "../openai/additionalOpenaiService.js";
import { GENDER, CALORIE_LIMITS, HEALTH_SCORES } from "../../utils/constants.js";

/**
 * Service for handling AI nutrition predictions using OpenAI Responses API with Structured Outputs
 * Now supports both basic and agentic modes
 */
export class AIPredictionService {
  /**
   * Generate AI predictions with agentic capabilities and fallback handling
   * @param {Object} nutritionData - User's nutrition data
   * @param {Object} user - User object with gender info
   * @param {boolean} useAgentic - Whether to use agentic mode (default: true)
   * @returns {Promise<Object>} AI predictions response
   */
  static async generatePredictions(nutritionData, user, useAgentic = true) {
    try {
      // Try agentic mode first if enabled
      if (useAgentic) {
        console.log('Attempting agentic nutrition analysis...');
        try {
          const agenticResponse = await generateAgenticNutritionPredictions(nutritionData);
          const validatedResponse = this.validateAndEnforceCalorieLimits(agenticResponse, user);
          
          // Add agentic success metadata
          return {
            ...validatedResponse,
            agenticSuccess: true,
            enhancedAnalysis: true
          };
        } catch (agenticError) {
          console.warn('Agentic mode failed, falling back to basic:', agenticError.message);
          // Continue to basic mode
        }
      }
      
      // Basic mode fallback
      const aiResponse = await generateNutritionPredictions(nutritionData);
      const validatedResponse = this.validateAndEnforceCalorieLimits(aiResponse, user);
      
      return {
        ...validatedResponse,
        agenticSuccess: false,
        fallbackUsed: useAgentic
      };
      
    } catch (error) {
      console.warn('All AI prediction methods failed, using manual fallback:', error.message);
      return this.generateFallbackPredictions(nutritionData, user);
    }
  }

  /**
   * Generate enhanced agentic predictions (direct access)
   * @param {Object} nutritionData - User's nutrition data
   * @param {Object} user - User object with gender info
   * @returns {Promise<Object>} Enhanced AI predictions response
   */
  static async generateAgenticPredictions(nutritionData, user) {
    try {
      const agenticResponse = await generateAgenticNutritionPredictions(nutritionData);
      return this.validateAndEnforceCalorieLimits(agenticResponse, user);
    } catch (error) {
      console.error('Agentic prediction failed:', error.message);
      // Fallback to basic
      return this.generatePredictions(nutritionData, user, false);
    }
  }

  /**
   * Validate and enforce gender-specific calorie limits
   */
  static validateAndEnforceCalorieLimits(aiResponse, user) {
    if (!aiResponse?.predictions?.weeklyCalorieGoal) {
      return aiResponse;
    }

    const gender = parseInt(user.gender);
    const weeklyGoal = aiResponse.predictions.weeklyCalorieGoal;
    const dailyGoal = Math.round(weeklyGoal / 7);

    // Enforce gender-specific limits
    if (gender === GENDER.FEMALE && dailyGoal > CALORIE_LIMITS.FEMALE.MAX) {
      aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.FEMALE.DEFAULT * 7;
    } else if (gender === GENDER.MALE && dailyGoal < CALORIE_LIMITS.MALE.MIN) {
      aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.MALE.DEFAULT * 7;
    } else if (gender === GENDER.FEMALE && dailyGoal < CALORIE_LIMITS.FEMALE.MIN) {
      aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.FEMALE.MIN * 7;
    } else if (gender === GENDER.MALE && dailyGoal > CALORIE_LIMITS.MALE.MAX) {
      aiResponse.predictions.weeklyCalorieGoal = CALORIE_LIMITS.MALE.MAX * 7;
    }

    return aiResponse;
  }

  /**
   * Generate fallback predictions when AI fails
   */
  static generateFallbackPredictions(analytics, user) {
    const gender = parseInt(user.gender);
    const genderString = this.getGenderString(gender);

    if (analytics.totalMeals > 0) {
      return this.generateFallbackWithData(analytics, user, gender, genderString);
    } else {
      return this.generateFallbackWithoutData(user, gender, genderString);
    }
  }

  /**
   * Generate fallback when user has meal data
   */
  static generateFallbackWithData(analytics, user, gender, genderString) {
    const { fallbackDailyCalories, genderSpecificAdvice } = this.getGenderSpecificDefaults(
      gender, 
      analytics.avgDailyCalories
    );

    return {
      predictions: {
        weeklyCalorieGoal: Math.round(fallbackDailyCalories * 7),
        proteinTarget: Math.round(analytics.avgProtein || (gender === GENDER.FEMALE ? 50 : 65)),
        improvementAreas: ["AI analysis temporarily unavailable", "Continue tracking meals"],
        trendAnalysis: `Based on your ${genderString} profile, your current average of ${Math.round(analytics.avgDailyCalories || 0)} calories per day. ${genderSpecificAdvice}`
      },
      recommendations: [
        {
          category: "Gender-Specific Nutrition",
          suggestion: this.getGenderSpecificSuggestion(gender),
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
  }

  /**
   * Generate fallback when user has no meal data
   */
  static generateFallbackWithoutData(user, gender, genderString) {
    const { defaultDailyCalories, genderWelcomeMessage, genderRecommendations } = 
      this.getNewUserDefaults(gender);

    return {
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

  /**
   * Helper methods
   */
  static getGenderString(gender) {
    return gender === GENDER.FEMALE ? 'female' : 
           gender === GENDER.MALE ? 'male' : 'unknown';
  }

  static getGenderSpecificDefaults(gender, avgCalories) {
    if (gender === GENDER.FEMALE) {
      return {
        fallbackDailyCalories: Math.min(Math.max(avgCalories || CALORIE_LIMITS.FEMALE.DEFAULT, CALORIE_LIMITS.FEMALE.MIN), CALORIE_LIMITS.FEMALE.MAX),
        genderSpecificAdvice: "Focus on calcium-rich foods for bone health and iron-rich foods to maintain energy levels."
      };
    } else if (gender === GENDER.MALE) {
      return {
        fallbackDailyCalories: Math.min(Math.max(avgCalories || CALORIE_LIMITS.MALE.DEFAULT, CALORIE_LIMITS.MALE.MIN), CALORIE_LIMITS.MALE.MAX),
        genderSpecificAdvice: "Focus on lean proteins for muscle maintenance and heart-healthy fats for cardiovascular health."
      };
    } else {
      return {
        fallbackDailyCalories: avgCalories || 1900,
        genderSpecificAdvice: "Maintain a balanced diet with adequate protein and nutrients."
      };
    }
  }

  static getGenderSpecificSuggestion(gender) {
    if (gender === GENDER.FEMALE) {
      return "Focus on calcium and iron-rich foods for bone and energy health";
    } else if (gender === GENDER.MALE) {
      return "Prioritize lean proteins and heart-healthy fats for muscle and cardiovascular health";
    } else {
      return "Maintain a balanced diet with adequate nutrients";
    }
  }

  static getNewUserDefaults(gender) {
    if (gender === GENDER.FEMALE) {
      return {
        defaultDailyCalories: CALORIE_LIMITS.FEMALE.DEFAULT,
        genderWelcomeMessage: "As a female user, focus on calcium for bone health and iron for energy.",
        genderRecommendations: [
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
        ]
      };
    } else if (gender === GENDER.MALE) {
      return {
        defaultDailyCalories: CALORIE_LIMITS.MALE.DEFAULT,
        genderWelcomeMessage: "As a male user, focus on lean proteins for muscle maintenance and heart-healthy fats.",
        genderRecommendations: [
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
        ]
      };
    } else {
      return {
        defaultDailyCalories: 1900,
        genderWelcomeMessage: "Focus on balanced nutrition with adequate protein and nutrients.",
        genderRecommendations: [
          {
            category: "Balanced Nutrition",
            suggestion: "Aim for a variety of foods from all food groups.",
            priority: "medium",
            reasoning: "A balanced approach ensures you get all essential nutrients."
          }
        ]
      };
    }
  }
}
