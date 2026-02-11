import { z } from "zod";
export const registerSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    password: z.string().min(8),
});
export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});
export const registerFormSchema = registerSchema
    .extend({
    confirmPassword: z.string().min(8),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
