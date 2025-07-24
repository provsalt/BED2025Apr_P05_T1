import { z } from 'zod/v4';

//limit number of reminders and frequency
export const MAX_REMINDERS_PER_USER = 3;
export const MAX_FREQUENCY_PER_REMINDER = 3;

export const medicationSchema = z.object({
  medicine_name: z.string().min(1, 'Medicine name is required'),
  reason: z.string().min(1, 'Reason is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  medicine_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  frequency_per_day: z.preprocess(
    (val) => typeof val === 'string' ? parseInt(val, 10) : val,
    z.number().int().min(1, 'Frequency must be at least 1').max(MAX_FREQUENCY_PER_REMINDER, `Frequency per day cannot exceed ${MAX_FREQUENCY_PER_REMINDER}`)
  ),
});

export const medicationQuestionnaireSchema = z.object({
  difficulty_walking: z.enum(['Yes', 'No'], { required_error: 'Difficulty walking is required' }),
  assistive_device: z.string().min(1, 'Assistive device is required'),
  symptoms_or_pain: z.string().min(1, 'Symptoms or pain is required'),
  allergies: z.string().min(1, 'Allergies is required'),
  medical_conditions: z.string().min(1, 'Medical conditions is required'),
  exercise_frequency: z.string().min(1, 'Exercise frequency is required'),
}); 