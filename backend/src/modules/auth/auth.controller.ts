import {
  Body,
  Controller,
  Post,
  UsePipes,
  Get,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import type { RegisterDto, LoginDto } from '@gympal/shared';
import { registerSchema, loginSchema } from '@gympal/shared';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  HAS_PROFILE_COOKIE,
  HAS_PROFILE_FALSE,
  HAS_PROFILE_TRUE,
} from '@gympal/shared';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { RequestUser } from '../../shared/decorators/request-user.decorator';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Returns current user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@RequestUser() user: { id: number; email: string }) {
    return this.authService.me(user.id);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const context = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };
    const { token, refreshToken, hasProfile, ...user } =
      await this.authService.login(dto, context);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      ...cookieBase,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieBase,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
    res.cookie(
      HAS_PROFILE_COOKIE,
      hasProfile ? HAS_PROFILE_TRUE : HAS_PROFILE_FALSE,
      {
        ...cookieBase,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return { ...user, hasProfile };
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const context = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    };
    const {
      accessToken,
      refreshToken: nextRefresh,
      hasProfile,
    } = await this.authService.refresh(refreshToken, context);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieBase,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, nextRefresh, {
      ...cookieBase,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });
    res.cookie(
      HAS_PROFILE_COOKIE,
      hasProfile ? HAS_PROFILE_TRUE : HAS_PROFILE_FALSE,
      {
        ...cookieBase,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as
      | string
      | undefined;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieBase);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieBase);
    res.clearCookie(HAS_PROFILE_COOKIE, cookieBase);

    return { success: true };
  }
}
