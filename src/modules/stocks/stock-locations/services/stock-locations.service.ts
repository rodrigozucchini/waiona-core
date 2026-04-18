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

  // ==========================
  // CREATE
  // ==========================

  async create(dto: CreateStockLocationDto): Promise<StockLocationResponseDto> {
    const location = this.stockLocationRepository.create({
      name: dto.name,
      type: dto.type,
      address: dto.address ?? null,
    });

    const saved = await this.stockLocationRepository.save(location);

    return new StockLocationResponseDto(saved);
  }

  // ==========================
  // GET ALL
  // ==========================

  async findAll(): Promise<StockLocationResponseDto[]> {
    const locations = await this.stockLocationRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return locations.map((location) => new StockLocationResponseDto(location));
  }

  // ==========================
  // GET ONE
  // ==========================

  async findOne(id: number): Promise<StockLocationResponseDto> {
    const location = await this.findEntity(id);
    return new StockLocationResponseDto(location);
  }

  // ==========================
  // UPDATE
  // ==========================

  async update(
    id: number,
    dto: UpdateStockLocationDto,
  ): Promise<StockLocationResponseDto> {
    const location = await this.findEntity(id);

    // 🔥 asignación campo a campo — sin merge ni spread
    location.name = dto.name ?? location.name;
    location.type = dto.type ?? location.type;
    location.address = dto.address ?? location.address;

    const updated = await this.stockLocationRepository.save(location);

    return new StockLocationResponseDto(updated);
  }

  // ==========================
  // DELETE (soft)
  // ==========================

  async remove(id: number): Promise<void> {
    const location = await this.findEntity(id);
    location.isDeleted = true;
    await this.stockLocationRepository.save(location);
  }

  // ==========================
  // PRIVATE HELPERS
  // ==========================

  private async findEntity(id: number): Promise<StockLocationEntity> {
    const location = await this.stockLocationRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!location) {
      throw new NotFoundException(`StockLocation with id ${id} not found`);
    }

    return location;
  }
}