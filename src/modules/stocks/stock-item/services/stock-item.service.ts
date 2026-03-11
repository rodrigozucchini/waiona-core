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
import { UpdateStockThresholdsDto } from '../dto/update-stock-thresholds.dto';

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
  // CREATE STOCK ITEM
  // ==========================

  async create(
    dto: CreateStockItemDto,
  ): Promise<StockItemResponseDto> {

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

    const stockItem = this.stockItemRepository.create({
      productId: dto.productId,
      locationId: dto.locationId,
      quantityCurrent: 0,
      quantityReserved: 0,
      stockMin: dto.stockMin,
      stockCritical: dto.stockCritical,
      stockMax: dto.stockMax,
    });

    const saved = await this.stockItemRepository.save(stockItem);

    return new StockItemResponseDto(saved);
  }

  // ==========================
  // ADD STOCK
  // ==========================

  async addStock(
    productId: number,
    locationId: number,
    quantity: number,
  ): Promise<StockItemWithMovementsResponseDto> {

    if (quantity <= 0) {
      throw new BadRequestException(
        'Quantity must be greater than 0',
      );
    }

    const stockItem = await this.stockItemRepository.findOne({
      where: { productId, locationId },
    });

    if (!stockItem) {
      throw new NotFoundException(
        'StockItem does not exist for this product and location',
      );
    }

    // actualizar stock
    stockItem.quantityCurrent += quantity;

    await this.stockItemRepository.save(stockItem);

    // crear movimiento
    const movement = this.stockMovementRepository.create({
      stockItemId: stockItem.id,
      operationType: StockOperationType.INITIAL,
      stockFlow: StockFlow.INBOUND,
      quantity: quantity,
      referenceType: StockReferenceType.MANUAL,
    });

    await this.stockMovementRepository.save(movement);

    const entity = await this.findOne(stockItem.id);

    return new StockItemWithMovementsResponseDto(entity);
  }

  // ==========================
  // UPDATE STOCK THRESHOLDS
  // ==========================

  async updateThresholds(
    id: number,
    dto: UpdateStockThresholdsDto,
  ): Promise<StockItemResponseDto> {

    const stockItem = await this.stockItemRepository.findOne({
      where: { id },
      relations: ['location', 'product'],
    });

    if (!stockItem) {
      throw new NotFoundException(
        `StockItem with id ${id} not found`,
      );
    }

    this.validateThresholds(
      dto.stockMin,
      dto.stockCritical,
      dto.stockMax,
    );

    stockItem.stockMin = dto.stockMin;
    stockItem.stockCritical = dto.stockCritical;

    if (dto.stockMax !== undefined) {
      stockItem.stockMax = dto.stockMax;
    }

    const saved = await this.stockItemRepository.save(stockItem);

    return new StockItemResponseDto(saved);
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
      order: {
        movements: {
          createdAt: 'DESC',
        },
      },
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