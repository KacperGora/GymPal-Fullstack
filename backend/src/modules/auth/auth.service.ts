import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';
import { LoginDto, RegisterDto } from '@gympal/shared';
import { comparePassword, hashPassword } from '../../shared/lib/hash';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const exist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exist) {
      throw new BadRequestException('Email already in use');
    }
    const hashed = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { email: true, id: true },
    });

    return user;
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await comparePassword(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { id: user.id, email: user.email, token };
  }
}
