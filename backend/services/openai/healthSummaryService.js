import OpenAI from 'openai';
import dotenv from 'dotenv';
import { isResponseSafe } from './openaiService.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a comprehensive health summary based on questionnaire data
 * @param {Object} questionnaireData - The user's questionnaire responses
 * @returns {Promise<Object>} Generated health summary with safety validation
 */
export const generateHealthSummary = async (questionnaireData) => {
  try {
    const {
      difficulty_walking,
      assistive_device,
      symptoms_or_pain,
      allergies,
      medical_conditions,
      exercise_frequency
    } = questionnaireData;

    // Create a comprehensive prompt for health summary generation
    const prompt = `As a healthcare professional, analyze the following wellness questionnaire responses and provide a comprehensive, personalized health summary. 

Please provide:
1. A brief overview of the individual's current health status
2. Key health considerations based on their responses
3. General wellness recommendations (non-medical advice only)
4. Areas that may benefit from professional medical attention
5. Positive health practices they're already engaging in

Questionnaire Responses:
- Difficulty Walking: ${difficulty_walking}
- Assistive Device: ${assistive_device}
- Symptoms or Pain: ${symptoms_or_pain}
- Allergies: ${allergies}
- Medical Conditions: ${medical_conditions}
- Exercise Frequency: ${exercise_frequency}

Important Guidelines:
- Provide general wellness information only
- Do not make specific medical diagnoses
- Encourage professional medical consultation when appropriate
- Be supportive and encouraging
- Focus on actionable, positive health recommendations
- Keep the tone professional but accessible

Please format the response as a well-structured health summary with clear sections.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a healthcare professional providing general wellness summaries. Always encourage professional medical consultation for specific health concerns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("No response generated from OpenAI");
    }

    // Validate the response for safety
    const isSafe = await isResponseSafe(summary);
    if (!isSafe) {
      throw new Error("Generated content failed safety validation");
    }

    return {
      success: true,
      summary: summary,
      generated_at: new Date().toISOString()
    };

  } catch (error) {
    console.error("Health summary generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate health summary"
    };
  }
};

/**
 * Validate health summary content for medical appropriateness
 * @param {string} summary - The generated health summary
 * @returns {Promise<boolean>} Whether the summary is appropriate
 */
export const validateHealthSummary = async (summary) => {
  try {
    const lowerSummary = summary.toLowerCase();
    
    // Check for inappropriate medical claims
    const medicalRedFlags = [
      'i can diagnose',
      'i can treat',
      'i can cure',
      'definite diagnosis',
      'you have',
      'you are suffering from',
      'you need medication',
      'prescribe',
    ];
    
    if (medicalRedFlags.some(flag => lowerSummary.includes(flag))) {
      console.warn('Health summary contains inappropriate medical claims');
      return false;
    }
    
    // Check for encouraging professional consultation
    const professionalConsultation = [
      'consult your doctor',
      'speak with a healthcare provider',
      'medical professional',
      'healthcare provider',
      'physician'
    ];
    
    if (!professionalConsultation.some(term => lowerSummary.includes(term))) {
      console.warn('Health summary does not encourage professional consultation');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Health summary validation error:", error);
    return false;
  }
}; 