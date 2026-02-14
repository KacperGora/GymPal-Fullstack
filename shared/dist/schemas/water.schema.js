import { z } from "zod";
/**
 * Schema for water intake query parameters
 * Validates date format (YYYY-MM-DD)
 */
export const waterQuerySchema = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
});
