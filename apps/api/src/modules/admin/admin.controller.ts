import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

class CreateAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}

class InviteEmployeeDto extends CreateAdminDto {
  @IsString()
  roleCode!: string;
}

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @Post('platform-admins')
  createPlatformAdmin(@Body() body: CreateAdminDto) {
    return {
      status: 'accepted',
      edgeFunctionReplacement: 'create-platform-admin',
      payload: body,
    };
  }

  @Post('company-admins')
  createCompanyAdmin(@Body() body: CreateAdminDto) {
    return {
      status: 'accepted',
      edgeFunctionReplacement: 'create-company-admin',
      payload: body,
    };
  }

  @Post('employees/invitations')
  inviteEmployee(@Body() body: InviteEmployeeDto) {
    return {
      status: 'accepted',
      edgeFunctionReplacement: 'invite-employee',
      payload: body,
    };
  }
}
