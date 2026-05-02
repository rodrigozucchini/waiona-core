import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../../users/services/users.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { TokenEntity } from 'src/modules/mail/entities/token.entity';
import { TokenType } from 'src/modules/mail/enum/token-type.enum';
import { RoleType } from 'src/common/enums/role-type.enum';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = () => ({
    findByEmail:    jest.fn(),
    findOne:        jest.fn(),
    create:         jest.fn(),
    activate:       jest.fn(),
    updatePassword: jest.fn(),
  });

  const mockJwtService  = () => ({ sign: jest.fn(() => 'mock_token') });
  const mockMailService = () => ({
    sendActivationEmail:    jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  });

  const mockTokenRepo = () => ({
    findOne: jest.fn(),
    create:  jest.fn(),
    save:    jest.fn(),
    update:  jest.fn(),
  });

  const mockUser = (overrides = {}) => ({
    id: 1, email: 'juan@test.com', password: 'hashed',
    isActive: true, isDeleted: false,
    profile: { name: 'Juan', lastName: 'Pérez' },
    role: { type: RoleType.CLIENT },
    ...overrides,
  });

  const mockToken = (overrides = {}): TokenEntity =>
    ({
      id: 1, token: 'raw_token', type: TokenType.ACCOUNT_ACTIVATION,
      userId: 1, usedAt: null, isDeleted: false,
      expiresAt: new Date(Date.now() + 3600000), // 1 hora en el futuro
      get isExpired() { return new Date() > this.expiresAt; },
      get isUsed() { return this.usedAt !== null; },
      ...overrides,
    }) as unknown as TokenEntity;

  let usersService: any;
  let jwtService: any;
  let mailService: any;
  let tokenRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService,                        useFactory: mockUsersService },
        { provide: JwtService,                          useFactory: mockJwtService   },
        { provide: MailService,                         useFactory: mockMailService  },
        { provide: getRepositoryToken(TokenEntity),     useFactory: mockTokenRepo    },
      ],
    }).compile();

    service      = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService   = module.get(JwtService);
    mailService  = module.get(MailService);
    tokenRepo    = module.get(getRepositoryToken(TokenEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ==========================
  // validateUser
  // ==========================

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const hashed = await bcrypt.hash('12345678', 10);
      usersService.findByEmail.mockResolvedValue(mockUser({ password: hashed }));

      const result = await service.validateUser('juan@test.com', '12345678');

      expect(result.email).toBe('juan@test.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.validateUser('no@test.com', '12345678')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashed = await bcrypt.hash('correctpassword', 10);
      usersService.findByEmail.mockResolvedValue(mockUser({ password: hashed }));
      await expect(service.validateUser('juan@test.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account not activated', async () => {
      const hashed = await bcrypt.hash('12345678', 10);
      usersService.findByEmail.mockResolvedValue(mockUser({ password: hashed, isActive: false }));
      await expect(service.validateUser('juan@test.com', '12345678')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==========================
  // generateToken
  // ==========================

  describe('generateToken', () => {
    it('should generate a JWT token with sub and role', () => {
      const user   = mockUser() as any;
      const result = service.generateToken(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, role: RoleType.CLIENT });
      expect(result).toBe('mock_token');
    });

    it('should set role to null if user has no role', () => {
      const user = mockUser({ role: null }) as any;
      service.generateToken(user);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, role: null });
    });
  });

  // ==========================
  // register
  // ==========================

  describe('register', () => {
    it('should create user and send activation email', async () => {
      const user = mockUser({ isActive: false });
      usersService.create.mockResolvedValue(user);
      tokenRepo.create.mockReturnValue(mockToken());
      tokenRepo.save.mockResolvedValue(mockToken());
      mailService.sendActivationEmail.mockResolvedValue(undefined);

      await service.register({ email: 'juan@test.com', password: '12345678', name: 'Juan', lastName: 'Pérez' } as any);

      expect(usersService.create).toHaveBeenCalled();
      expect(mailService.sendActivationEmail).toHaveBeenCalledWith(
        'juan@test.com', 'Juan', expect.any(String),
      );
    });
  });

  // ==========================
  // activateAccount
  // ==========================

  describe('activateAccount', () => {
    it('should activate account with valid token', async () => {
      const token = mockToken({ type: TokenType.ACCOUNT_ACTIVATION });
      tokenRepo.findOne.mockResolvedValue(token);
      usersService.findOne.mockResolvedValue(mockUser({ isActive: false }));
      tokenRepo.save.mockResolvedValue({ ...token, usedAt: new Date() });

      await service.activateAccount('raw_token');

      expect(usersService.activate).toHaveBeenCalledWith(1);
      expect(tokenRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if token not found', async () => {
      tokenRepo.findOne.mockResolvedValue(null);
      await expect(service.activateAccount('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token already used', async () => {
      tokenRepo.findOne.mockResolvedValue(mockToken({ usedAt: new Date() }));
      await expect(service.activateAccount('used_token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token expired', async () => {
      tokenRepo.findOne.mockResolvedValue(mockToken({ expiresAt: new Date(Date.now() - 1000) }));
      await expect(service.activateAccount('expired_token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if account already active', async () => {
      tokenRepo.findOne.mockResolvedValue(mockToken());
      usersService.findOne.mockResolvedValue(mockUser({ isActive: true }));
      await expect(service.activateAccount('raw_token')).rejects.toThrow(BadRequestException);
    });
  });

  // ==========================
  // forgotPassword
  // ==========================

  describe('forgotPassword', () => {
    it('should send reset email if user exists and is active', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser());
      tokenRepo.update.mockResolvedValue({});
      tokenRepo.create.mockReturnValue(mockToken({ type: TokenType.PASSWORD_RESET }));
      tokenRepo.save.mockResolvedValue(mockToken({ type: TokenType.PASSWORD_RESET }));
      mailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await service.forgotPassword('juan@test.com');

      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'juan@test.com', 'Juan', expect.any(String),
      );
    });

    it('should do nothing if user not found — no pista al atacante', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await service.forgotPassword('noexiste@test.com');
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should do nothing if user is not active', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser({ isActive: false }));
      await service.forgotPassword('juan@test.com');
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  // ==========================
  // resetPassword
  // ==========================

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = mockToken({ type: TokenType.PASSWORD_RESET });
      tokenRepo.findOne.mockResolvedValue(token);
      tokenRepo.save.mockResolvedValue({ ...token, usedAt: new Date() });
      usersService.updatePassword.mockResolvedValue(undefined);

      await service.resetPassword({ token: 'raw_token', password: 'newPassword123' } as any);

      expect(usersService.updatePassword).toHaveBeenCalledWith(1, 'newPassword123');
      expect(tokenRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if token invalid', async () => {
      tokenRepo.findOne.mockResolvedValue(null);
      await expect(service.resetPassword({ token: 'bad', password: 'new' } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token already used', async () => {
      tokenRepo.findOne.mockResolvedValue(mockToken({ usedAt: new Date(), type: TokenType.PASSWORD_RESET }));
      await expect(service.resetPassword({ token: 'used', password: 'new' } as any)).rejects.toThrow(BadRequestException);
    });
  });
});