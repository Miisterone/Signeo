import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

const mockUser = {
  id: 'user-1',
  email: 'joris@signo.com',
  name: 'Joris',
  role: 'AGENT',
  seniority: null,
  hiredAt: null,
  isActive: true,
  managerId: null,
  lastLoginAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('hashes the password and never returns it', async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: mockUser.email,
        password: 'supersecret',
        name: mockUser.name,
      });

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('passwordHash');

      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data.passwordHash).toBeDefined();
      expect(createArgs.data.passwordHash).not.toBe('supersecret');
    });
  });

  describe('findAll', () => {
    it('returns every user', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      await expect(service.findAll()).resolves.toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.findOne(mockUser.id)).resolves.toEqual(mockUser);
    });

    it('throws NotFoundException when missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates an existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Joris Updated',
      });

      const result = await service.update(mockUser.id, {
        name: 'Joris Updated',
      });

      expect(result.name).toBe('Joris Updated');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });
});
