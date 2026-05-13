import { IsUUID } from 'class-validator';

export class MarkInboxReadQueryDto {
  @IsUUID()
  company_id!: string;
}
