import { HttpStatus, Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { ApiException } from '../common/api.exception';

@Injectable()
export class HrmAdminService {
  private readonly supabaseUrl = process.env.SUPABASE_URL ?? '';
  private readonly supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';
  private readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  private createAdminClient() {
    return createClient(this.supabaseUrl, this.serviceRoleKey);
  }

  private createAnonClient(authorization: string) {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
  }

  private async assertPlatformAdmin(authorization: string): Promise<string> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const token = authorization.replace('Bearer ', '');
    const anonClient = this.createAnonClient(authorization);
    const { data, error } = await anonClient.auth.getClaims(token);
    if (error || !data?.claims?.sub) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const callerId = data.claims.sub as string;
    const { data: isAdmin } = await anonClient.rpc('is_platform_admin', { _user_id: callerId });
    if (!isAdmin) {
      throw new ApiException('HRM-AUTH-002', 'Not a platform admin', HttpStatus.FORBIDDEN);
    }
    return callerId;
  }

  async createPlatformAdmin(authorization: string | undefined, payload: CreatePlatformAdminDto) {
    await this.assertPlatformAdmin(authorization ?? '');
    const adminClient = this.createAdminClient();
    const { data: userData, error: createErr } = await adminClient.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: { full_name: payload.full_name || payload.email.split('@')[0] },
    });
    if (createErr || !userData.user) {
      throw new ApiException(
        'HRM-USER-001',
        createErr?.message ?? 'Could not create platform admin',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { error: insertError } = await adminClient.from('platform_admins').insert({
      user_id: userData.user.id,
      email: payload.email,
      granted_by: 'Platform Admin',
    });
    if (insertError) {
      throw new ApiException('HRM-USER-001', insertError.message, HttpStatus.BAD_REQUEST);
    }
    return { success: true, user_id: userData.user.id };
  }

  async createCompanyAdmin(authorization: string | undefined, payload: CreateCompanyAdminDto) {
    await this.assertPlatformAdmin(authorization ?? '');
    const adminClient = this.createAdminClient();
    const { data: users } = await adminClient.auth.admin.listUsers();
    const userRows = (users?.users ?? []) as Array<{ id: string; email?: string }>;
    const existingUser = userRows.find((item) => item.email === payload.email);
    let userId = existingUser?.id;
    if (!userId) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: { full_name: payload.full_name || payload.email.split('@')[0] },
      });
      if (error || !data.user) {
        throw new ApiException(
          'HRM-USER-001',
          error?.message ?? 'Could not create company admin user',
          HttpStatus.BAD_REQUEST,
        );
      }
      userId = data.user.id;
    }
    const { error: upsertError } = await adminClient.from('user_company_memberships').upsert({
      user_id: userId,
      company_id: payload.company_id,
      role: payload.role ?? 'admin',
      email: payload.email,
      full_name: payload.full_name || payload.email.split('@')[0],
      status: 'active',
      is_primary: false,
      invited_by: 'Platform Admin',
    });
    if (upsertError) {
      throw new ApiException('HRM-USER-001', upsertError.message, HttpStatus.BAD_REQUEST);
    }
    return { success: true, user_id: userId, is_existing_user: Boolean(existingUser) };
  }

  async inviteEmployees(authorization: string | undefined, payload: InviteEmployeesDto) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const token = authorization.replace('Bearer ', '');
    const isServiceRole = token === this.serviceRoleKey;
    if (!isServiceRole) {
      await this.assertPlatformAdmin(authorization);
    }
    const adminClient = this.createAdminClient();
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    for (const employee of payload.employees) {
      try {
        if (!employee.email) {
          results.push({ email: 'N/A', success: false, error: 'No email provided' });
          continue;
        }
        const { data } = await adminClient.auth.admin.createUser({
          email: employee.email,
          password: '12345678',
          email_confirm: true,
          user_metadata: { full_name: employee.full_name || employee.email.split('@')[0] },
        });
        const userId = data.user?.id;
        if (!userId) {
          results.push({ email: employee.email, success: false, error: 'Cannot create user' });
          continue;
        }
        const { error: membershipError } = await adminClient.from('user_company_memberships').upsert({
          user_id: userId,
          company_id: payload.company_id,
          role: 'employee',
          email: employee.email,
          full_name: employee.full_name || employee.email.split('@')[0],
          employee_id: employee.employee_id ?? null,
          status: 'active',
          is_primary: false,
          invited_by: 'Email Invite',
        });
        if (membershipError) {
          results.push({ email: employee.email, success: false, error: membershipError.message });
          continue;
        }
        results.push({ email: employee.email, success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({ email: employee.email, success: false, error: message });
      }
    }
    const invited = results.filter((item) => item.success).length;
    return { success: true, total: payload.employees.length, invited, failed: payload.employees.length - invited, results };
  }

  async resetUserPassword(authorization: string | undefined, payload: ResetUserPasswordDto) {
    await this.assertPlatformAdmin(authorization ?? '');
    const adminClient = this.createAdminClient();
    const updateData: { password?: string; email?: string } = {};
    if (payload.new_password) {
      updateData.password = payload.new_password;
    }
    if (payload.new_email) {
      updateData.email = payload.new_email;
    }
    const { error: updateError } = await adminClient.auth.admin.updateUserById(payload.user_id, updateData);
    if (updateError) {
      throw new ApiException('HRM-USER-001', updateError.message, HttpStatus.BAD_REQUEST);
    }
    if (payload.new_email) {
      const { error: profileError } = await adminClient
        .from('profiles')
        .update({ email: payload.new_email })
        .eq('user_id', payload.user_id);
      if (profileError) {
        throw new ApiException('HRM-USER-001', profileError.message, HttpStatus.BAD_REQUEST);
      }
      const { error: membershipEmailError } = await adminClient
        .from('user_company_memberships')
        .update({ email: payload.new_email })
        .eq('user_id', payload.user_id);
      if (membershipEmailError) {
        throw new ApiException('HRM-USER-001', membershipEmailError.message, HttpStatus.BAD_REQUEST);
      }
      const { error: platformAdminEmailError } = await adminClient
        .from('platform_admins')
        .update({ email: payload.new_email })
        .eq('user_id', payload.user_id);
      if (platformAdminEmailError) {
        throw new ApiException('HRM-USER-001', platformAdminEmailError.message, HttpStatus.BAD_REQUEST);
      }
    }
    return { success: true };
  }
}
