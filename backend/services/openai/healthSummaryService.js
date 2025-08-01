import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from "zod/v4";
import { healthSummarySchema } from '../../utils/validation/medical.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



/**
 * Generate a comprehensive health summary based on questionnaire data
 * @param {Object} questionnaireData - The user's questionnaire responses
 * @returns {Promise<Object>} Generated health summary
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

    const response = await openai.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are a healthcare professional providing general wellness summaries. Always encourage professional medical consultation for specific health concerns."
        },
        {
          role: "user",
          content: `As a healthcare professional, analyze the following wellness questionnaire responses and provide a comprehensive, personalized health summary. 

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

Please format the response as a well-structured health summary with clear sections.`
        }
      ],
      text: {
        format: {
          name: "health-summary",
          type: "json_schema",
          strict: true,
          schema: z.toJSONSchema(healthSummarySchema, {target: 'draft-7'}),
        },
      },
    });

    const summary = response.output_parsed;

    if (!summary) {
      throw new Error("No response generated from OpenAI");
    }

    // Validate the response for safety
    const summaryString = JSON.stringify(summary);
    const isSafe = await isResponseSafe(summaryString);
    if (!isSafe) {
      throw new Error("Generated content failed safety validation");
    }

    // Additional validation for health summary content
    const isValidHealthSummary = await validateHealthSummary(summaryString);
    if (!isValidHealthSummary) {
      throw new Error("Generated health summary failed content validation");
    }

    return summary;

  } catch (error) {
    throw new Error(`Failed to generate health summary: ${error.message}`);
  }
}; 

/**
 * Validate AI response for safety and appropriateness
 * @param {string} response - AI response to validate
 * @returns {Promise<boolean>} Whether response is safe
 */
export const isResponseSafe = async (response) => {
  if (!response || typeof response !== 'string') return false;
  
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