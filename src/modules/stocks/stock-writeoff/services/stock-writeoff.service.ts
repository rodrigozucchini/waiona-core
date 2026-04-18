import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { StockWriteOffEntity } from '../entities/stock-writeoff.entity';
  import { UpdateStockWriteOffDto } from '../dto/update-stock-writeoff.dto';
  import { StockWriteOffResponseDto } from '../dto/stock-writeoff-response.dto';
  
  @Injectable()
  export class StockWriteOffService {
  
    constructor(
      @InjectRepository(StockWriteOffEntity)
      private readonly stockWriteOffRepository: Repository<StockWriteOffEntity>,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    async findAll(): Promise<StockWriteOffResponseDto[]> {
      const writeOffs = await this.stockWriteOffRepository.find({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
  
      return writeOffs.map((w) => new StockWriteOffResponseDto(w));
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    async findById(id: number): Promise<StockWriteOffResponseDto> {
      const writeOff = await this.findEntity(id);
      return new StockWriteOffResponseDto(writeOff);
    }
  
    // ==========================
    // GET BY STOCK ITEM
    // ==========================
  
    async findByStockItemId(stockItemId: number): Promise<StockWriteOffResponseDto[]> {
      const writeOffs = await this.stockWriteOffRepository.find({
        where: { stockItemId, isDeleted: false },
        order: { createdAt: 'DESC' },
      });
  
      return writeOffs.map((w) => new StockWriteOffResponseDto(w));
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    async update(
      id: number,
      dto: UpdateStockWriteOffDto,
    ): Promise<StockWriteOffResponseDto> {
      const writeOff = await this.findEntity(id);
  
      writeOff.reason = dto.reason ?? writeOff.reason;
      writeOff.description = dto.description ?? writeOff.description;
      writeOff.attachments = dto.attachments ?? writeOff.attachments;
  
      const saved = await this.stockWriteOffRepository.save(writeOff);
  
      return new StockWriteOffResponseDto(saved);
    }
  
    // ==========================
    // PRIVATE HELPERS
    // ==========================
  
    private async findEntity(id: number): Promise<StockWriteOffEntity> {
      const writeOff = await this.stockWriteOffRepository.findOne({
        where: { id, isDeleted: false },
      });
  
      if (!writeOff) {
        throw new NotFoundException(`StockWriteOff with id ${id} not found`);
      }
  
      return writeOff;
    }
  }