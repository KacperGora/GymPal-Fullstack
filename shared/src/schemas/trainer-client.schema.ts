import { z } from "zod";

const userSummarySchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

export const trainerClientSchema = z.object({
  id: z.string(),
  trainerId: z.number(),
  clientId: z.number().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "REVOKED", "REJECTED"]),
  acceptedAt: z.string().nullable(),
  client: userSummarySchema.nullable(),
  trainer: userSummarySchema.nullable(),
});

export const inviteLinkSchema = z.object({
  token: z.string(),
  link: z.string(),
});

export type TrainerClient = z.infer<typeof trainerClientSchema>;
export type InviteLink = z.infer<typeof inviteLinkSchema>;
