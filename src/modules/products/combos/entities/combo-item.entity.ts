import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  
  import { BaseEntity } from '../../../../common/entities/base.entity';
  import { ComboEntity } from './combo.entity';
  import { ProductEntity } from '../../product/entities/product.entity';
  
  @Entity('combo_items')
  @Index(['comboId'])
  @Index(['productId'])
  export class ComboItemEntity extends BaseEntity {
  
    // FK explícitas
    @Column()
    comboId: number;
  
    @Column()
    productId: number;
  
    @ManyToOne(() => ComboEntity, {
      nullable: false,
      onDelete: 'RESTRICT', // soft delete
    })
    @JoinColumn({ name: 'comboId' })
    combo: ComboEntity;
  
    @ManyToOne(() => ProductEntity, {
      nullable: false,
      onDelete: 'RESTRICT', // soft delete
    })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;
  
    @Column({
      type: 'int',
      nullable: false,
    })
    quantity: number;
  }