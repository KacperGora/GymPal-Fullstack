import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
