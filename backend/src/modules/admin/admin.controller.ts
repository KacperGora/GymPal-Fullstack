import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { AdminService } from './admin.service';
import { IngredientSeederService } from '../../shared/services/ingredient-seeder.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ingredientSeeder: IngredientSeederService,
  ) {}

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Get('stats')
  getAdminStats() {
    return this.adminService.getStats();
  }

  @Post('ingredients/seed-usda')
  seedIngredients() {
    return this.ingredientSeeder.seedFromUsda();
  }
}
