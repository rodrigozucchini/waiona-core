import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponUsageEntity } from '../entities/coupon-usage.entity';
import { CouponUsageResponseDto } from '../dto/coupon-usage-response.dto';

@Injectable()
export class CouponUsageService {

  constructor(
    @InjectRepository(CouponUsageEntity)
    private readonly repo: Repository<CouponUsageEntity>,
  ) {}

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