import { IsIn, IsString, Matches } from 'class-validator';

export const assetOwnerModules = ['hrm-admin', 'operations', 'finance-tax'] as const;
export type AssetOwnerModule = (typeof assetOwnerModules)[number];

export class ScopedTenantCompanyDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,64}$/)
  tenantId!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,64}$/)
  companyId!: string;
}

export class ModuleActorDto {
  @IsIn(assetOwnerModules)
  moduleCode!: AssetOwnerModule;
}
