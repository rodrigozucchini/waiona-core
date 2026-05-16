import { PartialType } from '@nestjs/swagger';
import { CreateProductTaxDto } from './create-product-tax.dto';

export class UpdateProductTaxDto extends PartialType(CreateProductTaxDto) {}
