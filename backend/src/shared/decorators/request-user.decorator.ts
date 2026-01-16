import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestUserType {
  id: string;
  email: string;
}

export const RequestUser = createParamDecorator(
  (
    data: keyof RequestUserType | undefined,
    ctx: ExecutionContext,
  ): string | RequestUserType | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: RequestUserType }>();
    const user = req.user;
    return data ? user?.[data] : user;
  },
);
