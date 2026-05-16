import { PartialType } from '@nestjs/swagger';
import { CreateComboTaxDto } from './create-combo-taxes.dto';

export class UpdateComboTaxDto extends PartialType(CreateComboTaxDto) {}
