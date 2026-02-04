import { Module } from '@nestjs/common';
import { WaterController } from './water.controller';
import { WaterService } from './water.service';
import { PrismaModule } from '../../shared/db/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WaterController],
  providers: [WaterService],
})
export class WaterModule {}
