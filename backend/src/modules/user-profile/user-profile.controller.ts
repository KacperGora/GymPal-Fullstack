import {
  Controller,
  Param,
  Body,
  Put,
  Get,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto, UpdateUserProfileDto } from '@gympal/shared';
import { RequestUser } from '../../shared/decorators/request-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get(':userId')
  async getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.userProfileService.getProfile(userId);
  }

  @Put()
  async upsertProfile(
    @RequestUser('id') userId: number,
    @Body() dto: CreateUserProfileDto | UpdateUserProfileDto,
  ) {
    return this.userProfileService.upsertProfile(userId, dto);
  }
}
