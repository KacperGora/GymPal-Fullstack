import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt/jwt-auth.guard';
import { SubscriptionGuard } from '../../../shared/guards/subscription.guard';
import {
  UsageLimitGuard,
  UsageFeature,
} from '../../../shared/guards/usage-limit.guard';
import { RequestUser } from '../../../shared/decorators/request-user.decorator';
import { ZodValidationPipe } from '../../../shared/pipes/zod-validation.pipe';
import { AgentService } from './agent.service';
import {
  agentQuerySchema,
  type AgentQueryDto,
  type AgentResponse,
} from './dto/agent-query.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('agent')
  @UseGuards(SubscriptionGuard, UsageLimitGuard)
  @UsageFeature('AI_AGENT')
  @ApiOperation({
    summary: 'GymPal AI Agent',
    description:
      'Agentic AI that autonomously selects tools (get_training_history, update_plan, search_exercises, log_meal) based on the user query.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agent response with tool usage info.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated.',
  })
  async query(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(agentQuerySchema)) dto: AgentQueryDto,
  ): Promise<AgentResponse> {
    return this.agentService.runAgent(userId, dto.query, dto.language);
  }
}
