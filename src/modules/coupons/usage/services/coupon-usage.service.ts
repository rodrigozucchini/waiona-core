import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponUsageEntity } from '../entities/coupon-usage.entity';
import { CouponEntity } from '../../coupon/entities/coupon.entity';
import { CouponUsageResponseDto } from '../dto/coupon-usage-response.dto';
import { CreateCouponUsageDto } from '../dto/create-coupon-usage.dto';

@Injectable()
export class CouponUsageService {

  constructor(
    @InjectRepository(CouponUsageEntity)
    private readonly repo: Repository<CouponUsageEntity>,

    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
  ) {}

  // ==========================
  // CREATE (llamado desde órdenes al confirmar compra con cupón)
  // ==========================

  async create(dto: CreateCouponUsageDto): Promise<CouponUsageResponseDto> {

    // 1. Buscar cupón por code
    const coupon = await this.couponRepository.findOne({
      where: { code: dto.code, isDeleted: false },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code "${dto.code}" not found`);
    }

    // 2. Validar que está activo
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw new BadRequestException('Coupon is not active yet');
    }
    if (coupon.endsAt && now > coupon.endsAt) {
      throw new BadRequestException('Coupon has expired');
    }

    // 3. Validar límite de uso global
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined) {
      if (coupon.usageCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }
    }

    // 4. Validar que el usuario no lo usó antes (unique constraint couponId+userId)
    const alreadyUsed = await this.repo.findOne({
      where: { couponId: coupon.id, userId: dto.userId, isDeleted: false },
    });

    if (alreadyUsed) {
      throw new ConflictException('User has already used this coupon');
    }

    // 5. Registrar el uso
    const usage = this.repo.create({
      couponId: coupon.id,
      orderId:  dto.orderId,
      userId:   dto.userId,
      appliedAt: now,
    });

    await this.repo.save(usage);

    // 6. Incrementar usageCount en el cupón
    coupon.usageCount += 1;
    await this.couponRepository.save(coupon);

    return new CouponUsageResponseDto(usage);
  }

  // ==========================
  // GET ALL
  // ==========================

  async findAll(): Promise<CouponUsageResponseDto[]> {
    const usages = await this.repo.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
    return usages.map(u => new CouponUsageResponseDto(u));
  }

  // ==========================
  // GET BY COUPON
  // ==========================

  async findByCoupon(couponId: number): Promise<CouponUsageResponseDto[]> {
    const usages = await this.repo.find({
      where: { couponId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
    return usages.map(u => new CouponUsageResponseDto(u));
  }

  // ==========================
  // GET BY USER
  // ==========================

  async findByUser(userId: number): Promise<CouponUsageResponseDto[]> {
    const usages = await this.repo.find({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
    return usages.map(u => new CouponUsageResponseDto(u));
  }
}