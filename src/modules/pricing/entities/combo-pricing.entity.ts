import { BaseAuditEntity } from "src/common/entities/base.audit.entity";
import { CurrencyCode } from "src/common/enums/currency-code.enum";
import { ComboEntity } from "src/modules/products/combos/entities/combo.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Entity('combo_pricing')
@Index(['comboId'], { unique: true })
export class ComboPricingEntity extends BaseAuditEntity {

  @Column({
    name: 'combo_id',
    type: 'int',
  })
  comboId: number;

  @ManyToOne(() => ComboEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'combo_id' })
  combo: ComboEntity;

  @Column({
    type: 'enum',
    enum: CurrencyCode,
  })
  currency: CurrencyCode;

  // ==========================
  // BASE PRICE
  // ==========================

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice: number;

  // ==========================
  // REFERENCE PRICE
  // ==========================

  @Column({
    name: 'reference_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  referencePrice?: number;

}