import {
  Body,
  Controller,
  Post,
  UsePipes,
  Get,
  UseGuards,
} from '@nestjs/common';
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
    console.log(user);
    return this.authService.me(user.id);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
