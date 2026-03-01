import { Module } from '@nestjs/common';
import { DiscountsService } from './discount/services/discounts.service';
import { DiscountsController } from './discount/controllers/discounts.controller';

@Module({
  providers: [DiscountsService],
  controllers: [DiscountsController]
})
export class DiscountsModule {}
