import { Test, TestingModule } from '@nestjs/testing';

// Mock PrismaService before importing
jest.mock('../../shared/db/prisma.service');

import { UserProfileService } from './user-profile.service';
import { PrismaService } from '../../shared/db/prisma.service';

describe('UserProfileService', () => {
  let service: UserProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: PrismaService,
          useValue: new PrismaService(),
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
