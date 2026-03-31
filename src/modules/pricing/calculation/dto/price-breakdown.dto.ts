export class PriceBreakdownDto {
    unitPrice: number;
    discount: number;
    priceAfterDiscount: number;
    margin: number;
    priceAfterMargin: number;
    taxes: number;
    finalPrice: number;
    coupon: number;
    orderTotal: number;
  }