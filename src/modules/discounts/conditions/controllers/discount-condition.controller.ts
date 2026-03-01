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
  
  import { DiscountConditionService } from '../services/discount-condition.service';
  
  import { CreateDiscountConditionDto } from '../dto/create-discount-condition.dto';
  import { UpdateDiscountConditionDto } from '../dto/update-discount-condition.dto';
  
  @Controller('discount-conditions')
  export class DiscountConditionController {
  
    constructor(
      private discountConditionService: DiscountConditionService,
    ) {}
  
    @Get()
    getDiscountConditions() {
      return this.discountConditionService.findAll();
    }
  
    @Get(':id')
    findDiscountCondition(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.discountConditionService.findById(id);
    }
  
    @Post()
    createDiscountCondition(
      @Body() body: CreateDiscountConditionDto,
    ) {
      return this.discountConditionService.create(body);
    }
  
    @Put(':id')
    updateDiscountCondition(
      @Param('id', ParseIntPipe) id: number,
      @Body() changes: UpdateDiscountConditionDto,
    ) {
      return this.discountConditionService.update(id, changes);
    }
  
    @Delete(':id')
    deleteDiscountCondition(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.discountConditionService.delete(id);
    }
  }