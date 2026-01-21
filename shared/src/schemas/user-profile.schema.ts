import { z } from "zod";

export const CreateUserProfileSchema = z.object({
  height: z.number().positive(),
  weight: z.number().positive(),
  age: z.number().int().positive(),
  activity: z.number().min(1.2).max(2.5),
  goal: z.enum(['lose', 'maintain', 'gain']),
});

export type CreateUserProfileDto = z.infer<typeof CreateUserProfileSchema>;


export const UpdateUserProfileSchema =
  CreateUserProfileSchema.partial();

export type UpdateUserProfileDto = z.infer<
  typeof UpdateUserProfileSchema
>;
