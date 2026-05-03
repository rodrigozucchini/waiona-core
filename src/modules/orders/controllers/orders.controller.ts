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
  ForbiddenException,
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
  // GET ALL — solo admin
  // ==========================

  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // ==========================
  // GET BY USER — 🔥 ownership check
  // antes de GET :id para evitar conflicto de rutas
  // ==========================

  @Get('user/:userId')
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ) {
    const payload = req.user as { sub: number; role: RoleType };

    // cliente solo puede ver sus propias órdenes
    if (payload.role === RoleType.CLIENT && payload.sub !== userId) {
      throw new ForbiddenException('Access denied');
    }

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
  // UPDATE STATUS — solo admin
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