import { z } from "zod";

// Password must have: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(
    passwordRegex,
    "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character (@$!%*?&)",
  );

export const registerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterDto = z.infer<typeof registerSchema>;
export type RegisterFormDto = z.infer<typeof registerFormSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
