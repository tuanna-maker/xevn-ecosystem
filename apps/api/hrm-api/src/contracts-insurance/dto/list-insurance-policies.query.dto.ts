import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ListContractsQueryDto } from './list-contracts.query.dto';

export class ListInsurancePoliciesQueryDto extends ListContractsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  declare status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
