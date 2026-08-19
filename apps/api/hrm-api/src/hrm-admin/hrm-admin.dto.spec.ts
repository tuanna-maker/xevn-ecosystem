/**
 * BE-HRM-ADMIN-DTO-01 — G-ADM-DTO-01 plane consistency
 * company_id TEXT (slug) vs user_id UUID — class-validator regression.
 */
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

describe('HrmAdmin DTO plane (G-ADM-DTO-01)', () => {
  describe('CreateCompanyAdminDto.company_id', () => {
    it('accepts Plane B slug holding', async () => {
      const dto = plainToInstance(CreateCompanyAdminDto, {
        email: 'admin@xe.vn',
        password: 'secret123',
        company_id: 'holding',
        role: 'admin',
      });
      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('accepts member slug and UUID-as-text', async () => {
      for (const company_id of ['trsport', '78b8a663-f5e5-4f4d-a020-b8f950ec2037']) {
        const dto = plainToInstance(CreateCompanyAdminDto, {
          email: 'admin@xe.vn',
          password: 'secret123',
          company_id,
        });
        await expect(validate(dto)).resolves.toHaveLength(0);
      }
    });

    it('rejects empty company_id', async () => {
      const dto = plainToInstance(CreateCompanyAdminDto, {
        email: 'admin@xe.vn',
        password: 'secret123',
        company_id: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'company_id')).toBe(true);
    });
  });

  describe('InviteEmployeesDto.company_id', () => {
    it('accepts slug holding with non-empty employees', async () => {
      const dto = plainToInstance(InviteEmployeesDto, {
        company_id: 'holding',
        employees: [{ email: 'nv@xe.vn', full_name: 'NV' }],
      });
      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('rejects empty employees array (FR-04 #3)', async () => {
      const dto = plainToInstance(InviteEmployeesDto, {
        company_id: 'holding',
        employees: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'employees')).toBe(true);
    });

    it('rejects non-UUID employee_id when provided', async () => {
      const dto = plainToInstance(InviteEmployeesDto, {
        company_id: 'holding',
        employees: [{ email: 'nv@xe.vn', employee_id: 'not-a-uuid' }],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ResetUserPasswordDto.user_id', () => {
    it('requires UUID user_id (HRM profiles plane — not Auth email TEXT)', async () => {
      const ok = plainToInstance(ResetUserPasswordDto, {
        user_id: '11111111-1111-4111-8111-111111111111',
        new_password: 'newpass123',
      });
      await expect(validate(ok)).resolves.toHaveLength(0);

      const bad = plainToInstance(ResetUserPasswordDto, {
        user_id: 'ceo@xe.vn',
        new_password: 'newpass123',
      });
      const errors = await validate(bad);
      expect(errors.some((e) => e.property === 'user_id')).toBe(true);
    });
  });
});
