import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StockLocationEntity } from '../entities/stock-locations.entity';

import { CreateStockLocationDto } from '../dto/create-stock-location.dto';
import { UpdateStockLocationDto } from '../dto/update-stock-location.dto';
import { StockLocationResponseDto } from '../dto/stock-location-response.dto';

@Injectable()
export class StockLocationsService {
  constructor(
    @InjectRepository(StockLocationEntity)
    private readonly stockLocationRepository: Repository<StockLocationEntity>,
  ) {}

  // CREATE
  async create(
    dto: CreateStockLocationDto,
  ): Promise<StockLocationResponseDto> {
    const location = this.stockLocationRepository.create(dto);

    const saved = await this.stockLocationRepository.save(location);

    return new StockLocationResponseDto(saved);
  }

  // GET ALL (no eliminados)
  async findAll(): Promise<StockLocationResponseDto[]> {
    const locations = await this.stockLocationRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return locations.map(
      (location) => new StockLocationResponseDto(location),
    );
  }

  // GET BY ID
  async findOne(id: number): Promise<StockLocationResponseDto> {
    const location = await this.stockLocationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!location) {
      throw new NotFoundException(
        `StockLocation with id ${id} not found`,
      );
    }

    return new StockLocationResponseDto(location);
  }

  // UPDATE (parcial)
  async update(
    id: number,
    dto: UpdateStockLocationDto,
  ): Promise<StockLocationResponseDto> {
    const location = await this.stockLocationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!location) {
      throw new NotFoundException(
        `StockLocation with id ${id} not found`,
      );
    }

    const merged = this.stockLocationRepository.merge(location, dto);

    const updated = await this.stockLocationRepository.save(merged);

    return new StockLocationResponseDto(updated);
  }

  // SOFT DELETE
  async remove(id: number): Promise<void> {
    const location = await this.stockLocationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!location) {
      throw new NotFoundException(
        `StockLocation with id ${id} not found`,
      );
    }

    location.isDeleted = true;

    await this.stockLocationRepository.save(location);
  }
}