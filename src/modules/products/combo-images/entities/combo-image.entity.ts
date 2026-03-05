import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  
  import { BaseEntity } from '../../../../common/entities/base.entity';
  import { ComboEntity } from '../../combos/entities/combo.entity';
  
  @Entity('combo_images')
  @Index(['comboId'])
  @Index(['comboId', 'position'], { unique: true }) // evita posiciones duplicadas por combo
  export class ComboImageEntity extends BaseEntity {
  
    // FK explícita
    @Column()
    comboId: number;
  
    @ManyToOne(() => ComboEntity, {
      nullable: false,
      onDelete: 'RESTRICT', // usás soft delete
    })
    @JoinColumn({ name: 'comboId' })
    combo: ComboEntity;
  
    @Column({
      type: 'varchar',
      length: 255,
      nullable: false,
    })
    url: string;
  
    @Column({
      type: 'int',
      nullable: false,
    })
    position: number; // orden manual
  }