import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublishPayslipDto {
  @IsOptional()
  @IsBoolean()
  acknowledge_preview?: boolean;

  @IsOptional()
  @IsString()
  company_id?: string;
}
