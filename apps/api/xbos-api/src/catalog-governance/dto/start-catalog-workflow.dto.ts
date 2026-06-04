import { IsOptional, IsString, Matches } from 'class-validator';

export class StartCatalogWorkflowDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,64}$/)
  batchId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  memberTenantId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  memberCompanyId!: string;

  @IsOptional()
  @IsString()
  requesterUserId?: string;
}
