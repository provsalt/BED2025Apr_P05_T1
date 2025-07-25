import { z } from 'zod/v4';

export const CommunityInformation = z.object({
  name: z.string().min(1, 'Event name is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.enum(['sports', 'arts', 'culinary', 'learn'], { required_error: 'Category is required' }),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  description: z.string().min(1, 'Description is required'),
}).refine((data) => {
  const eventDateTime = new Date(`${data.date}T${data.time}:00`);
  if (eventDateTime < new Date()) {
    return false;
  }
  return true;
}, {
  message: "Date/time cannot be in the past",
  path: ["date"]
}); 
