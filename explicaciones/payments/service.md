```ts
@Injectable()
export class PaymentsService {

  // ==========================
  // create — crear pago para una orden
  // ==========================

  async create(userId, role, dto): Promise<PaymentResponseDto> {
    return this.dataSource.transaction(async (manager) => {

      // Patrón doble findOne: primero con lock (sin relaciones para evitar error
      // de PostgreSQL "FOR UPDATE on nullable outer join"), luego con relaciones.
      // El lock garantiza que dos requests concurrentes no creen dos pagos para la misma orden.
      const locked = await manager.findOne(OrderEntity, {
        where: { id: dto.orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked) throw new NotFoundException('Orden no encontrada');

      const order = await manager.findOne(OrderEntity, { where: { id: dto.orderId } });
      if (!order) throw new NotFoundException('Orden no encontrada');

      if (role === RoleType.CLIENT && order.userId !== userId) {
        throw new ForbiddenException('Acceso denegado');
      }

      // Solo órdenes en PENDING son pagables — si ya fue CONFIRMED o CANCELLED,
      // el cliente no debe poder crear otro pago.
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('La orden no está en estado pagable');
      }

      // Idempotencia: si ya existe un pago PENDING para esta orden (ej: doble click),
      // se rechaza. El primer pago ya es suficiente.
      const existingPayment = await manager.findOne(PaymentEntity, {
        where: { orderId: dto.orderId, status: PaymentStatus.PENDING },
      });
      if (existingPayment) {
        throw new BadRequestException('La orden ya tiene un pago pendiente');
      }

      // La preferencia de MP devuelve id (externalId) y checkoutUrl.
      // El cliente usa checkoutUrl para redirigir al checkout de MP.
      if (dto.provider === PaymentProvider.MERCADOPAGO) {
        const preference = await this.mercadoPagoProvider.createPreference(order);
        externalId = preference.id;
        checkoutUrl = preference.checkoutUrl;
      }

      // ...
    });
  }

  // ==========================
  // handleMercadoPagoWebhook — procesar notificación de MP
  // ==========================

  async handleMercadoPagoWebhook(body, query): Promise<void> {
    const topic = query.topic ?? body.type;
    const id = query.id ?? body.data?.id;

    // Notificaciones sin id o con topic desconocido se ignoran silenciosamente.
    if (!id) return;
    if (topic !== 'payment' && topic !== 'merchant_order') return;

    try {
      let externalReference, mpStatus;

      if (topic === 'payment') {
        // Para topic=payment, consultamos la Payment API de MP y normalizamos
        // su status al vocabulario interno usado por el mapeo de estados.
        const paymentData = await mpPayment.get({ id: String(id) });
        externalReference = paymentData.external_reference;
        const s = paymentData.status;
        if (s === 'approved') mpStatus = 'paid';
        else if (s === 'refunded' || s === 'charged_back') mpStatus = 'reverted';
        else if (s === 'in_process' || s === 'pending') mpStatus = 'payment_in_process';
        else mpStatus = 'expired';

      } else {
        // Para topic=merchant_order, el status viene directo como order_status
        // ('paid', 'refunded', 'payment_required', etc.) — sin normalización adicional.
        const mpOrder = await merchantOrder.get({ merchantOrderId: Number(id) });
        externalReference = mpOrder.external_reference;
        mpStatus = mpOrder.order_status;
      }

      if (!externalReference) return;

      await this.dataSource.transaction(async (manager) => {
        // Lock pesimista en payment Y order — evita que dos notificaciones simultáneas
        // del mismo pago generen estados inconsistentes (race condition entre dos webhooks).
        const payment = await manager.findOne(PaymentEntity, {
          where: { orderId: Number(externalReference) },
          lock: { mode: 'pessimistic_write' },
        });
        if (!payment) return;

        const order = await manager.findOne(OrderEntity, {
          where: { id: payment.orderId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!order) return;

        const cancellable =
          order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;

        if (mpStatus === 'paid') {
          payment.status = PaymentStatus.APPROVED;
          // Idempotente: si ya estaba CONFIRMED, no se vuelve a confirmar.
          if (order.status === OrderStatus.PENDING) {
            order.status = OrderStatus.CONFIRMED;
            orderChanged = true;
          }
        } else if (
          mpStatus === 'reverted' ||
          mpStatus === 'refunded' // merchant_order devuelve 'refunded'; payment lo normaliza a 'reverted'
        ) {
          payment.status = PaymentStatus.CANCELLED;
          if (cancellable) { order.status = OrderStatus.CANCELLED; orderChanged = true; }

        } else if (mpStatus === 'payment_required' || mpStatus === 'payment_in_process') {
          payment.status = PaymentStatus.PENDING;

        } else {
          // expired u otros → REJECTED y cancelar la orden si todavía es posible
          payment.status = PaymentStatus.REJECTED;
          if (cancellable) { order.status = OrderStatus.CANCELLED; orderChanged = true; }
        }

        if (orderChanged) {
          // releaseStockForOrder dentro de la MISMA transacción — o todo se revierte
          // junto o nada. Garantiza que stock y estado de orden son siempre consistentes.
          await this.ordersService.releaseStockForOrder(payment.orderId, manager);
          await manager.save(order);
        }
        await manager.save(payment);
      });

    } catch {
      // Swallow deliberado — MP requiere siempre 200.
      // Los errores aquí son transitorios (DB caída, MP API lenta, etc.)
      // y MP reintentará automáticamente en los próximos minutos.
    }
  }
}
```
