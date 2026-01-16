import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Request } from 'express';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request & { email: string; id: number }) {
    return {
      message: 'Proted',
      user: req.user,
    };
  }
}
