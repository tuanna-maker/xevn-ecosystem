import { IsUUID } from 'class-validator';

export class MobileSelectMembershipDto {
  @IsUUID()
  employee_id!: string;
}
