import { MarginEntity } from "../entities/margin.entity";

export class MarginResponseDto {
  id: number;
  name: string;
  value: number;
  isPercentage: boolean;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: MarginEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.value = Number(entity.value); // importante porque decimal viene como string
    this.isPercentage = entity.isPercentage;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}