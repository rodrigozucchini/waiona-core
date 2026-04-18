import { PartialType } from '@nestjs/mapped-types';
import { CreateMarginDto } from './create-margin.dto';

export class UpdateMarginDto extends PartialType(CreateMarginDto) {}