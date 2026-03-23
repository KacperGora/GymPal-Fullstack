import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE, JwtPayload } from '@gympal/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');
    super({
      jwtFromRequest: (req: Request) =>
        (req?.cookies?.[ACCESS_TOKEN_COOKIE] as string) ?? null,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
      subscriptionStatus: payload.subscriptionStatus ?? null,
    };
  }
}
