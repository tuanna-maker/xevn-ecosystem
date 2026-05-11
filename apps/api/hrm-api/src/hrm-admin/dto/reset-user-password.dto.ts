import { IsEmail, IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';

export class ResetUserPasswordDto {
  @IsUUID()
  user_id!: string;

  @ValidateIf((obj: ResetUserPasswordDto) => !obj.new_email)
  @IsOptional()
  @IsString()
  @MinLength(8)
  new_password?: string;

  @ValidateIf((obj: ResetUserPasswordDto) => !obj.new_password)
  @IsOptional()
  @IsEmail()
  new_email?: string;
}
