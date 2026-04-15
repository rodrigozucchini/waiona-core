import {
  IsInt,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { Type } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateComboDto, CreateComboItemDto } from './create-combo.dto';

// ==========================
// UPDATE ITEM
// ==========================

export class UpdateComboItemDto extends PartialType(CreateComboItemDto) {

  @IsInt()
  id: number; // 🔥 necesario para identificar el item
}

// ==========================
// UPDATE COMBO
// ==========================

export class UpdateComboDto extends PartialType(
  OmitType(CreateComboDto, ['items'] as const),
) {

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateComboItemDto)
  items?: UpdateComboItemDto[];
}