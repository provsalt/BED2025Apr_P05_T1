import { z } from 'zod/v4';

export const CommunityEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.enum(['sports', 'arts', 'culinary', 'learn'], { required_error: 'Category is required' }),
  date: z.string().min(1, 'Date is required').refine(
    (val) => {
      const today = new Date();
      const inputDate = new Date(val);
      today.setHours(0,0,0,0);
      inputDate.setHours(0,0,0,0);
      return inputDate >= today;
    },
    { message: "Date cannot be in the past" }
  ),
  time: z.string().min(1, 'Time is required'),
  description: z.string().min(1, 'Description is required'),

}); 