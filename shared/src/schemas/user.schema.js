import { z } from 'zod';
export const createUserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    password: z.string().min(8),
});
