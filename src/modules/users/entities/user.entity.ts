import { Entity, Column, OneToOne, JoinColumn, BeforeInsert, ManyToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProfileEntity } from './profile.entity';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  // ==========================
  // Relaciones
  // ==========================

  @OneToOne(() => ProfileEntity, { nullable: false, cascade: true, eager: true })
  @JoinColumn({ name: 'profile_id' })
  profile: ProfileEntity;


  @ManyToOne(() => RoleEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity | null;

  // ==========================
  // Hooks
  // ==========================

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}