import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { PrismaService } from '../../shared/db/prisma.service';
import { AdminService } from './admin.service';
import { IngredientSeederService } from '../../shared/services/ingredient-seeder.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: AdminService,
          useValue: {},
        },
        {
          provide: IngredientSeederService,
          useValue: { seedFromUsda: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
