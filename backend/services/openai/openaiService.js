import OpenAI from 'openai';
import dotenv from 'dotenv';
import {z} from "zod/v4";
import {nutritionSchema} from "../../utils/validation/nutrition.js";
import { trackOpenAIUsage } from "../prometheusService.js";
import {logInfo} from "../../utils/logger.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze food image using OpenAI GPT-4 Vision API
 * @param {Buffer} imageBuffer - The processed image buffer
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeFoodImage = async (imageBuffer, userId = null) => {
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

    if (response.usage) {
      trackOpenAIUsage(userId, "nutrition_analysis", "gpt-4.1-mini", response.usage, "vision");
    }

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
export const moderateContent = async (content, userId = null) => {
  try {
    const response = await openai.moderations.create({
      input: content,
    });

    if (response.usage) {
      trackOpenAIUsage(userId, "moderation", "text-moderation-latest", response.usage, "moderation");
    }

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