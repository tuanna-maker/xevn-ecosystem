import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { assetOwnerModules } from './asset-common.dto';
import type { AssetOwnerModule } from './asset-common.dto';

class UpdateAssetFinancialProfileDto {
  @IsOptional()
  @IsString()
  depreciationMethod?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1200)
  usefulLifeMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  acquisitionCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  residualValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  monthlyLoanInterest?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  monthlyPrincipalPayment?: number;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  assetName?: string;

  @IsOptional()
  @IsString()
  assetType?: string;

  @IsOptional()
  @Matches(/^[A-Za-z0-9_:-]{2,64}$/)
  assetCode?: string;

  @IsOptional()
  @Matches(/^[A-HJ-NPR-Z0-9]{6,32}$/)
  vin?: string;

  @IsOptional()
  @Matches(/^[A-Za-z0-9-]{4,64}$/)
  chassisNo?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsIn(assetOwnerModules)
  ownerModule?: AssetOwnerModule;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAssetFinancialProfileDto)
  financialProfile?: UpdateAssetFinancialProfileDto;

  @IsOptional()
  @IsString()
  actorId?: string;

  @IsOptional()
  @IsUUID()
  requestId?: string;
}
