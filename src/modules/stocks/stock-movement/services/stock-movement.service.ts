import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StockMovementEntity } from '../entities/stock-movement.entity';
import { StockMovementResponseDto } from '../dto/stock-movement-respose.dto';

@Injectable()
export class StockMovementService {

  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepository: Repository<StockMovementEntity>,
  ) {}

  async findAll(): Promise<StockMovementResponseDto[]> {

    const movements = await this.stockMovementRepository.find({
      order: { createdAt: 'DESC' },
    });

    return movements.map(
      (movement) => new StockMovementResponseDto(movement),
    );
  }

  async findById(id: number): Promise<StockMovementResponseDto> {

    const movement = await this.stockMovementRepository.findOne({
      where: { id },
    });

    if (!movement) {
      throw new NotFoundException(`StockMovement with id ${id} not found`);
    }

    return new StockMovementResponseDto(movement);
  }

  async findByStockItemId(stockItemId: number): Promise<StockMovementResponseDto[]> {

    const movements = await this.stockMovementRepository.find({
      where: { stockItemId },
      order: { createdAt: 'DESC' },
    });

    return movements.map(
      (movement) => new StockMovementResponseDto(movement),
    );
  }

}