import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ProcessPaymentDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  transaction_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
