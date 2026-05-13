import { IsUUID } from 'class-validator';

export class MarkInboxReadDto {
  @IsUUID()
  viewer_employee_id!: string;
}
