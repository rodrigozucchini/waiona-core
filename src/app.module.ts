import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TaxationModule } from './modules/taxation/taxation.module';
import { MarginsModule } from './modules/margins/margins.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { ProductsModule } from './modules/products/products.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { CouponsModule } from './modules/coupons/coupons.module';

@Module({
  imports: [
    // 🔥 Config global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔥 TypeORM (como tu proyecto que funcionaba)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),

        autoLoadEntities: true,
        synchronize: true,
        //dropSchema: true,
      }),
    }),

    TaxationModule,
    MarginsModule,
    DiscountsModule,
    ProductsModule,
    StocksModule,
    PricingModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}