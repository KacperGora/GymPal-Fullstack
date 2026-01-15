import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@gympal/shared';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(user: CreateUserDto) {
    return this.prisma.user.create({ data: user });
  }

  findAll() {
    return this.prisma.user.findMany();
  }
}
