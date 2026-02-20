import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { TaxTypeEntity } from '../../tax-types/entities/tax-types.entity';

@Entity('taxes')
@Index(['taxType']) // índice para búsquedas frecuentes por tipo de impuesto
export class TaxEntity extends BaseEntity {
  @ManyToOne(() => TaxTypeEntity, { nullable: false })
  @JoinColumn({ name: 'tax_type_id' })
  taxType: TaxTypeEntity;

  // valor del impuesto: 21.00, 10.50, etc
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
  })
  value: number;

  // true = porcentaje, false = monto fijo
  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isPercentage: boolean;
}