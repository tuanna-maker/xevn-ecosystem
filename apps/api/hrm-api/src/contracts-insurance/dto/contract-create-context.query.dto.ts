import { IsString, MaxLength } from 'class-validator';

/** F-CORE-CTR-CREATE-CTX-01 — wizard Step 1 display bundle (employee id from path). */
export class ContractCreateContextQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}
