import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { CreateUserProfileDto, UpdateUserProfileDto } from '@gympal/shared';
import { UserProfile } from '../../generated/prisma/client';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number): Promise<UserProfile> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('User profile not found');
    return profile;
  }

  async upsertProfile(
    userId: number,
    dto: CreateUserProfileDto | UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const exists = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!exists) {
      return this.prisma.userProfile.create({
        data: { userId, ...(dto as CreateUserProfileDto) },
      });
    }

    return this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });
  }
}
