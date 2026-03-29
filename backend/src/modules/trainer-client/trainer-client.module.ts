import { Module } from '@nestjs/common';
import { TrainerClientController } from './trainer-client.controller';
import { TrainerClientService } from './trainer-client.service';

@Module({
  controllers: [TrainerClientController],
  providers: [TrainerClientService],
})
export class TrainerClientModule {}
