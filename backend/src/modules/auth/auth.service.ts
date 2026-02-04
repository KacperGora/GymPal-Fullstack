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
      select: {
        id: true,
        email: true,
        password: true,
        userProfile: { select: { id: true } },
      },
    });

    if (!user || !(await comparePassword(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { userProfile, ...rest } = user;
    return { ...rest, hasProfile: !!userProfile, token };
  }
  async me(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userProfile: { select: { id: true } },
      },
    });

    if (!user) return null;

    const { userProfile, ...rest } = user;
    return { ...rest, hasProfile: !!userProfile };
  }
}
