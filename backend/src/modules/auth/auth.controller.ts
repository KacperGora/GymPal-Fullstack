import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import type { RegisterDto, LoginDto } from '@gympal/shared';
import { registerSchema, loginSchema } from '@gympal/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
