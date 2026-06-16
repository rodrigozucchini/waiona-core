import { ApiProperty } from '@nestjs/swagger';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryTreeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'BEBIDAS' })
  name: string;

  @ApiProperty({ type: () => CategoryTreeResponseDto, isArray: true })
  children: CategoryTreeResponseDto[];

  constructor(entity: CategoryEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.children = entity.children
      ? entity.children.map((child) => new CategoryTreeResponseDto(child))
      : [];
  }
}
