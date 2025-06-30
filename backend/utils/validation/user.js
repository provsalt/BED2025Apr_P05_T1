import { z } from 'zod/v4';

export const User = z.object({
    name: z.string().max(255),
    email: z.email().max(255),
    password: z.string().min(12).max(255).regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter").regex(/(?=.*[!@#$%^&*()])/, "Password must contain at least one special character"),
    date_of_birth: z.int().min(0).max((Date.now() + 60 * 1000) / 1000),
    gender: z.literal([0, 1]).optional(),
})