---
name: mercadopago-payments
description: >
  MercadoPago integration patterns for this repo: preference creation, webhook handling, signature verification, and status mapping.
  Load when working with PaymentsModule, PaymentsService, MercadoPagoProvider, or the webhook endpoint.
metadata:
  author: @rodrigozucchini
  version: "1.0"
---

# MercadoPago Payments Skill

---

## When to Use

Load when the user:
- Works with `PaymentsModule`, `PaymentsService` or `MercadoPagoProvider`
- Implements or modifies the webhook endpoint
- Adds new payment providers
- Debugs payment flow issues

---

## Core Rules

1. **URLs from env only**: `FRONTEND_URL` and `MP_NOTIFICATION_URL` — never hardcoded.
2. **Webhook always returns 200**: MP retries if it doesn't get 200 — swallow errors inside the service.
3. **Verify webhook signature**: Use `x-signature` header with HMAC-SHA256 — skip only if `MP_WEBHOOK_SECRET` is empty (dev).
4. **Handle all MP statuses**: Not just `paid` — also `reverted`, `charged_back`, `payment_in_process`, `expired`.
5. **Amount as integer**: `Math.round(Number(order.total))` — MP doesn't accept decimals.

---

## Environment Variables

```properties
MP_ACCESS_TOKEN=        # server-side token — never expose to client
MP_PUBLIC_KEY=          # client-side key — safe to expose
MP_NOTIFICATION_URL=    # public URL for webhook (needs ngrok in dev)
MP_WEBHOOK_SECRET=      # from MP dashboard → Webhooks → secret
FRONTEND_URL=           # base URL for back_urls
```

---

## Payment Flow

```
POST /payments { orderId, provider }
  → validate order is PENDING
  → validate no pending payment exists
  → MercadoPagoProvider.createPreference(order)
  → save PaymentEntity { status: PENDING, externalId, checkoutUrl }
  → return { checkoutUrl } → client redirects to MP

MP processes payment
  → MP calls POST /payments/webhook/mercadopago
  → verify x-signature
  → fetch merchant order from MP API
  → map order_status to PaymentStatus
  → update PaymentEntity + OrderEntity
```

---

## MercadoPago Provider

```typescript
@Injectable()
export class MercadoPagoProvider {

  private preference: Preference;
  private client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.get('MP_ACCESS_TOKEN'),
    });
    this.preference = new Preference(this.client);
  }

  getClient(): MercadoPagoConfig { return this.client; }

  async createPreference(order: OrderEntity): Promise<{ id: string; checkoutUrl: string }> {

    // 🔥 URLs siempre desde env
    const frontendUrl     = this.configService.get('FRONTEND_URL');
    const notificationUrl = this.configService.get('MP_NOTIFICATION_URL');

    const response = await this.preference.create({
      body: {
        items: [{
          id:         String(order.id),
          title:      `Orden #${order.id}`,
          quantity:   1,
          unit_price: Math.round(Number(order.total)), // 🔥 entero
          currency_id: 'ARS',
        }],
        external_reference: String(order.id),
        back_urls: {
          success: `${frontendUrl}/payment/success`,
          failure: `${frontendUrl}/payment/failure`,
          pending: `${frontendUrl}/payment/pending`,
        },
        auto_return:      'approved',
        notification_url: notificationUrl,
      },
    });

    return { id: response.id!, checkoutUrl: response.init_point! };
  }
}
```

---

## Webhook Handler

```typescript
// Controller — siempre 200
@Post('webhook/mercadopago')
@HttpCode(HttpStatus.OK)
async handleMercadoPagoWebhook(
  @Body() body: any,
  @Query() query: any,
  @Headers() headers: Record<string, string>,
) {
  this.verifyMercadoPagoSignature(headers, query); // lanza 401 si firma inválida
  await this.paymentsService.handleMercadoPagoWebhook(body, query);
  return { received: true };
}

// Verificación de firma
private verifyMercadoPagoSignature(headers, query): void {
  const secret = this.configService.get('MP_WEBHOOK_SECRET');
  if (!secret) return; // skip en dev

  const xSignature  = headers['x-signature'];
  const xRequestId  = headers['x-request-id'];
  if (!xSignature || !xRequestId) throw new UnauthorizedException('Missing MP signature headers');

  const ts     = xSignature.split(',').find(p => p.startsWith('ts='))?.split('=')[1];
  const v1     = xSignature.split(',').find(p => p.startsWith('v1='))?.split('=')[1];
  const dataId = query['data.id'] ?? query['id'] ?? '';

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  if (expected !== v1) throw new UnauthorizedException('Invalid MP signature');
}
```

---

## MP Status Mapping

```typescript
// Service webhook handler
const mpStatus = mpOrder.order_status;

if (mpStatus === 'paid') {
  payment.status       = PaymentStatus.APPROVED;
  order.status         = OrderStatus.CONFIRMED;
} else if (mpStatus === 'reverted' || mpStatus === 'charged_back') {
  payment.status       = PaymentStatus.CANCELLED;
  order.status         = OrderStatus.CANCELLED;
} else if (mpStatus === 'payment_required' || mpStatus === 'payment_in_process') {
  payment.status = PaymentStatus.PENDING;
} else {
  // expired, etc.
  payment.status       = PaymentStatus.REJECTED;
  order.status         = OrderStatus.CANCELLED;
}
```

| MP `order_status` | `PaymentStatus` | `OrderStatus` |
|---|---|---|
| `paid` | `APPROVED` | `CONFIRMED` |
| `reverted` / `charged_back` | `CANCELLED` | `CANCELLED` |
| `payment_required` / `payment_in_process` | `PENDING` | sin cambio |
| `expired` / otros | `REJECTED` | `CANCELLED` |

---

## Common Mistakes

- **Hardcoding ngrok URL**: MP callbacks break on server restart. Always use `MP_NOTIFICATION_URL` from env.
- **Not returning 200 on webhook error**: MP retries — errors must be swallowed in a try/catch.
- **Skipping signature verification in prod**: Any request to `/webhook/mercadopago` could fake payment approval.
- **Decimal amount**: MP rejects non-integer prices — always `Math.round()`.
- **Only handling `paid` status**: Reverts and chargebacks leave orders stuck in CONFIRMED.
- **Using `MP_ACCESS_TOKEN` in the client**: It's a server-side secret — never expose in frontend.