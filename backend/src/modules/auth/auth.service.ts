import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../shared/db/prisma.service';
import { LoginDto, RegisterDto } from '@gympal/shared';
import { comparePassword, hashPassword } from '../../shared/lib/hash';
import { JwtService } from '@nestjs/jwt';

const REFRESH_TOKEN_TTL_DAYS = 30;
const REFRESH_TOKEN_BYTES = 48;

interface TokenContext {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(
    userId: number,
    context: TokenContext & { familyId?: string },
  ) {
    const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const tokenHash = this.hashToken(token);
    const familyId = context.familyId ?? crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        familyId,
        userId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        expiresAt,
      },
    });

    return { token, familyId, expiresAt };
  }

  private async revokeTokenFamily(familyId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            revokedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    });
    this.logger.log(`Cleaned up ${result.count} expired/revoked tokens`);
  }
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
  async login(dto: LoginDto, context: TokenContext) {
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
    const refresh = await this.createRefreshToken(user.id, context);
    const { userProfile, ...rest } = user;
    return {
      ...rest,
      hasProfile: !!userProfile,
      token,
      refreshToken: refresh.token,
    };
  }

  async refresh(refreshToken: string, context: TokenContext) {
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userProfile: { select: { id: true } },
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Token reuse detection - if already revoked, someone stole the token
    // Revoke entire family to protect user
    if (tokenRecord.revokedAt) {
      this.logger.warn(
        `Refresh token reuse detected for user ${tokenRecord.userId}, revoking family ${tokenRecord.familyId}`,
      );
      await this.revokeTokenFamily(tokenRecord.familyId);
      throw new UnauthorizedException('Token reuse detected');
    }

    // Revoke current token
    await this.prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });

    // Create new token in the same family
    const nextRefresh = await this.createRefreshToken(tokenRecord.userId, {
      ...context,
      familyId: tokenRecord.familyId,
    });
    const accessToken = this.jwtService.sign({
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
    });

    return {
      accessToken,
      refreshToken: nextRefresh.token,
      hasProfile: !!tokenRecord.user.userProfile,
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
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
