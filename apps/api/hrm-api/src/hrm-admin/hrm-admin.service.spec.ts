import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { generateInviteTempPassword, HrmAdminService } from './hrm-admin.service';

describe('HrmAdminService', () => {
  let service: HrmAdminService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      withTransaction: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [], rowCount: 0 } as never);
    db.withTransaction.mockImplementation(async (fn) => fn(db.query.bind(db)));
    service = new HrmAdminService(db);
  });

  it('allows group_ceo JWT without platform_admins row', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.profiles')) {
        return { rows: [], rowCount: 0 } as never;
      }
      if (sql.includes('INSERT INTO public.profiles')) {
        return { rows: [], rowCount: 1 } as never;
      }
      if (sql.includes('INSERT INTO public.platform_admins')) {
        return { rows: [], rowCount: 1 } as never;
      }
      return { rows: [], rowCount: 0 } as never;
    });

    const result = await service.createPlatformAdmin(`Bearer ${token}`, {
      email: 'admin@xe.vn',
      password: 'secret1234',
      full_name: 'Admin',
    });

    expect(result.success).toBe(true);
    expect(result.user_id).toBeDefined();
    expect(db.query).not.toHaveBeenCalledWith(expect.stringContaining('platform_admins WHERE'), expect.anything());
  });

  it('ensureAdminSchema creates admin_audit_logs (G-ADM-01)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('UPDATE public.profiles SET password_hash')) {
        return { rows: [], rowCount: 1 } as never;
      }
      if (sql.includes('INSERT INTO public.admin_audit_logs')) {
        return { rows: [], rowCount: 1 } as never;
      }
      return { rows: [], rowCount: 0 } as never;
    });

    await service.resetUserPassword(`Bearer ${token}`, {
      user_id: '11111111-1111-4111-8111-111111111111',
      new_password: 'newpass123',
    });

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS public.admin_audit_logs'),
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ix_admin_audit_logs_target_time'),
    );
  });

  it('resetUserPassword updates profiles.password_hash and inserts audit without secrets', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const plainPassword = 'newpass123';
    const expectedHash = createHash('sha256').update(plainPassword).digest('hex');

    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('UPDATE public.profiles SET password_hash')) {
        return { rows: [], rowCount: 1 } as never;
      }
      if (sql.includes('INSERT INTO public.admin_audit_logs')) {
        return { rows: [], rowCount: 1 } as never;
      }
      return { rows: [], rowCount: 0 } as never;
    });

    const result = await service.resetUserPassword(`Bearer ${token}`, {
      user_id: '11111111-1111-4111-8111-111111111111',
      new_password: plainPassword,
    });

    expect(result.success).toBe(true);
    expect(db.withTransaction).toHaveBeenCalled();
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.profiles SET password_hash'),
      expect.arrayContaining(['11111111-1111-4111-8111-111111111111', expectedHash]),
    );

    const auditCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.admin_audit_logs'),
    );
    expect(auditCall).toBeDefined();
    const auditParams = auditCall?.[1] as unknown[];
    expect(auditParams[1]).toBe('ceo@xe.vn'); // actor_sub
    expect(auditParams[2]).toBe('11111111-1111-4111-8111-111111111111'); // target
    expect(auditParams[3]).toBe('credential_password_reset');
    const detailRaw = String(auditParams[4]);
    const detail = JSON.parse(detailRaw) as Record<string, unknown>;
    expect(detail.password_changed).toBe(true);
    expect(detail.email_changed).toBe(false);
    expect(detailRaw).not.toContain(plainPassword);
    expect(detailRaw).not.toContain(expectedHash);
    expect(detail).not.toHaveProperty('password');
    expect(detail).not.toHaveProperty('password_hash');
    expect(detail).not.toHaveProperty('new_password');
  });

  it('resetUserPassword password+email uses credential_password_and_email action', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('UPDATE public.profiles SET')) {
        return { rows: [], rowCount: 1 } as never;
      }
      if (sql.includes('INSERT INTO public.admin_audit_logs')) {
        return { rows: [], rowCount: 1 } as never;
      }
      return { rows: [], rowCount: 0 } as never;
    });

    await service.resetUserPassword(`Bearer ${token}`, {
      user_id: '11111111-1111-4111-8111-111111111111',
      new_password: 'newpass123',
      new_email: 'Target.User@Xe.Vn',
    });

    const auditCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.admin_audit_logs'),
    );
    expect(auditCall?.[1]?.[3]).toBe('credential_password_and_email');
    const detail = JSON.parse(String(auditCall?.[1]?.[4])) as Record<string, unknown>;
    expect(detail.email_after).toBe('target.user@xe.vn');
    expect(detail.password_changed).toBe(true);
    expect(detail.email_changed).toBe(true);
    expect(JSON.stringify(detail)).not.toContain('newpass123');
  });

  it('resetUserPassword fails closed when audit INSERT throws (TX rollback path)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('UPDATE public.profiles SET password_hash')) {
        return { rows: [], rowCount: 1 } as never;
      }
      if (sql.includes('INSERT INTO public.admin_audit_logs')) {
        throw new Error('audit_insert_failed');
      }
      return { rows: [], rowCount: 0 } as never;
    });

    await expect(
      service.resetUserPassword(`Bearer ${token}`, {
        user_id: '11111111-1111-4111-8111-111111111111',
        new_password: 'newpass123',
      }),
    ).rejects.toThrow('audit_insert_failed');
  });

  it('resetUserPassword returns 404 HRM-ERR-USER-NOT-FOUND when profile missing (G-ADM-05)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('UPDATE public.profiles SET password_hash')) {
        return { rows: [], rowCount: 0 } as never;
      }
      return { rows: [], rowCount: 0 } as never;
    });

    let caught: unknown;
    try {
      await service.resetUserPassword(`Bearer ${token}`, {
        user_id: '22222222-2222-4222-8222-222222222222',
        new_password: 'newpass123',
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ApiException);
    const ex = caught as ApiException;
    expect(ex.code).toBe('HRM-ERR-USER-NOT-FOUND');
    expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(db.query).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.admin_audit_logs'),
      expect.anything(),
    );
  });

  describe('G-ADM-04 invite temp password (AC-ADM-04-TEMP-01..05)', () => {
    const inviteAuth = () =>
      `Bearer ${signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      })}`;

    /** AC-ADM-04-TEMP-05 */
    it('generateInviteTempPassword length ≥12 and charset §C.1', () => {
      const charset = /^[A-Za-z0-9!@#$%^&*\-_=+]+$/;
      for (let i = 0; i < 40; i += 1) {
        const pwd = generateInviteTempPassword();
        expect(pwd.length).toBeGreaterThanOrEqual(12);
        expect(pwd).toMatch(charset);
        expect(pwd).toMatch(/[A-Za-z]/);
        expect(pwd).toMatch(/[0-9]/);
        expect(pwd).not.toMatch(/\s/);
        expect(pwd).not.toContain("'");
        expect(pwd).not.toContain('"');
      }
      expect(generateInviteTempPassword(8).length).toBeGreaterThanOrEqual(12);
    });

    /** AC-ADM-04-TEMP-01 */
    it('inviteEmployees source has no literal 12345678 as invite password', () => {
      const src = readFileSync(join(__dirname, 'hrm-admin.service.ts'), 'utf8');
      const inviteBlock = src.slice(
        src.indexOf('async inviteEmployees'),
        src.indexOf('async resetUserPassword'),
      );
      expect(inviteBlock).not.toContain("'12345678'");
      expect(inviteBlock).not.toContain('"12345678"');
      expect(inviteBlock).toContain('generateInviteTempPassword');
    });

    /** AC-ADM-04-TEMP-02 + AC-ADM-04-TEMP-03 */
    it('invite new users: distinct hashes and response has no password fields', async () => {
      const insertedHashes: string[] = [];
      db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
        if (sql.includes('FROM public.profiles WHERE LOWER(email)')) {
          return { rows: [], rowCount: 0 } as never;
        }
        if (sql.includes('INSERT INTO public.profiles')) {
          insertedHashes.push(String(params?.[3]));
          return { rows: [], rowCount: 1 } as never;
        }
        if (sql.includes('INSERT INTO public.user_company_memberships')) {
          return { rows: [], rowCount: 1 } as never;
        }
        return { rows: [], rowCount: 0 } as never;
      });

      const result = await service.inviteEmployees(inviteAuth(), {
        company_id: 'holding',
        employees: [
          { email: 'new.a@xe.vn', full_name: 'New A' },
          { email: 'new.b@xe.vn', full_name: 'New B' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.invited).toBe(2);
      expect(insertedHashes).toHaveLength(2);
      expect(insertedHashes[0]).not.toBe(insertedHashes[1]);
      expect(insertedHashes[0]).not.toBe(createHash('sha256').update('12345678').digest('hex'));
      expect(JSON.stringify(result)).not.toMatch(/password|temp_password|plainPassword/i);
      for (const row of result.results) {
        expect(row).not.toHaveProperty('password');
        expect(row).not.toHaveProperty('temp_password');
        expect(row).not.toHaveProperty('plainPassword');
      }
    });

    /** AC-ADM-04-TEMP-04 */
    it('re-invite existing email does not overwrite password_hash', async () => {
      const existingUserId = '33333333-3333-4333-8333-333333333333';
      let profileInserts = 0;
      let passwordUpdates = 0;

      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.profiles WHERE LOWER(email)')) {
          return { rows: [{ user_id: existingUserId }], rowCount: 1 } as never;
        }
        if (sql.includes('INSERT INTO public.profiles')) {
          profileInserts += 1;
          return { rows: [], rowCount: 1 } as never;
        }
        if (sql.includes('UPDATE public.profiles SET password_hash')) {
          passwordUpdates += 1;
          return { rows: [], rowCount: 1 } as never;
        }
        if (sql.includes('INSERT INTO public.user_company_memberships')) {
          return { rows: [], rowCount: 1 } as never;
        }
        return { rows: [], rowCount: 0 } as never;
      });

      const result = await service.inviteEmployees(inviteAuth(), {
        company_id: 'holding',
        employees: [{ email: 'Existing.User@Xe.Vn', full_name: 'Existing', employee_id: null }],
      });

      expect(result.success).toBe(true);
      expect(result.invited).toBe(1);
      expect(profileInserts).toBe(0);
      expect(passwordUpdates).toBe(0);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO public.user_company_memberships'),
        expect.arrayContaining([existingUserId, 'holding']),
      );
    });
  });

  describe('BE-HRM-ADM-UPSERT-PWD-01 upsertCompanyMembership temp password', () => {
    const upsertAuth = () =>
      `Bearer ${signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      })}`;

    it('upsertCompanyMembership source has no literal fixed temp password', () => {
      const src = readFileSync(join(__dirname, 'hrm-admin.service.ts'), 'utf8');
      const upsertBlock = src.slice(src.indexOf('async upsertCompanyMembership'));
      expect(upsertBlock).not.toContain("'12345678'");
      expect(upsertBlock).not.toContain('"12345678"');
      expect(upsertBlock).toContain('generateInviteTempPassword');
      // Whole service create/upsert paths: no hardcoded fixed temp (invite + upsert)
      const literals = src.match(/['"]12345678['"]/g) ?? [];
      expect(literals).toHaveLength(0);
    });

    it('upsert new profile: CSPRNG hash ≠ fixed-secret hash; response has no password fields', async () => {
      const insertedHashes: string[] = [];
      const membershipRow = {
        id: '44444444-4444-4444-8444-444444444444',
        user_id: '55555555-5555-4555-8555-555555555555',
        company_id: 'holding',
        email: 'upsert.new@xe.vn',
        role: 'admin',
      };

      db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
        if (sql.includes('FROM public.profiles WHERE LOWER(email)')) {
          return { rows: [], rowCount: 0 } as never;
        }
        if (sql.includes('INSERT INTO public.profiles')) {
          insertedHashes.push(String(params?.[3]));
          return { rows: [], rowCount: 1 } as never;
        }
        if (sql.includes('INSERT INTO public.user_company_memberships')) {
          return { rows: [membershipRow], rowCount: 1 } as never;
        }
        if (sql.includes('FROM public.user_company_memberships WHERE user_id')) {
          return { rows: [membershipRow], rowCount: 1 } as never;
        }
        return { rows: [], rowCount: 0 } as never;
      });

      const result = await service.upsertCompanyMembership(upsertAuth(), {
        email: 'upsert.new@xe.vn',
        full_name: 'Upsert New',
        role: 'admin',
        company_id: 'holding',
      });

      expect(insertedHashes).toHaveLength(1);
      expect(insertedHashes[0]).not.toBe(createHash('sha256').update('12345678').digest('hex'));
      expect(insertedHashes[0]).toMatch(/^[a-f0-9]{64}$/);
      expect(JSON.stringify(result)).not.toMatch(/password|temp_password|plainPassword/i);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('temp_password');
    });

    it('upsert existing profile does not overwrite password_hash', async () => {
      const existingUserId = '66666666-6666-4666-8666-666666666666';
      let profileInserts = 0;
      let passwordUpdates = 0;
      const membershipRow = {
        id: '77777777-7777-4777-8777-777777777777',
        user_id: existingUserId,
        company_id: 'holding',
        email: 'upsert.existing@xe.vn',
        role: 'employee',
      };

      db.query.mockImplementation(async (sql: string) => {
        if (sql.includes('FROM public.profiles WHERE LOWER(email)')) {
          return { rows: [{ user_id: existingUserId }], rowCount: 1 } as never;
        }
        if (sql.includes('INSERT INTO public.profiles')) {
          profileInserts += 1;
          return { rows: [], rowCount: 1 } as never;
        }
        if (sql.includes('UPDATE public.profiles SET password_hash')) {
          passwordUpdates += 1;
          return { rows: [], rowCount: 1 } as never;
        }
        if (sql.includes('INSERT INTO public.user_company_memberships')) {
          return { rows: [membershipRow], rowCount: 1 } as never;
        }
        if (sql.includes('FROM public.user_company_memberships WHERE user_id')) {
          return { rows: [membershipRow], rowCount: 1 } as never;
        }
        return { rows: [], rowCount: 0 } as never;
      });

      const result = await service.upsertCompanyMembership(upsertAuth(), {
        email: 'Upsert.Existing@Xe.Vn',
        full_name: 'Existing',
        role: 'employee',
        company_id: 'holding',
      });

      expect(profileInserts).toBe(0);
      expect(passwordUpdates).toBe(0);
      expect(result.user_id).toBe(existingUserId);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO public.user_company_memberships'),
        expect.arrayContaining([existingUserId, 'holding']),
      );
    });
  });
});
