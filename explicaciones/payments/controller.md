```ts
@Controller({ version: '1', path: 'payments' })
export class PaymentsController {

  // ==========================
  // POST /v1/payments/webhook/mercadopago
  // ==========================

  @SkipThrottle()          // MP puede enviar muchas notificaciones en poco tiempo
  @Post('webhook/mercadopago')
  @HttpCode(HttpStatus.OK) // NestJS default es 201 en POST — forzar 200
  async handleMercadoPagoWebhook(@Body() body, @Query() query, @Headers() headers) {

    // La verificación de firma está dentro de try/catch DELIBERADAMENTE.
    // Si lanzara una excepción sin atrapar, NestJS devolvería 401 y MP
    // reintentaría la notificación indefinidamente — degradando el servicio.
    // Con el try/catch, una firma inválida retorna 200 y descarta la notificación
    // sin llamar al service. Esto cumple el requisito de MP: "siempre responder 200".
    try {
      this.verifyMercadoPagoSignature(headers, query);
    } catch {
      return { received: true };
    }

    // El service también tiene su propio try/catch que swallow errores internos —
    // dos capas de protección para garantizar que el 200 nunca se rompa.
    await this.paymentsService.handleMercadoPagoWebhook(body, query);
    return { received: true };
  }

  // ==========================
  // PRIVATE — verifyMercadoPagoSignature
  // ==========================

  private verifyMercadoPagoSignature(headers, query): void {
    const secret = this.configService.get('MP_WEBHOOK_SECRET', { infer: true });

    // En dev, MP_WEBHOOK_SECRET está vacío — se omite la verificación.
    // En producción debe estar configurado siempre.
    if (!secret) return;

    const xSignature = headers['x-signature'];
    const xRequestId = headers['x-request-id'];

    if (!xSignature || !xRequestId) {
      throw new UnauthorizedException('Faltan los headers de firma de MercadoPago');
    }

    // x-signature tiene formato: ts=<timestamp>,v1=<hash>
    // ts y v1 se parsean y usan para reconstruir el manifest firmado.
    const parts = xSignature.split(',');
    const tsPart = parts.find((p) => p.startsWith('ts='));
    const v1Part = parts.find((p) => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      throw new UnauthorizedException('Formato de firma de MercadoPago inválido');
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];

    // MP puede enviar el id como query['data.id'] (notif. tipo IPN) o query['id'] (tipo webhook)
    const dataId = query['data.id'] ?? query['id'] ?? '';

    // Manifest según docs de MP: id:<dataId>;request-id:<xRequestId>;ts:<ts>;
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = createHmac('sha256', secret).update(manifest).digest('hex');

    if (expected !== v1) {
      throw new UnauthorizedException('Firma de MercadoPago inválida');
    }
  }
}
```
