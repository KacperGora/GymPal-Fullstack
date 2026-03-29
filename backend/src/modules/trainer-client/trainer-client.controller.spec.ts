import { Test, TestingModule } from '@nestjs/testing';
import { TrainerClientController } from './trainer-client.controller';
import { PrismaService } from '../../shared/db/prisma.service';
import { TrainerClientService } from './trainer-client.service';

describe('TrainerClientController', () => {
  let controller: TrainerClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainerClientController],
      providers: [
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: TrainerClientService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TrainerClientController>(TrainerClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
