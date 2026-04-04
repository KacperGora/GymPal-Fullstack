import { z } from 'zod';

export const agentQuerySchema = z.object({
  query: z.string().min(1).max(2000),
  language: z.enum(['en', 'pl']).optional().default('en'),
});

export type AgentQueryDto = z.infer<typeof agentQuerySchema>;

export interface AgentResponse {
  answer: string;
  toolsUsed: string[];
}
