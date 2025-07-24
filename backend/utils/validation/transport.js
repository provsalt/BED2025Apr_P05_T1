import {z} from 'zod'

export const routeSchema = z.object({
  name: z.string().min(1, "name is required").max(255),
  start_station: z.string().min(1, "start_station is required").max(255),
  end_station: z.string().min(1, "end_station is required").max(255),
})

export const shortestPathQuerySchema = z.object({
  start: z.string().min(1, "start station is required"),
  end: z.string().min(1, "end station is required"),
}).refine(data => data.start !== data.end, {
  message: "Start and end stations cannot be the same",
  path: ["end"]
})

export const routeParamsSchema = z.object({
  id: z.string().transform((val) => {
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      throw new Error("Route ID must be a positive integer");
    }
    return num;
  })
})
