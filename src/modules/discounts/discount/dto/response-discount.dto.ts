import { DiscountEntity } from '../entities/discounts.entity';
import { DiscountStatus } from '../enums/discount-status.enum';
import { CurrencyCode } from 'src/common/enums/currency-code.enum';

export class DiscountResponseDto {
  id: number;
  name: string;
  description?: string;

  status: DiscountStatus;

  value: number;
  isPercentage: boolean;
  currency?: CurrencyCode;

  startsAt?: Date;
  endsAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: DiscountEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.description = entity.description ?? undefined;

    this.value = Number(entity.value);
    this.isPercentage = entity.isPercentage;
    this.currency = entity.currency ?? undefined;

    this.startsAt = entity.startsAt ?? undefined;
    this.endsAt = entity.endsAt ?? undefined;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    // Se calcula al final, después de asignar todo
    this.status = this.calculateStatus(entity);
  }

  private calculateStatus(entity: DiscountEntity): DiscountStatus {
    const now = new Date();
    const { startsAt, endsAt } = entity;

    // Guarda contra dato corrupto (endsAt anterior a startsAt)
    if (startsAt && endsAt && endsAt < startsAt) {
      // Dato inconsistente: se reporta como inactivo para no exponer basura
      return DiscountStatus.EXPIRED;
    }

    // Orden correcto: primero expirado, luego programado, luego activo
    if (endsAt && now > endsAt) {
      return DiscountStatus.EXPIRED;
    }

    if (startsAt && now < startsAt) {
      return DiscountStatus.SCHEDULED;
    }

    return DiscountStatus.ACTIVE;
  }
}