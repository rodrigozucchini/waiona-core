import {
  Entity,
  Column,
  OneToMany,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../../common/entities/base.entity';
import { ComboItemEntity } from './combo-item.entity';

@Entity('combos')
@Index(['name'])
@Index(['isActive'])
export class ComboEntity extends BaseEntity {

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

  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @OneToMany(
    () => ComboItemEntity,
    (item) => item.combo,
  )
  items: ComboItemEntity[];
}