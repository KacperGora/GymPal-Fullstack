import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGurad } from '../auth/jwt/jwt-auth.gurad';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGurad)
  @Get('me')
  getMe(@Req() req: any) {
    return {
      message: 'Proted',
      user: req.user,
    };
  }
}
