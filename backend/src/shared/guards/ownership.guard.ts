import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Role, TrainerClientStatus } from '../../generated/prisma/enums';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, query } = context.switchToHttp().getRequest<{
      user: { id: number; role: Role };
      query: { clientId?: string };
    }>();

    if (user.role === Role.ADMIN || !query.clientId) {
      return true;
    }

    const clientId = parseInt(query.clientId, 10);
    if (Number.isNaN(clientId)) {
      throw new BadRequestException('Invalid clientId');
    }

    if (user.role === Role.TRAINER) {
      const relation = await this.prisma.trainerClient.findUnique({
        where: { trainerId_clientId: { trainerId: user.id, clientId } },
      });

      if (!relation || relation.status !== TrainerClientStatus.ACTIVE) {
        throw new ForbiddenException('You do not have access to this client');
      }

      return true;
    }

    if (user.id !== clientId) {
      throw new ForbiddenException('You can only access your onw data');
    }

    return true;
  }
}
