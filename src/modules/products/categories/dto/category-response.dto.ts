import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'BEBIDAS' })
  name: string;

  @ApiProperty({ example: 'Bebidas en general', required: false })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: null, nullable: true })
  parentId?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(entity: CategoryEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.description = entity.description;
    this.isActive = entity.isActive;
    this.parentId = entity.parentId ?? null;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
