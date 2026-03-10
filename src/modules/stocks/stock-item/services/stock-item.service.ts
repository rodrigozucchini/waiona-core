import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StockItemEntity } from '../entities/stock-item.entity';
import { StockMovementEntity } from '../../stock-movement/entities/stock-movement.entity';

import { CreateStockItemDto } from '../dto/create-stock-item.dto';

import { StockItemResponseDto } from '../dto/stock-item-response.dto';
import { StockItemWithMovementsResponseDto } from '../dto/stock-item-with-movements-response.dto';

import { StockOperationType } from '../../stock-movement/enums/stock-operation-type.enum';
import { StockFlow } from '../../stock-movement/enums/stock-flow.enum';
import { StockReferenceType } from '../../stock-movement/enums/stock-reference.enum';

@Injectable()
export class StockItemsService {

  constructor(
    @InjectRepository(StockItemEntity)
    private readonly stockItemRepository: Repository<StockItemEntity>,

    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepository: Repository<StockMovementEntity>,
  ) {}

  // ==========================
  // GET ALL
  // ==========================

  async findAll(): Promise<StockItemResponseDto[]> {

    const stockItems = await this.stockItemRepository.find({
      relations: ['location', 'product'],
      order: {
        id: 'ASC',
      },
    });

    return stockItems.map(
      item => new StockItemResponseDto(item),
    );
  }

  // ==========================
  // GET BY ID (WITH MOVEMENTS)
  // ==========================

  async findById(
    id: number,
  ): Promise<StockItemWithMovementsResponseDto> {

    const stockItem = await this.findOne(id);

    return new StockItemWithMovementsResponseDto(stockItem);
  }

  // ==========================
  // CREATE INITIAL STOCK
  // ==========================

  async create(
    dto: CreateStockItemDto,
  ): Promise<StockItemWithMovementsResponseDto> {

    const existing = await this.stockItemRepository.findOne({
      where: {
        productId: dto.productId,
        locationId: dto.locationId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'StockItem already exists for this product and location',
      );
    }

    this.validateThresholds(
      dto.stockMin,
      dto.stockCritical,
      dto.stockMax,
    );

    const quantity = dto.quantity ?? 0;
    const quantityReserved = dto.quantityReserved ?? 0;

    const stockItem = this.stockItemRepository.create({
      productId: dto.productId,
      locationId: dto.locationId,
      quantity,
      quantityReserved,
      stockMin: dto.stockMin,
      stockCritical: dto.stockCritical,
      stockMax: dto.stockMax,
    });

    const savedStockItem = await this.stockItemRepository.save(stockItem);

    // ==========================
    // MOVIMIENTO INICIAL
    // ==========================

    if (quantity > 0) {

      const movement = this.stockMovementRepository.create({
        stockItemId: savedStockItem.id,
        operationType: StockOperationType.INITIAL,
        stockFlow: StockFlow.INBOUND,
        quantity: quantity,
        referenceType: StockReferenceType.MANUAL,
      });

      await this.stockMovementRepository.save(movement);
    }

    const entity = await this.findOne(savedStockItem.id);

    return new StockItemWithMovementsResponseDto(entity);
  }

  // ==========================
  // PRIVATE FIND ONE
  // ==========================

  private async findOne(
    id: number,
  ): Promise<StockItemEntity> {

    const stockItem = await this.stockItemRepository.findOne({
      where: { id },
      relations: [
        'location',
        'product',
        'movements',
      ],
    });

    if (!stockItem) {
      throw new NotFoundException(
        `StockItem with id ${id} not found`,
      );
    }

    return stockItem;
  }

  // ==========================
  // PRIVATE VALIDATIONS
  // ==========================

  private validateThresholds(
    stockMin: number,
    stockCritical: number,
    stockMax?: number,
  ): void {

    if (stockCritical >= stockMin) {
      throw new BadRequestException(
        'stockCritical must be less than stockMin',
      );
    }

    if (stockMax && stockMax <= stockMin) {
      throw new BadRequestException(
        'stockMax must be greater than stockMin',
      );
    }
  }

}