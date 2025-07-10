import OpenAI from 'openai';
import dotenv from 'dotenv';
import {z} from "zod/v4";
import {nutritionInformation} from "../../utils/validation/nutrition.js";

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
    const res = nutritionInformation.extend({
      error: z.string().describe("Error message if no food is detected")
    });

    console.log(z.toJSONSchema(res, {target: 'draft-7'}))
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