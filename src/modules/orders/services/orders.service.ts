import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { ProductEntity } from 'src/modules/products/product/entities/product.entity';
import { ComboEntity } from 'src/modules/products/combos/entities/combo.entity';
import { CouponEntity } from 'src/modules/coupons/coupon/entities/coupon.entity';
import { CouponUsageEntity } from 'src/modules/coupons/usage/entities/coupon-usage.entity';
import { StockItemEntity } from 'src/modules/stocks/stock-item/entities/stock-item.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

import { StockItemsService } from 'src/modules/stocks/stock-item/services/stock-item.service';
import { CalculationService } from 'src/modules/pricing/calculation/services/calculation.service';

import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryType } from '../enums/delivery-type.enum';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,

    @InjectRepository(ComboEntity)
    private readonly comboRepo: Repository<ComboEntity>,

    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,

    @InjectRepository(CouponUsageEntity)
    private readonly couponUsageRepo: Repository<CouponUsageEntity>,

    @InjectRepository(StockItemEntity)
    private readonly stockItemRepo: Repository<StockItemEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    private readonly stockItemsService: StockItemsService,
    private readonly calculationService: CalculationService,
  ) {}

  // ==========================
  // CREATE
  // ==========================

  async create(userId: number, dto: CreateOrderDto): Promise<OrderEntity> {
    const now = new Date();

    // Buscar usuario
    const user = await this.userRepo.findOne({
      where: { id: userId, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');

    // 1. Validar items
    for (const item of dto.items) {
      if (!item.productId && !item.comboId) {
        throw new BadRequestException('Each item must have a productId or comboId');
      }
      if (item.productId && item.comboId) {
        throw new BadRequestException('Each item must have either productId or comboId, not both');
      }
    }

    // 2. Validar dirección si es delivery
    if (dto.deliveryType === DeliveryType.DELIVERY && !dto.address) {
      throw new BadRequestException('Address is required for delivery orders');
    }

    // 3. Calcular precio de cada item y validar stock
    const orderItems: OrderItemEntity[] = [];
    const stockReservations: { productId: number; locationId: number; quantity: number }[] = [];
    let subtotal = 0;

    for (const item of dto.items) {

      if (item.productId) {
        const product = await this.productRepo.findOne({
          where: { id: item.productId, isDeleted: false },
        });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        const stockItem = await this.findAvailableStockItem(item.productId, item.quantity);

        const breakdown = await this.calculationService.calculateProduct({
          productId: item.productId,
        });

        const orderItem = this.orderItemRepo.create({
          product,
          quantity: item.quantity,
          unitPrice: breakdown.unitPrice,
          finalPrice: breakdown.finalPrice * item.quantity,
        });

        orderItems.push(orderItem);
        stockReservations.push({
          productId: item.productId,
          locationId: stockItem.locationId,
          quantity: item.quantity,
        });
        subtotal += breakdown.finalPrice * item.quantity;

      } else if (item.comboId) {
        const combo = await this.comboRepo.findOne({
          where: { id: item.comboId, isDeleted: false },
          relations: ['items'],
        });
        if (!combo) throw new NotFoundException(`Combo ${item.comboId} not found`);

        for (const comboItem of combo.items) {
          const stockItem = await this.findAvailableStockItem(
            comboItem.productId,
            item.quantity * comboItem.quantity,
          );
          stockReservations.push({
            productId: comboItem.productId,
            locationId: stockItem.locationId,
            quantity: item.quantity * comboItem.quantity,
          });
        }

        const breakdown = await this.calculationService.calculateCombo({
          comboId: item.comboId,
        });

        const orderItem = this.orderItemRepo.create({
          combo,
          quantity: item.quantity,
          unitPrice: breakdown.unitPrice,
          finalPrice: breakdown.finalPrice * item.quantity,
        });

        orderItems.push(orderItem);
        subtotal += breakdown.finalPrice * item.quantity;
      }
    }

    // 4. Aplicar cupón si viene
    let coupon: CouponEntity | null = null;
    let couponDiscount = 0;

    if (dto.couponCode) {
      coupon = await this.couponRepo.findOne({
        where: { code: dto.couponCode, isDeleted: false },
      });

      if (!coupon) throw new NotFoundException('Coupon not found');

      if (coupon.startsAt && now < coupon.startsAt) {
        throw new BadRequestException('Coupon is not active yet');
      }
      if (coupon.endsAt && now > coupon.endsAt) {
        throw new BadRequestException('Coupon has expired');
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon has reached its usage limit');
      }

      const alreadyUsed = await this.couponUsageRepo.findOne({
        where: { couponId: coupon.id, userId: user.id },
      });
      if (alreadyUsed) throw new ConflictException('Coupon already used by this user');

      couponDiscount = coupon.isPercentage
        ? subtotal * (coupon.value / 100)
        : coupon.value;
    }

    const total = subtotal - couponDiscount;

    // 5. Guardar orden
    const order = this.orderRepo.create({
      user,
      items: orderItems,
      status: OrderStatus.PENDING,
      deliveryType: dto.deliveryType,
      address: dto.address ?? null,
      notes: dto.notes ?? null,
      subtotal,
      couponDiscount: couponDiscount || null,
      coupon: coupon ?? null,
      total,
    });

    const saved = await this.orderRepo.save(order);

    // 6. Reservar stock
    for (const reservation of stockReservations) {
      await this.stockItemsService.reserveStock(
        reservation.productId,
        reservation.locationId,
        reservation.quantity,
      );
    }

    // 7. Registrar uso del cupón
    if (coupon) {
      coupon.usageCount += 1;
      await this.couponRepo.save(coupon);

      const usage = this.couponUsageRepo.create({
        couponId: coupon.id,
        userId: user.id,
        orderId: saved.id,
        appliedAt: now,
      });
      await this.couponUsageRepo.save(usage);
    }

    return saved;
  }

  // ==========================
  // FIND ALL
  // ==========================

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepo.find({
      where: { isDeleted: false },
      relations: ['user', 'items', 'items.product', 'items.combo', 'coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================
  // FIND ONE
  // ==========================

  async findOne(id: number): Promise<OrderEntity> {
    const order = await this.orderRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'items', 'items.product', 'items.combo', 'coupon'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ==========================
  // FIND BY USER
  // ==========================

  async findByUser(userId: number): Promise<OrderEntity[]> {
    return this.orderRepo.find({
      where: { user: { id: userId }, isDeleted: false },
      relations: ['items', 'items.product', 'items.combo', 'coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================
  // UPDATE STATUS (admin)
  // ==========================

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<OrderEntity> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    if (dto.status === OrderStatus.DISPATCHED) {
      await this.handleDispatch(order);
    }

    if (dto.status === OrderStatus.CANCELLED) {
      await this.handleCancellation(order);
    }

    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  // ==========================
  // HELPERS PRIVADOS
  // ==========================

  private async findAvailableStockItem(
    productId: number,
    quantity: number,
  ): Promise<StockItemEntity> {
    const stockItem = await this.stockItemRepo.findOne({
      where: { productId, isDeleted: false },
    });

    if (!stockItem) {
      throw new NotFoundException(`No stock found for product ${productId}`);
    }

    const available = stockItem.quantityCurrent - stockItem.quantityReserved;
    if (available < quantity) {
      throw new BadRequestException(`Insufficient stock for product ${productId}`);
    }

    return stockItem;
  }

  private async handleDispatch(order: OrderEntity): Promise<void> {
    for (const item of order.items) {
      if (item.product) {
        const stockItem = await this.stockItemRepo.findOne({
          where: { productId: item.product.id, isDeleted: false },
        });
        if (!stockItem) continue;
        await this.stockItemsService.dispatchStock(
          item.product.id,
          stockItem.locationId,
          item.quantity,
          order.id,
        );
      } else if (item.combo) {
        const combo = await this.comboRepo.findOne({
          where: { id: item.combo.id },
          relations: ['items'],
        });
        if (!combo) continue;
        for (const comboItem of combo.items) {
          const stockItem = await this.stockItemRepo.findOne({
            where: { productId: comboItem.productId, isDeleted: false },
          });
          if (!stockItem) continue;
          await this.stockItemsService.dispatchStock(
            comboItem.productId,
            stockItem.locationId,
            item.quantity * comboItem.quantity,
            order.id,
          );
        }
      }
    }
  }

  private async handleCancellation(order: OrderEntity): Promise<void> {
    for (const item of order.items) {
      if (item.product) {
        const stockItem = await this.stockItemRepo.findOne({
          where: { productId: item.product.id, isDeleted: false },
        });
        if (!stockItem) continue;
        await this.stockItemsService.releaseReservation(
          item.product.id,
          stockItem.locationId,
          item.quantity,
          order.id,
        );
      } else if (item.combo) {
        const combo = await this.comboRepo.findOne({
          where: { id: item.combo.id },
          relations: ['items'],
        });
        if (!combo) continue;
        for (const comboItem of combo.items) {
          const stockItem = await this.stockItemRepo.findOne({
            where: { productId: comboItem.productId, isDeleted: false },
          });
          if (!stockItem) continue;
          await this.stockItemsService.releaseReservation(
            comboItem.productId,
            stockItem.locationId,
            item.quantity * comboItem.quantity,
            order.id,
          );
        }
      }
    }
  }
}