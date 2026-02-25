import {
    Entity,
    Column,
    Index,
  } from 'typeorm';
  
  import { BaseEntity } from 'src/common/entities/base.entity';
  import { DiscountStatus } from '../enums/discount-status.enum';
  
  @Entity('discounts')
  @Index(['status'])
  @Index(['startsAt'])
  @Index(['endAt'])
  export class DiscountEntity extends BaseEntity {
  
    @Column({
      type: 'varchar',
      length: 100,
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
      type: 'enum',
      enum: DiscountStatus,
      default: DiscountStatus.INACTIVE,
      nullable: false,
    })
    status: DiscountStatus;
  
    @Column({
      type: 'boolean',
      default: false,
      nullable: false,
    })
    exclusive: boolean;
  
    @Column({
      name: 'usage_limit',
      type: 'int',
      nullable: true,
    })
    usageLimit?: number;
  
    @Column({
      name: 'usage_count',
      type: 'int',
      default: 0,
      nullable: false,
    })
    usageCount: number;
  
    @Column({
      name: 'starts_at',
      type: 'timestamp',
      nullable: true,
    })
    startsAt?: Date;
  
    @Column({
      name: 'end_at',
      type: 'timestamp',
      nullable: true,
    })
    endAt?: Date;
  }