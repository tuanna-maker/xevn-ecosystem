import { IsString, MinLength } from 'class-validator';

/** API_CONTRACT §8.2 — body for POST /api/xbos/auth/select-membership */
export class SelectMembershipDto {
  @IsString()
  @MinLength(1)
  tenantId!: string;
}
