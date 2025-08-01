import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced agentic nutrition analysis using Responses API with built-in tools
 * @param {Object} nutritionData - User's nutrition data
 * @returns {Promise<Object>} Enhanced AI predictions with real-time data
 */
export const generateAgenticNutritionAnalysis = async (nutritionData) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      
      input: [
        {
          role: "system",
          content: `You are an advanced nutrition AI assistant with access to web search and code interpreter tools. 
          
          Use these tools to:
          1. Search for latest nutritional guidelines and research
          2. Perform complex nutritional calculations
          3. Cross-reference with current dietary recommendations
          4. Validate calculations with code interpreter
          
          Provide evidence-based, up-to-date nutrition advice.`
        },
        {
          role: "user", 
          content: `Analyze this nutrition data and provide comprehensive recommendations:
          
          User Profile:
          - Gender: ${nutritionData.gender}
          - Average daily calories: ${nutritionData.avgCalories}
          - Average protein: ${nutritionData.avgProtein}g
          - Meals tracked: ${nutritionData.totalMeals}
          
          Please:
          1. Search for current dietary guidelines for this demographic
          2. Calculate precise nutritional needs using code interpreter
          3. Compare with latest research on optimal nutrition for elderly users
          4. Provide personalized recommendations based on current best practices`
        }
      ],
      
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
          name: "agentic_nutrition_analysis",
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
                    items: { type: "string" } 
                  },
                  trendAnalysis: { type: "string" },
                  calculationDetails: { type: "string" }, // From code interpreter
                  researchBasis: { type: "string" }       // From web search
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
                    evidenceSource: { type: "string" }, // Web search citations
                    scientificBasis: { type: "string" }
                  },
                  required: ["category", "suggestion", "priority", "reasoning"],
                  additionalProperties: false
                }
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
                  latestResearch: { type: "string" },    // From web search
                  calculatedMetrics: { type: "object" }  // From code interpreter
                },
                required: ["healthScore", "balanceAssessment"],
                additionalProperties: false
              },
              toolUsage: {
                type: "object",
                properties: {
                  webSearchPerformed: { type: "boolean" },
                  calculationsPerformed: { type: "boolean" },
                  sourcesConsulted: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                },
                required: ["webSearchPerformed", "calculationsPerformed"],
                additionalProperties: false
              }
            },
            required: ["predictions", "recommendations", "insights", "toolUsage"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    // Handle different response scenarios
    if (response.status === "incomplete") {
      throw new Error(`Incomplete response: ${response.incomplete_details.reason}`);
    }

    if (response.output[0].content[0].type === "refusal") {
      throw new Error('AI refused to provide analysis');
    }

    // Parse structured output
    const analysisData = JSON.parse(response.output_text);
    
    return {
      success: true,
      data: analysisData,
      isAgentic: true,
      toolsUsed: analysisData.toolUsage || {}
    };

  } catch (error) {
    console.error("Agentic nutrition analysis error:", error);
    throw new Error("Failed to generate agentic nutrition analysis: " + error.message);
  }
};

/**
 * Agentic meal analysis with real-time food database lookup
 * @param {Buffer} imageBuffer - Food image
 * @returns {Promise<Object>} Enhanced food analysis
 */
export const analyzeFoodAgenticallyWithSearch = async (imageBuffer) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-2024-08-06",
      
      input: [
        {
          role: "system",
          content: `You are an advanced food analysis AI with access to web search and code interpreter.
          
          Use tools to:
          1. Search for accurate nutritional data from food databases
          2. Cross-reference with USDA nutritional information
          3. Perform precise nutritional calculations
          4. Validate portion size estimates`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image and provide comprehensive nutritional information. Use web search to find accurate nutritional data and code interpreter for calculations."
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
            }
          ]
        }
      ],
      
      tools: [
        { type: "web_search" },
        { type: "code_interpreter" }
      ],
      
      text: {
        format: {
          type: "json_schema", 
          name: "agentic_food_analysis",
          schema: {
            // Enhanced schema with tool outputs
            type: "object",
            properties: {
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
                    dataSource: { type: "string" },      // From web search
                    calculationMethod: { type: "string" } // From code interpreter
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
                  researchBased: { type: "boolean" },
                  sourcesUsed: { 
                    type: "array", 
                    items: { type: "string" } 
                  }
                },
                required: ["mealType", "healthRating"],
                additionalProperties: false
              }
            },
            required: ["foodItems", "totalNutrition", "analysis"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    return JSON.parse(response.output_text);

  } catch (error) {
    console.error("Agentic food analysis error:", error);
    throw new Error("Failed to perform agentic food analysis");
  }
};
