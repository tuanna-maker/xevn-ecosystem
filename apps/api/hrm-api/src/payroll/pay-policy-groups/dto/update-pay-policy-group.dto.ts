/**
 * @CODE-MEMORY
 * UC: UC-G0-03 (Sửa nhóm), UC-G0-04 (Toggle active)
 * SRS: SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md §UC-G0-03
 * BR-G0-08: code là immutable sau khi tạo — không có trong UpdateDto.
 */
import { IsString, MaxLength, IsOptional, IsInt, Min, IsBoolean, Matches } from 'class-validator';

export class UpdatePayPolicyGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_vi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Màu phải là mã hex hợp lệ #RRGGBB' })
  color_hex?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sort_order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}