import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StockItemEntity } from '../entities/stock-item.entity';
import { StockMovementEntity } from '../../stock-movement/entities/stock-movement.entity';
import { StockWriteOffEntity } from '../../stock-writeoff/entities/stock-writeoff.entity';

import { CreateStockItemDto } from '../dto/create-stock-item.dto';
import { UpdateStockThresholdsDto } from '../dto/update-stock-thresholds.dto';
import { CreateStockWriteOffDto } from '../../stock-writeoff/dto/create-stock-writeoff.dto';

import { StockItemResponseDto } from '../dto/stock-item-response.dto';
import { StockItemWithMovementsResponseDto } from '../dto/stock-item-with-movements-response.dto';

import { StockOperationType } from '../../stock-movement/enums/stock-operation-type.enum';
import { StockFlow } from '../../stock-movement/enums/stock-flow.enum';
import { StockReferenceType } from '../../stock-movement/enums/stock-reference.enum';
import { UpdateStockWriteOffDto } from '../../stock-writeoff/dto/update-stock-writeoff.dto';

@Injectable()
export class StockItemsService {

  constructor(
    @InjectRepository(StockItemEntity)
    private readonly stockItemRepository: Repository<StockItemEntity>,

    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepository: Repository<StockMovementEntity>,

    @InjectRepository(StockWriteOffEntity)
    private readonly stockWriteOffRepository: Repository<StockWriteOffEntity>,
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

    stockItem.quantityCurrent += quantity;

    await this.stockItemRepository.save(stockItem);

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
  // WRITE OFF SIMPLE
  // ==========================

  async writeOff(
    stockItemId: number,
    quantity: number,
  ): Promise<StockItemWithMovementsResponseDto> {

    if (quantity <= 0) {
      throw new BadRequestException(
        'Quantity must be greater than 0',
      );
    }

    const stockItem = await this.stockItemRepository.findOne({
      where: { id: stockItemId },
    });

    if (!stockItem) {
      throw new NotFoundException(
        `StockItem with id ${stockItemId} not found`,
      );
    }

    if (stockItem.quantityCurrent < quantity) {
      throw new BadRequestException(
        'Insufficient stock',
      );
    }

    stockItem.quantityCurrent -= quantity;

    await this.stockItemRepository.save(stockItem);

    const movement = this.stockMovementRepository.create({
      stockItemId: stockItem.id,
      operationType: StockOperationType.ADJUSTMENT,
      stockFlow: StockFlow.OUTBOUND,
      quantity: quantity,
      referenceType: StockReferenceType.MANUAL,
    });

    await this.stockMovementRepository.save(movement);

    const entity = await this.findOne(stockItem.id);

    return new StockItemWithMovementsResponseDto(entity);
  }

  // ==========================
  // WRITE OFF DAMAGE
  // ==========================

  async writeOffDamage(
    dto: CreateStockWriteOffDto,
  ): Promise<StockItemWithMovementsResponseDto> {

    if (dto.quantity <= 0) {
      throw new BadRequestException(
        'Quantity must be greater than 0',
      );
    }

    const stockItem = await this.stockItemRepository.findOne({
      where: { id: dto.stockItemId },
    });

    if (!stockItem) {
      throw new NotFoundException(
        `StockItem with id ${dto.stockItemId} not found`,
      );
    }

    if (stockItem.quantityCurrent < dto.quantity) {
      throw new BadRequestException(
        'Insufficient stock',
      );
    }

    stockItem.quantityCurrent -= dto.quantity;

    await this.stockItemRepository.save(stockItem);

    const movement = this.stockMovementRepository.create({
      stockItemId: stockItem.id,
      operationType: StockOperationType.DAMAGE,
      stockFlow: StockFlow.OUTBOUND,
      quantity: dto.quantity,
      referenceType: StockReferenceType.MANUAL,
    });

    const savedMovement = await this.stockMovementRepository.save(movement);

    const writeOff = this.stockWriteOffRepository.create({
      stockItemId: dto.stockItemId,
      movementId: savedMovement.id,
      quantity: dto.quantity,
      reason: dto.reason,
      description: dto.description,
      attachments: dto.attachments,
      reportedBy: dto.reportedBy,
    });

    await this.stockWriteOffRepository.save(writeOff);

    const entity = await this.findOne(stockItem.id);

    return new StockItemWithMovementsResponseDto(entity);
  }


   // ==========================
  // UPDATE WRITE OFF
  // ==========================

  async update(
    id: number,
    dto: UpdateStockWriteOffDto,
  ): Promise<StockWriteOffEntity> {

    const writeOff = await this.stockWriteOffRepository.findOne({
      where: { id },
    });

    if (!writeOff) {
      throw new NotFoundException(
        `StockWriteOff with id ${id} not found`,
      );
    }

    // actualizar solo campos permitidos
    if (dto.reason !== undefined) {
      writeOff.reason = dto.reason;
    }

    if (dto.description !== undefined) {
      writeOff.description = dto.description;
    }

    if (dto.attachments !== undefined) {
      writeOff.attachments = dto.attachments;
    }

    const saved = await this.stockWriteOffRepository.save(writeOff);

    return saved;
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