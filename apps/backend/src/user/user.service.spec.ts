import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';
import { Role } from '../../generated/prisma/enums';

const mockUser = {
  id: 'user-1',
  email: 'joris@signo.com',
  name: 'Joris',
  role: 'AGENT',
  seniority: null,
  hiredAt: null,
  isActive: true,
  managerId: null,
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
    it('create user', async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: mockUser.email,
        password: 'supersecret',
        name: mockUser.name,
        role: mockUser.role as Role,
        isActive: mockUser.isActive,
      });

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('passwordHash');

      const createArgs = prisma.user.create.mock.calls[0][0];
      expect(createArgs.data.passwordHash).toBeDefined();
      expect(createArgs.data.passwordHash).not.toBe('supersecret');
    });
  });

  describe('findAll', () => {
    it('find all users', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      await expect(service.findAll()).resolves.toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('find user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.findOne(mockUser.id)).resolves.toEqual(mockUser);
    });

    it('user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('update user', async () => {
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

    it('user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('updateManager', () => {
    it('change managerId', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        managerId: '35754cd1-bbfe-4b1e-a42d-230a6c898ea0',
      });

      const result = await service.updateManager(mockUser.id, {
        managerId: '35754cd1-bbfe-4b1e-a42d-230a6c898ea0',
      });

      expect(result.managerId).toBe('35754cd1-bbfe-4b1e-a42d-230a6c898ea0');
    });

    it('user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateManager('missing', { managerId: 'manager-1' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('delete user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });
});
