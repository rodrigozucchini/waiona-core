import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/entities/base.entity';

@Entity('tax_types')
@Index(['code'], { unique: true })
export class TaxTypeEntity extends BaseEntity {
  // Código interno: IVA, IIBB, ECO, etc
  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
  })
  code: string;

  // Nombre visible: Impuesto al Valor Agregado, Ingresos Brutos, etc
  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  name: string;
}