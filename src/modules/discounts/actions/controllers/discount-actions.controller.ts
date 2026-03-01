import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import { DiscountActionsService } from '../services/discount-actions.service';
  
  import { CreateDiscountActionDto } from '../dto/create-discount-action.dto';
  import { UpdateDiscountActionDto } from '../dto/update-discount-action.dto';
  
  @Controller('discount-actions')
  export class DiscountActionsController {
  
    constructor(
      private discountActionsService: DiscountActionsService,
    ) {}
  
    @Get()
    getDiscountActions() {
      return this.discountActionsService.findAll();
    }
  
    @Get(':id')
    findDiscountAction(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.discountActionsService.findById(id);
    }
  
    @Post()
    createDiscountAction(
      @Body() body: CreateDiscountActionDto,
    ) {
      return this.discountActionsService.create(body);
    }
  
    @Put(':id')
    updateDiscountAction(
      @Param('id', ParseIntPipe) id: number,
      @Body() changes: UpdateDiscountActionDto,
    ) {
      return this.discountActionsService.update(id, changes);
    }
  
    @Delete(':id')
    deleteDiscountAction(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.discountActionsService.delete(id);
    }
  }