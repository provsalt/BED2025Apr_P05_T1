import OpenAI from 'openai';
import dotenv from 'dotenv';
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
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide detailed nutritional information. Please respond with a JSON object containing:
              {
                "foodName": "Name of the food item",
                "category": "Category of the food (e.g., fruit, vegetable, grain, etc.)",
                "carbohydrates": "Carbohydrate content in grams",
                "protein": "Protein content in grams",
                "fat": "Fat content in grams",
                "calories": "Estimated calories",
                "ingredients": "ingredients used in the food item"
              }
              
              Be as accurate as possible with the nutritional estimates. Even if you cannot identify exact details, you can estimate it.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
    }

    // Fallback: return the raw response if JSON parsing fails
    return {
      analysis: content,
      error: "Could not parse structured response"
    };

  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze food image");
  }
}; 