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
import {
  ACCESS_TOKEN_COOKIE,
  HAS_PROFILE_COOKIE,
  HAS_PROFILE_FALSE,
  HAS_PROFILE_TRUE,
} from '@gympal/shared';
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
    const { token, hasProfile, ...user } = await this.authService.login(dto);

    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie(
      HAS_PROFILE_COOKIE,
      hasProfile ? HAS_PROFILE_TRUE : HAS_PROFILE_FALSE,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return { ...user, hasProfile };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie(HAS_PROFILE_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { success: true };
  }
}
