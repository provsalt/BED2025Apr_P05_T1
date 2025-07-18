import {z} from "zod/v4";

export const nutritionSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  category: z.string().min(1, "Category is required"),
  carbohydrates: z.number().min(0, "Carbohydrates must be a non-negative number and a number"),
  protein: z.number().min(0, "Protein must be a non-negative number and a number"),
  fat: z.number().min(0, "Fat must be a non-negative number and a number"),
  calories: z.number().min(0, "Calories must be a non-negative number and a number"),
  ingredients: z.array(z.string().min(1), "Ingredient must be a non-empty string").min(1, "At least one ingredient is required"),
})