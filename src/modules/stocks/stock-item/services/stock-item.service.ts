import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { StockItemEntity } from '../entities/stock-item.entity';
  
  import { CreateStockItemDto } from '../dto/create-stock-item.dto';
  import { UpdateStockItemDto } from '../dto/update-stock-item.dto';
  import { UpdateStockThresholdsDto } from '../dto/update-stock-thresholds.dto';
  import { QueryStockItemsDto } from '../dto/query-stock-item.dto';
  
  import { StockItemResponseDto } from '../dto/stock-item-response.dto';
  
  @Injectable()
  export class StockItemsService {
  
    constructor(
      @InjectRepository(StockItemEntity)
      private readonly stockItemRepository: Repository<StockItemEntity>,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    async findAll(
      query: QueryStockItemsDto,
    ): Promise<StockItemResponseDto[]> {
  
      const stockItems = await this.stockItemRepository.find({
        where: {
          ...(query.productId && { productId: query.productId }),
          ...(query.locationId && { locationId: query.locationId }),
        },
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
    // GET BY ID
    // ==========================
  
    async findById(id: number): Promise<StockItemResponseDto> {
  
      const stockItem = await this.findOne(id);
  
      return new StockItemResponseDto(stockItem);
    }
  
    // ==========================
    // GET BY PRODUCT
    // ==========================
  
    async findByProduct(
      productId: number,
    ): Promise<StockItemResponseDto[]> {
  
      const items = await this.stockItemRepository.find({
        where: {
          productId,
        },
        relations: ['location', 'product'],
      });
  
      return items.map(
        item => new StockItemResponseDto(item),
      );
    }
  
    // ==========================
    // GET BY LOCATION
    // ==========================
  
    async findByLocation(
      locationId: number,
    ): Promise<StockItemResponseDto[]> {
  
      const items = await this.stockItemRepository.find({
        where: {
          locationId,
        },
        relations: ['location', 'product'],
      });
  
      return items.map(
        item => new StockItemResponseDto(item),
      );
    }
  
    // ==========================
    // CREATE
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
        ...dto,
      });
  
      const saved = await this.stockItemRepository.save(stockItem);
  
      const entity = await this.findOne(saved.id);
  
      return new StockItemResponseDto(entity);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    async update(
      id: number,
      changes: UpdateStockItemDto,
    ): Promise<StockItemResponseDto> {
  
      const stockItem = await this.findOne(id);
  
      if (
        changes.stockMin !== undefined ||
        changes.stockCritical !== undefined ||
        changes.stockMax !== undefined
      ) {
        this.validateThresholds(
          changes.stockMin ?? stockItem.stockMin,
          changes.stockCritical ?? stockItem.stockCritical,
          changes.stockMax ?? stockItem.stockMax,
        );
      }
  
      const merged = this.stockItemRepository.merge(
        stockItem,
        changes,
      );
  
      const saved = await this.stockItemRepository.save(merged);
  
      const entity = await this.findOne(saved.id);
  
      return new StockItemResponseDto(entity);
    }
  
    // ==========================
    // UPDATE THRESHOLDS
    // ==========================
  
    async updateThresholds(
      id: number,
      dto: UpdateStockThresholdsDto,
    ): Promise<StockItemResponseDto> {
  
      const stockItem = await this.findOne(id);
  
      this.validateThresholds(
        dto.stockMin,
        dto.stockCritical,
        dto.stockMax,
      );
  
      stockItem.stockMin = dto.stockMin;
      stockItem.stockCritical = dto.stockCritical;
      stockItem.stockMax = dto.stockMax;
  
      const saved = await this.stockItemRepository.save(stockItem);
  
      const entity = await this.findOne(saved.id);
  
      return new StockItemResponseDto(entity);
    }
  
    // ==========================
    // DELETE
    // ==========================
  
    async delete(id: number): Promise<void> {
  
      const stockItem = await this.findOne(id);
  
      if (stockItem.quantityCurrent > 0) {
        throw new BadRequestException(
          'Cannot delete stock item with quantity greater than zero',
        );
      }
  
      await this.stockItemRepository.remove(stockItem);
    }
  
    // ==========================
    // PRIVATE FIND ONE
    // ==========================
  
    private async findOne(
      id: number,
    ): Promise<StockItemEntity> {
  
      const stockItem = await this.stockItemRepository.findOne({
        where: {
          id,
        },
        relations: ['location', 'product'],
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