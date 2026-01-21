import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';

@Module({
  providers: [UserProfileService],
  controllers: [UserProfileController],
})
export class UserProfileModule {}
