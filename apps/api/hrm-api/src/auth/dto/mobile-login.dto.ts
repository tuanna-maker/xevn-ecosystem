import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class MobileLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password!: string;
}
