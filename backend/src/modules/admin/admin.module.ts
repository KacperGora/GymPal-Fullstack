import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { IngredientSeederService } from '../../shared/services/ingredient-seeder.service';
import { UsdaApiService } from '../../shared/services/usda-api.service';
import { PrismaModule } from '../../shared/db/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, IngredientSeederService, UsdaApiService],
})
export class AdminModule {}
