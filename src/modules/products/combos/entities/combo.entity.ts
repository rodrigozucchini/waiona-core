import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../../common/entities/base.entity';
import { ComboItemEntity } from './combo-item.entity';
import { ComboImageEntity } from '../../combo-images/entities/combo-image.entity';

@Entity('combos')
@Index(['name'])
@Index(['isActive'])
export class ComboEntity extends BaseEntity {

  // ==========================
  // Información básica
  // ==========================

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isActive: boolean;

  // ==========================
  // Relaciones
  // ==========================

  @OneToMany(
    () => ComboItemEntity,
    (item) => item.combo,
  )
  items: ComboItemEntity[];

  @OneToMany(
    () => ComboImageEntity,
    (image) => image.combo,
  )
  images: ComboImageEntity[];
}