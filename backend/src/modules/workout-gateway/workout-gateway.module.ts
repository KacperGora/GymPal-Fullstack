import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/db/prisma.module';
import { WorkoutGateway } from './workout.gateway';

@Module({
  imports: [PrismaModule],
  providers: [WorkoutGateway],
})
export class WorkoutGatewayModule {}
