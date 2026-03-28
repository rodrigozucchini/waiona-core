import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProfileEntity } from './profile.entity';

@Entity('users')
export class UserEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  // ==========================
  // Relaciones
  // ==========================

  @OneToOne(() => ProfileEntity, { nullable: false, cascade: true, eager: true })
  @JoinColumn({ name: 'profile_id' })
  profile: ProfileEntity;

  // ==========================
  // Hooks
  // ==========================

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}