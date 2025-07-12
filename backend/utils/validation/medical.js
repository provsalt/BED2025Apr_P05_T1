import { z } from 'zod/v4';

export const medicationSchema = z.object({
  medicine_name: z.string().min(1, 'Medicine name is required'),
  reason: z.string().min(1, 'Reason is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  medicine_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  frequency_per_day: z.preprocess(
    (val) => typeof val === 'string' ? parseInt(val, 10) : val,
    z.number().int().min(1, 'Frequency must be at least 1')
  ),
}); 