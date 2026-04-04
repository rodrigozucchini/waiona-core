import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
    Headers,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  
  import { PaymentsService } from '../services/payments.service';
  import { CreatePaymentDto } from '../dto/create-payment.dto';
  import { PaymentResponseDto } from '../dto/payment-response.dto';
  
  @Controller('payments')
  export class PaymentsController {
  
    constructor(private readonly paymentsService: PaymentsService) {}
  
    // ==========================
    // CREATE (cliente autenticado)
    // ==========================
  
    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
      return this.paymentsService.create(dto);
    }
  
    // ==========================
    // WEBHOOK MERCADOPAGO (público — MP no manda token)
    // ==========================
  
    @Post('webhook/mercadopago')
    @HttpCode(HttpStatus.OK)
    handleMercadoPagoWebhook(
      @Body() body: any,
      @Query() query: any,
      @Headers() headers: any,
    ) {
      console.log('body:', JSON.stringify(body));
      console.log('query:', JSON.stringify(query));
      console.log('headers:', JSON.stringify(headers));
      return this.paymentsService.handleMercadoPagoWebhook(body, query);
    }
  
    // ==========================
    // GET BY ORDER
    // ==========================
  
    @UseGuards(AuthGuard('jwt'))
    @Get('order/:orderId')
    findByOrder(
      @Param('orderId', ParseIntPipe) orderId: number,
    ): Promise<PaymentResponseDto[]> {
      return this.paymentsService.findByOrder(orderId);
    }
  
    // ==========================
    // GET ONE
    // ==========================
  
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<PaymentResponseDto> {
      return this.paymentsService.findOne(id);
    }
  }