import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class MobileLoginDto {
  @IsString()
  identifier!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password!: string;
}
