import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class TrainerClientService {
  constructor(private readonly prisma: PrismaService) {}

  async createInviteLink(
    trainerId: number,
  ): Promise<{ token: string; link: string }> {
    const token = crypto.randomUUID();
    await this.prisma.trainerClient.create({
      data: {
        trainerId,
        inviteToken: token,
        status: 'PENDING',
      },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return {
      token,
      link: `${frontendUrl}/invite?token=${token}`,
    };
  }
  async acceptInvite(clientId: number, token: string) {
    const relation = await this.prisma.trainerClient.findUnique({
      where: {
        inviteToken: token,
      },
    });
    if (!relation) {
      throw new NotFoundException('Invite token not found');
    }

    if (relation.status === 'ACTIVE') {
      throw new BadRequestException('Invite already accepted');
    }

    return this.prisma.trainerClient.update({
      where: {
        inviteToken: token,
      },
      data: {
        clientId,
        status: 'ACTIVE',
        acceptedAt: new Date(),
        inviteToken: null,
      },
    });
  }
  async revokeClient(trainerId: number, clientId: number) {
    const relation = await this.prisma.trainerClient.findUnique({
      where: { trainerId_clientId: { trainerId, clientId } },
    });

    if (!relation) {
      throw new NotFoundException('Relation not found');
    }

    return this.prisma.trainerClient.update({
      where: {
        trainerId_clientId: { trainerId, clientId },
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });
  }
  async getClients(trainerId: number) {
    return this.prisma.trainerClient.findMany({
      where: { trainerId, status: 'ACTIVE' },
      select: {
        id: true,
        clientId: true,
        status: true,
        acceptedAt: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
  async getTrainer(clientId: number) {
    const relation = await this.prisma.trainerClient.findFirst({
      where: { clientId, status: 'ACTIVE' },
      select: {
        trainer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return relation?.trainer ?? null;
  }
}
