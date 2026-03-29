import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TrainerClientService } from './trainer-client.service';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Role } from '../../generated/prisma/enums';

@Controller('trainer-client')
@UseGuards(JwtAuthGuard)
export class TrainerClientController {
  constructor(private readonly trainerClientService: TrainerClientService) {}

  @Post('invite')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER)
  createInvite(@Req() req: { user: { id: number } }) {
    return this.trainerClientService.createInviteLink(req.user.id);
  }

  @Post('accept')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  acceptInvite(
    @Req() req: { user: { id: number } },
    @Body('token') token: string,
  ) {
    return this.trainerClientService.acceptInvite(req.user.id, token);
  }

  @Delete(':clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER)
  delete(
    @Req() req: { user: { id: number } },
    @Param('clientId') clientId: string,
  ) {
    return this.trainerClientService.revokeClient(
      req.user.id,
      parseInt(clientId, 10),
    );
  }

  @Get('clients')
  @UseGuards(RolesGuard)
  @Roles(Role.TRAINER)
  getClients(@Req() req: { user: { id: number } }) {
    return this.trainerClientService.getClients(req.user.id);
  }

  @Get('trainer')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  getTrainer(@Req() req: { user: { id: number } }) {
    return this.trainerClientService.getTrainer(req.user.id);
  }
}
