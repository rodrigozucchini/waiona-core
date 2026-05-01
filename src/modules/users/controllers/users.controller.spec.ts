import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { RolesGuard } from 'src/common/guards/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockService    = () => ({ create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn(), activate: jest.fn(), updatePassword: jest.fn() });
  const mockAuthGuard  = { canActivate: jest.fn(() => true) };
  const mockRolesGuard = { canActivate: jest.fn(() => true) };

  const mockResponse = (overrides = {}) => ({
    id: 1, email: 'juan@test.com', isActive: true, isDeleted: false,
    profile: { name: 'Juan', lastName: 'Pérez', avatar: null },
    role: { type: 'client' },
    createdAt: new Date(), updatedAt: new Date(), ...overrides,
  });

  const mockRequest = (sub: number) => ({ user: { sub } }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useFactory: mockService },
        { provide: Reflector, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard('jwt')).useValue(mockAuthGuard)
      .overrideGuard(RolesGuard).useValue(mockRolesGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service    = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(controller).toBeDefined());

  // ==========================
  // create
  // ==========================

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 'juan@test.com', password: '12345678', name: 'Juan', lastName: 'Pérez' };
      service.create.mockResolvedValue(mockResponse() as any);
      const result = await controller.create(dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.email).toBe('juan@test.com');
    });
  });

  // ==========================
  // findAll
  // ==========================

  describe('findAll', () => {
    it('should return all users', async () => {
      service.findAll.mockResolvedValue([mockResponse() as any]);
      const result = await controller.findAll({} as any);
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should pass query params to service', async () => {
      service.findAll.mockResolvedValue([]);
      await controller.findAll({ email: 'juan' } as any);
      expect(service.findAll).toHaveBeenCalledWith({ email: 'juan' });
    });
  });

  // ==========================
  // findOne
  // ==========================

  describe('findOne', () => {
    it('should return own user', async () => {
      service.findOne.mockResolvedValue(mockResponse() as any);
      const result = await controller.findOne(1, mockRequest(1));
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it('should throw ForbiddenException if accessing another user', async () => {
      await expect(controller.findOne(2, mockRequest(1))).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================
  // update
  // ==========================

  describe('update', () => {
    it('should update own user', async () => {
      const dto     = { name: 'Carlos' };
      const updated = mockResponse({ profile: { name: 'Carlos', lastName: 'Pérez', avatar: null } });
      service.update.mockResolvedValue(updated as any);

      const result = await controller.update(1, mockRequest(1), dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.profile.name).toBe('Carlos');
    });

    it('should throw ForbiddenException if updating another user', async () => {
      await expect(controller.update(2, mockRequest(1), {} as any)).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================
  // remove
  // ==========================

  describe('remove', () => {
    it('should remove own user', async () => {
      service.remove.mockResolvedValue(undefined as any);
      await controller.remove(1, mockRequest(1));
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException if removing another user', async () => {
      await expect(controller.remove(2, mockRequest(1))).rejects.toThrow(ForbiddenException);
    });
  });
});