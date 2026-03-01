import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  
  import { BaseEntity } from '../../../../common/entities/base.entity';
  import { ProductEntity } from '../../product/entities/product.entity';
  
  @Entity('product_images')
  @Index(['productId'])
  export class ProductImageEntity extends BaseEntity {
  
    // FK explícita
    @Column()
    productId: number;
  
    @ManyToOne(() => ProductEntity, {
      nullable: false,
      onDelete: 'RESTRICT', // porque usás soft delete
    })
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;
  
    @Column({
      type: 'varchar',
      length: 255,
      nullable: false,
    })
    url: string;
  
    @Column({
      type: 'boolean',
      default: false,
      nullable: false,
    })
    isPrimary: boolean;
  }