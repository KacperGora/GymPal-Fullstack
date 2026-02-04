import { Controller, Body, Put, Get, UseGuards, Res } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileSchema } from '@gympal/shared';
import type { CreateUserProfileDto } from '@gympal/shared';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { HAS_PROFILE_COOKIE, HAS_PROFILE_TRUE } from '@gympal/shared';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  async getProfile(@RequestUser('id') userId: number) {
    return this.userProfileService.getProfile(userId);
  }

  @Put()
  async upsertProfile(
    @RequestUser('id') userId: number,
    @Body(new ZodValidationPipe(CreateUserProfileSchema))
    dto: CreateUserProfileDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const profile = await this.userProfileService.upsertProfile(userId, dto);

    res.cookie(HAS_PROFILE_COOKIE, HAS_PROFILE_TRUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return profile;
  }
}
