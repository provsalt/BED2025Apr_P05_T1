import { z } from 'zod/v4';

export const User = z.object({
    name: z.string().max(255),
    email: z.email().max(255),
    password: z.string().min(8).max(255),
    date_of_birth: z.int().min(0).max((Date.now() + 60 * 1000) / 1000),
    gender: z.literal([0, 1]).optional(),
})