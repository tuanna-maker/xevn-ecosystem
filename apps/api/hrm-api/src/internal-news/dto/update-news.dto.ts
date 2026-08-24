import { PartialType } from '@nestjs/mapped-types';
import { CreateInternalNewsDto } from './create-news.dto';

export class UpdateInternalNewsDto extends PartialType(CreateInternalNewsDto) {}
