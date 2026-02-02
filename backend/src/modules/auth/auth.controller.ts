import {
  Body,
  Controller,
  Post,
  UsePipes,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import type { RegisterDto, LoginDto } from '@gympal/shared';
import { registerSchema, loginSchema } from '@gympal/shared';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { RequestUser } from '../../shared/decorators/request-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@RequestUser() user: { id: number; email: string }) {
    return this.authService.me(user.id);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, ...user } = await this.authService.login(dto);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }
}
