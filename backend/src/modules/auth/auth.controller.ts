import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  registerSchema,
  loginSchena,
  RegisterDto,
  LoginDto,
} from '@gympal/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchena))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
