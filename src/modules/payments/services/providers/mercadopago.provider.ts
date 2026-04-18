import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { Env } from 'src/env.model';
import { OrderEntity } from 'src/modules/orders/entities/order.entity';

@Injectable()
export class MercadoPagoProvider {

  private readonly client: MercadoPagoConfig;
  private readonly preference: Preference;

  constructor(private readonly configService: ConfigService<Env>) {
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.get('MP_ACCESS_TOKEN', { infer: true })!,
    });

    this.preference = new Preference(this.client);
  }

  // 🔥 exponemos el cliente para usarlo en el webhook handler
  getClient(): MercadoPagoConfig {
    return this.client;
  }

  async createPreference(order: OrderEntity): Promise<{ id: string; checkoutUrl: string }> {

    const response = await this.preference.create({
      body: {
        items: [
          {
            id: String(order.id),
            title: `Orden #${order.id}`,
            quantity: 1,
            unit_price: Math.round(Number(order.total)),
            currency_id: 'ARS',
          },
        ],
        external_reference: String(order.id),
        back_urls: {
          success: 'https://erinn-fiercer-caleb.ngrok-free.dev/payment/success',
          failure: 'https://erinn-fiercer-caleb.ngrok-free.dev/payment/failure',
          pending: 'https://erinn-fiercer-caleb.ngrok-free.dev/payment/pending',
        },
        auto_return: 'approved',
        notification_url: 'https://erinn-fiercer-caleb.ngrok-free.dev/payments/webhook/mercadopago',
      },
    });

    return {
      id: response.id!,
      checkoutUrl: response.init_point!,
    };
  }
}