import { z } from "zod";
/**
 * Schema for water intake query parameters
 * Validates date format (YYYY-MM-DD)
 */
export declare const waterQuerySchema: z.ZodObject<
  {
    date: z.ZodString;
  },
  z.core.$strip
>;
export type WaterQueryDto = z.infer<typeof waterQuerySchema>;
