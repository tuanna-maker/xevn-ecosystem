import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class ListAttendanceUpdateRequestsQueryDto {
  @IsUUID()
  company_id!: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';
}
