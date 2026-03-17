import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';
import { TaxTypeEntity } from '../../tax-types/entities/tax-types.entity';

@Entity('taxes')
@Index(['taxTypeId'])
export class TaxEntity extends BaseEntity {

  // FK explícita (recomendado)
  @Column()
  taxTypeId: number;

  // relación con tax_types
  @ManyToOne(() => TaxTypeEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'taxTypeId' })
  taxType: TaxTypeEntity;

  // valor del impuesto (21.00, 10.50, etc)
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
  })
  value: number;

  // true = porcentaje
  // false = monto fijo
  @Column({
    type: 'boolean',
    nullable: false,
  })
  isPercentage: boolean;
}