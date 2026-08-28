/**
 * @CODE-MEMORY
 * Screen:     Settings → Lương → Nhóm Chính sách (F-PAY-POLICY-GROUP-01)
 * UC:         UC-G0-02 (Tạo nhóm)
 * SRS:        SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md §UC-G0-02
 * TechSpec:   TECHSPEC_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md §3.2
 * Purpose:    DTO xác thực đầu vào khi tạo nhóm chính sách mới (tenant).
 */
import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePayPolicyGroupDto {
  /** Mã nhóm: uppercase, A-Z 0-9 gạch dưới, 2-30 ký tự. BR-G0-04: không trùng reserved. */
  @IsString()
  @IsNotEmpty({ message: 'Mã nhóm không được để trống' })
  @Matches(/^[A-Z0-9_]{2,30}$/, {
    message: 'Mã nhóm chỉ chứa A-Z, 0-9, gạch dưới, độ dài 2-30 ký tự',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @MaxLength(100)
  name_vi: string;

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
}