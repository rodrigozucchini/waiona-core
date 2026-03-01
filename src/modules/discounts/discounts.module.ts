import { Module } from '@nestjs/common';
import { DiscountsService } from './discount/services/discounts.service';
import { DiscountsController } from './discount/controllers/discounts.controller';
import { DiscountActionsService } from './actions/services/discount-actions.service';

@Module({
  providers: [DiscountsService, DiscountActionsService],
  controllers: [DiscountsController]
})
export class DiscountsModule {}
