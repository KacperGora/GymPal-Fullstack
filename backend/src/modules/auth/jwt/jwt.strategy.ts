import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');
    super({
      jwtFromRequest: (req: Request) =>
        (req?.cookies?.access_token as string) ?? null,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return { id: Number(payload.sub), email: payload.email };
  }
}
