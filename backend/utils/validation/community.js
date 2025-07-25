import { z } from 'zod/v4';

export const CommunityInformation = z.object({
  name: z.string().min(1, 'Event name is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.enum(['sports', 'arts', 'culinary', 'learn'], { required_error: 'Category is required' }),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  description: z.string().min(1, 'Description is required'),
}).refine((data) => {
  // Date cannot be in the past
  const today = new Date();
  const inputDate = new Date(data.date);
  today.setHours(0,0,0,0);
  inputDate.setHours(0,0,0,0);
  if (inputDate < today) {
    return false;
  }
  // If date is today, time cannot be in the past 
  if (inputDate.getTime() === today.getTime()) {
    const now = new Date();
    const [inputHour, inputMinute] = data.time.split(":");
    const eventTime = new Date();
    eventTime.setHours(Number(inputHour), Number(inputMinute), 0, 0);
    if (eventTime < now) {
      return false;
    }
  }
  return true;
}, {
  message: "Date/time cannot be in the past",
  path: ["date"]
}); 
