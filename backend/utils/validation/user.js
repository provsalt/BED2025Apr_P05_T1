import { z } from 'zod/v4';

export const Password = z.string()
  .min(12, "Password must be at least 12 characters long")
  .max(255, "Password must be less than 255 characters")
  .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
  .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
  .regex(/(?=.*\d)/, "Password must contain at least one number")
  .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, "Password must contain at least one special character");

export const User = z.object({
    name: z.string().max(255),
    email: z.email().max(255),
    password: Password,
    date_of_birth: z.int().min(0).max((Date.now() + 60 * 1000) / 1000),
    gender: z.literal(["0", "1"]).optional(),
})
