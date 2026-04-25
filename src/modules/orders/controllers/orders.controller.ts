import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleType } from 'src/common/enums/role-type.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {

  constructor(private readonly ordersService: OrdersService) {}

  // ==========================
  // CREATE (cliente)
  // ==========================

  @Post()
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const payload = req.user as { sub: number };
    return this.ordersService.create(payload.sub, dto);
  }

  // ==========================
  // GET ALL (admin)
  // ==========================

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // ==========================
  // GET BY USER
  // 🔥 antes de GET :id para evitar que 'user' sea tratado como id
  // ==========================

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ordersService.findByUser(userId);
  }

  // ==========================
  // GET ONE
  // ==========================

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // ==========================
  // UPDATE STATUS (solo admin)
  // ==========================

  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}