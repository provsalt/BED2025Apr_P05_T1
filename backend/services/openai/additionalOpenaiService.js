import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from "zod";
import { analyzeFoodImage } from './openaiService.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NutritionPredictionsSchema = z.object({
  predictions: z.object({
    weeklyCalorieGoal: z.number(),
    proteinTarget: z.number(),
    improvementAreas: z.array(z.string()),
    trendAnalysis: z.string()
  }),
  recommendations: z.array(z.object({
    category: z.string(),
    suggestion: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    reasoning: z.string()
  })),
  insights: z.object({
    healthScore: z.number().min(0).max(100),
    balanceAssessment: z.string()
  })
});

/**
 * Enhanced agentic food image analysis using built-in tools
 * @param {Buffer} imageBuffer - The processed image buffer
 * @returns {Promise<Object>} Enhanced analysis results with real-time data
 */
export const analyzeFoodImageAgentic = async (imageBuffer) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content: `You are an advanced food analysis AI with access to web search and code interpreter tools.
          
          Use tools to:
          1. Search for accurate nutritional data from current food databases (USDA, nutrition labels)
          2. Cross-reference with latest nutritional information for food items
          3. Perform precise nutritional calculations using code interpreter
          4. Validate portion size estimates and nutritional accuracy`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image and provide comprehensive nutritional information. Use web search to find accurate, up-to-date nutritional data and code interpreter for precise calculations. If no food is detected, provide an appropriate error message."
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
            }
          ]
        }
      ],
      
      // AGENTIC TOOLS
      tools: [
        { 
          type: "web_search",
          web_search: {
            max_results: 3
          }
        },
        { 
          type: "code_interpreter" 
        }
      ],
      
      text: {
        format: {
          type: "json_schema",
          name: "agentic_food_analysis",
          schema: {
            type: "object",
            properties: {
              foodDetected: { type: "boolean" },
              error: { 
                type: "string",
                description: "Error message if no food is detected"
              },
              foodItems: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    calories: { type: "number" },
                    protein: { type: "number" },
                    carbs: { type: "number" },
                    fat: { type: "number" },
                    portionSize: { type: "string" },
                    confidence: { type: "number" },
                    dataSource: { type: "string" },
                    calculationMethod: { type: "string" }
                  },
                  required: ["name", "calories", "protein", "carbs", "fat"],
                  additionalProperties: false
                }
              },
              totalNutrition: {
                type: "object",
                properties: {
                  totalCalories: { type: "number" },
                  totalProtein: { type: "number" },
                  totalCarbs: { type: "number" },
                  totalFat: { type: "number" },
                  calculationDetails: { type: "string" }
                },
                required: ["totalCalories", "totalProtein", "totalCarbs", "totalFat"],
                additionalProperties: false
              },
              analysis: {
                type: "object",
                properties: {
                  mealType: { type: "string" },
                  healthRating: { type: "number" },
                  nutritionalBalance: { type: "string" },
                  researchBased: { type: "boolean" },
                  sourcesUsed: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                },
                required: ["mealType", "healthRating"],
                additionalProperties: false
              },
              agenticDetails: {
                type: "object",
                properties: {
                  webSearchUsed: { type: "boolean" },
                  calculationsPerformed: { type: "boolean" },
                  dataAccuracy: { 
                    type: "string", 
                    enum: ["high", "medium", "low"] 
                  },
                  toolsUsed: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                },
                required: ["webSearchUsed", "calculationsPerformed"],
                additionalProperties: false
              }
            },
            required: ["foodDetected"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    // Handle response
    if (response.status === "incomplete") {
      console.log('Agentic food analysis incomplete, falling back to basic...');
      return analyzeFoodImage(imageBuffer);
    }

    if (response.output[0].content[0].type === "refusal") {
      console.log('Agentic food analysis refused, falling back to basic...');
      return analyzeFoodImage(imageBuffer);
    }

    const analysisData = JSON.parse(response.output_text);
    
    return {
      ...analysisData,
      metadata: {
        agenticMode: true,
        model: "gpt-4o-2024-08-06",
        timestamp: new Date().toISOString(),
        enhanced: true
      }
    };

  } catch (error) {
    console.error("Agentic food analysis error:", error);
    console.log('Falling back to basic food analysis...');
    
    // Graceful fallback
    try {
      const fallbackResult = await analyzeFoodImage(imageBuffer);
      return {
        ...fallbackResult,
        metadata: {
          agenticMode: false,
          fallbackUsed: true,
          fallbackReason: error.message
        }
      };
    } catch (fallbackError) {
      throw new Error("Both agentic and basic food analysis failed");
    }
  }
};

/**
 * Enhanced agentic nutrition analysis using built-in tools
 * @param {Object} nutritionData - User's nutrition data and trends
 * @returns {Promise<Object>} Enhanced AI predictions with real-time research
 */
export const generateAgenticNutritionPredictions = async (nutritionData) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content: `You are an advanced nutrition expert AI assistant with access to web search and code interpreter tools. 
          
          Use these tools strategically:
          1. Use web search to find the latest 2025 nutritional guidelines and research for elderly users
          2. Use code interpreter to perform precise nutritional calculations (BMR, TDEE, macronutrient ratios)
          3. Validate recommendations against current scientific evidence
          4. Provide evidence-based, up-to-date nutrition advice with citations
          
          Focus on gender-specific nutrition needs and provide comprehensive analysis.`
        },
        {
          role: "user",
          content: `Please analyze this nutrition data using your tools for comprehensive recommendations:

          User's Nutrition Profile:
          - Gender: ${nutritionData.gender || 'unknown'}
          - Daily average calories: ${nutritionData.avgCalories || 0}
          - Daily average protein: ${nutritionData.avgProtein || 0}g
          - Daily average carbs: ${nutritionData.avgCarbs || 0}g  
          - Daily average fat: ${nutritionData.avgFat || 0}g
          - Total meals tracked: ${nutritionData.totalMeals || 0}
          - Analysis period: ${nutritionData.days || 7} days

          Please:
          1. Search for current 2025 dietary guidelines for elderly ${nutritionData.gender} users
          2. Use code interpreter to calculate precise nutritional needs based on this data
          3. Cross-reference with latest research on optimal nutrition for this demographic
          4. Provide personalized recommendations with scientific backing
          
          Ensure gender-specific guidelines:
          - Males: 1800-2400 calories daily (12,600-16,800 weekly)
          - Females: 1600-2000 calories daily (11,200-14,000 weekly)`
        }
      ],
      
      // AGENTIC TOOLS
      tools: [
        { 
          type: "web_search",
          web_search: {
            max_results: 5
          }
        },
        { 
          type: "code_interpreter" 
        }
      ],
      
      text: {
        format: {
          type: "json_schema",
          name: "agentic_nutrition_predictions",
          schema: {
            type: "object",
            properties: {
              predictions: {
                type: "object",
                properties: {
                  weeklyCalorieGoal: { type: "number" },
                  proteinTarget: { type: "number" },
                  improvementAreas: { 
                    type: "array", 
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 5
                  },
                  trendAnalysis: { type: "string" },
                  calculationDetails: { type: "string" },
                  researchBasis: { type: "string" },
                  evidenceSources: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                },
                required: ["weeklyCalorieGoal", "proteinTarget", "improvementAreas", "trendAnalysis"],
                additionalProperties: false
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    suggestion: { type: "string" },
                    priority: { 
                      type: "string", 
                      enum: ["high", "medium", "low"] 
                    },
                    reasoning: { type: "string" },
                    evidenceSource: { type: "string" },
                    scientificBasis: { type: "string" }
                  },
                  required: ["category", "suggestion", "priority", "reasoning"],
                  additionalProperties: false
                },
                minItems: 1,
                maxItems: 10
              },
              insights: {
                type: "object",
                properties: {
                  healthScore: { 
                    type: "number", 
                    minimum: 0, 
                    maximum: 100 
                  },
                  balanceAssessment: { type: "string" },
                  latestResearch: { type: "string" },
                  calculatedMetrics: { 
                    type: "object",
                    properties: {
                      bmr: { type: "number" },
                      tdee: { type: "number" },
                      proteinPerKg: { type: "number" }
                    },
                    additionalProperties: false
                  }
                },
                required: ["healthScore", "balanceAssessment"],
                additionalProperties: false
              },
              agenticAnalysis: {
                type: "object",
                properties: {
                  toolsUsed: { 
                    type: "array", 
                    items: { type: "string" } 
                  },
                  webSearchPerformed: { type: "boolean" },
                  calculationsPerformed: { type: "boolean" },
                  researchQuality: { 
                    type: "string", 
                    enum: ["high", "medium", "low"] 
                  },
                  sourcesConsulted: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                },
                required: ["toolsUsed", "webSearchPerformed", "calculationsPerformed"],
                additionalProperties: false
              }
            },
            required: ["predictions", "recommendations", "insights", "agenticAnalysis"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    // Handle response status
    if (response.status === "incomplete") {
      console.error('Incomplete agentic response:', response.incomplete_details);
      // Fallback to basic version
      console.log('Falling back to basic nutrition predictions...');
      return generateNutritionPredictionsNew(nutritionData);
    }

    if (response.output[0].content[0].type === "refusal") {
      console.error('Agentic AI refused to respond:', response.output[0].content[0].refusal);
      // Fallback to basic version
      console.log('Falling back to basic nutrition predictions...');
      return generateNutritionPredictionsNew(nutritionData);
    }

    const analysisData = JSON.parse(response.output_text);
    
    // Add metadata
    return {
      ...analysisData,
      metadata: {
        agenticMode: true,
        model: "gpt-4o-2024-08-06",
        timestamp: new Date().toISOString(),
        toolsUsed: analysisData.agenticAnalysis?.toolsUsed || [],
        fallbackAvailable: true
      }
    };

  } catch (error) {
    console.error("Agentic nutrition analysis error:", error);
    console.log('Falling back to basic nutrition predictions...');
    
    // Graceful fallback to basic version
    try {
      const fallbackResult = await generateNutritionPredictionsNew(nutritionData);
      return {
        ...fallbackResult,
        metadata: {
          agenticMode: false,
          fallbackUsed: true,
          fallbackReason: error.message,
          timestamp: new Date().toISOString()
        }
      };
    } catch (fallbackError) {
      throw new Error("Both agentic and basic nutrition predictions failed: " + fallbackError.message);
    }
  }
};

/**
 * Generate AI nutrition predictions and recommendations based on user's meal history
 * @param {Object} nutritionData - User's nutrition data and trends
 * @returns {Promise<Object>} AI predictions and recommendations
 */
export const generateNutritionPredictionsNew = async (nutritionData) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      input: [
        {
          role: "system",
          content: `You are a nutrition expert AI assistant. Analyze nutrition data and provide personalized predictions and recommendations for elderly users. Focus on gender-specific nutrition needs and provide evidence-based advice.`
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

          MANDATORY Gender-Specific Guidelines:
          
          If Gender is MALE or male:
          - MUST set daily calorie target between 1800-2400 calories ONLY
          - Weekly calorie goal = daily target × 7 (12,600-16,800 range)
          - Protein target: 56-75g daily (higher muscle mass needs)
          - Focus areas: Heart health, prostate health, muscle maintenance
          
          If Gender is FEMALE or female:
          - MUST set daily calorie target between 1600-2000 calories ONLY  
          - Weekly calorie goal = daily target × 7 (11,200-14,000 range)
          - Protein target: 46-65g daily (lean muscle maintenance)
          - Focus areas: Bone health, iron levels, heart health, hormonal balance

          Generate insights that specifically address the nutritional needs and health priorities for this user's gender.`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "nutrition_predictions",
          schema: {
            type: "object",
            properties: {
              predictions: {
                type: "object",
                properties: {
                  weeklyCalorieGoal: { type: "number" },
                  proteinTarget: { type: "number" },
                  improvementAreas: { 
                    type: "array", 
                    items: { type: "string" },
                    minItems: 1,
                    maxItems: 5
                  },
                  trendAnalysis: { type: "string" }
                },
                required: ["weeklyCalorieGoal", "proteinTarget", "improvementAreas", "trendAnalysis"],
                additionalProperties: false
              },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    suggestion: { type: "string" },
                    priority: { 
                      type: "string", 
                      enum: ["high", "medium", "low"] 
                    },
                    reasoning: { type: "string" }
                  },
                  required: ["category", "suggestion", "priority", "reasoning"],
                  additionalProperties: false
                },
                minItems: 1,
                maxItems: 10
              },
              insights: {
                type: "object",
                properties: {
                  healthScore: { 
                    type: "number", 
                    minimum: 0, 
                    maximum: 100 
                  },
                  balanceAssessment: { type: "string" }
                },
                required: ["healthScore", "balanceAssessment"],
                additionalProperties: false
              }
            },
            required: ["predictions", "recommendations", "insights"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    if (response.status === "incomplete") {
      console.error('Incomplete AI response:', response.incomplete_details);
      throw new Error(`Incomplete response: ${response.incomplete_details.reason}`);
    }

    if (response.output[0].content[0].type === "refusal") {
      console.error('AI refused to respond:', response.output[0].content[0].refusal);
      throw new Error('AI refused to provide analysis');
    }

    const analysisData = JSON.parse(response.output_text);
    
    const validatedResponse = NutritionPredictionsSchema.parse(analysisData);
    
    return validatedResponse;

  } catch (error) {
    console.error("Dashboard AI API error:", error);
    throw new Error("Failed to generate nutrition predictions: " + error.message);
  }
};
