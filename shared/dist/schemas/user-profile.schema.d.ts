import { z } from "zod";
export declare const CreateUserProfileSchema: z.ZodObject<{
    height: z.ZodNumber;
    weight: z.ZodNumber;
    age: z.ZodNumber;
    activity: z.ZodNumber;
    goal: z.ZodEnum<{
        gain: "gain";
        lose: "lose";
        maintain: "maintain";
    }>;
}, z.core.$strip>;
export type CreateUserProfileDto = z.infer<typeof CreateUserProfileSchema>;
export declare const UpdateUserProfileSchema: z.ZodObject<{
    height: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    age: z.ZodOptional<z.ZodNumber>;
    activity: z.ZodOptional<z.ZodNumber>;
    goal: z.ZodOptional<z.ZodEnum<{
        gain: "gain";
        lose: "lose";
        maintain: "maintain";
    }>>;
}, z.core.$strip>;
export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileSchema>;
