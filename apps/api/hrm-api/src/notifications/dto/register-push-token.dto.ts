import { IsIn, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @IsUUID()
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  /** `expo` = Expo push token; `fcm` = native FCM registration token. */
  @IsIn(['expo', 'fcm'])
  platform!: 'expo' | 'fcm';

  @IsString()
  @MinLength(8)
  token!: string;
}
