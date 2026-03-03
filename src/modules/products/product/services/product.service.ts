import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { ProductEntity } from '../entities/product.entity';
  import { CreateProductDto } from '../dto/create-product.dto';
  import { UpdateProductDto } from '../dto/update-product.dto';
  import { ProductResponseDto } from '../dto/product-response.dto';
  
  @Injectable()
  export class ProductService {
  
    constructor(
      @InjectRepository(ProductEntity)
      private readonly productRepository: Repository<ProductEntity>,
    ) {}
  
    // ==========================
    // GET ALL
    // ==========================
  
    async findAll(): Promise<ProductResponseDto[]> {
  
      const products = await this.productRepository.find({
        where: {
          isDeleted: false,
        },
        order: {
          name: 'ASC',
        },
      });
  
      return products.map(
        product => new ProductResponseDto(product),
      );
    }
  
    // ==========================
    // GET BY ID
    // ==========================
  
    async findById(id: number): Promise<ProductResponseDto> {
  
      const product = await this.findOne(id);
  
      return new ProductResponseDto(product);
    }
  
    // ==========================
    // CREATE
    // ==========================
  
    async create(
      dto: CreateProductDto,
    ): Promise<ProductResponseDto> {
  
      // 🔥 Validar SKU único
      const existingSku = await this.productRepository.findOne({
        where: {
          sku: dto.sku,
        },
      });
  
      if (existingSku) {
        throw new BadRequestException(
          `Product with SKU ${dto.sku} already exists`,
        );
      }
  
      const product = this.productRepository.create({
        ...dto,
        sku: dto.sku.toUpperCase(), // buena práctica
        isActive: dto.isActive ?? true,
      });
  
      const saved = await this.productRepository.save(product);
  
      return new ProductResponseDto(saved);
    }
  
    // ==========================
    // UPDATE
    // ==========================
  
    async update(
      id: number,
      changes: UpdateProductDto,
    ): Promise<ProductResponseDto> {
  
      const product = await this.findOne(id);
  
      // 🔥 Validar SKU si se quiere cambiar
      if (changes.sku && changes.sku !== product.sku) {
  
        const existingSku = await this.productRepository.findOne({
          where: {
            sku: changes.sku,
          },
        });
  
        if (existingSku) {
          throw new BadRequestException(
            `Product with SKU ${changes.sku} already exists`,
          );
        }
  
        changes.sku = changes.sku.toUpperCase();
      }
  
      const merged = this.productRepository.merge(product, changes);
  
      const saved = await this.productRepository.save(merged);
  
      return new ProductResponseDto(saved);
    }
  
    // ==========================
    // SOFT DELETE
    // ==========================
  
    async delete(id: number): Promise<void> {
  
      const product = await this.findOne(id);
  
      product.isDeleted = true;
  
      await this.productRepository.save(product);
    }
  
    // ==========================
    // PRIVATE FIND ONE
    // ==========================
  
    private async findOne(id: number): Promise<ProductEntity> {
  
      const product = await this.productRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
      });
  
      if (!product) {
        throw new NotFoundException(
          `Product with id ${id} not found`,
        );
      }
  
      return product;
    }
  }