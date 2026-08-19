/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01
 * Purpose: Jest — ensureSchema CHK · assert EFF wire · required default · U19 list=get=patch · soft archive · DENY closed/Nest dual
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_CORE_CHK_404,
  HRM_CORE_CHK_CONFLICT_409,
  HRM_CORE_CHK_VAL_400,
  UQ_HRM_DOC_CHK_EMP_KEY_ACTIVE,
} from './emp-document-checklist.constants';
import { EmpDocumentChecklistService } from './emp-document-checklist.service';
import { HRM_EMP_DOC_TYPE_UNKNOWN } from './emp-document-type.constants';
import { EmpDocumentTypeService } from './emp-document-type.service';

describe('PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01', () => {
  const employeeId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
  const itemId = 'a11e95b7-cf1b-469f-a0f8-4c91f3f35f81';
  const query = { company_id: 'main' };

  const empRow = {
    id: employeeId,
    company_id: 'holding',
    employee_code: 'NV001',
    email: 'ceo@xe.vn',
    full_name: 'Nguyen Van A',
    job_title_key: 'CEO',
    manager_id: null,
    status: 'active',
    hired_at: '2024-01-01',
    archived_at: null,
    avatar_url: null,
    custom_fields: {},
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  let service: EmpDocumentChecklistService;
  let db: jest.Mocked<HrmDbService>;
  let docType: {
    assertDocumentTypeInEffectiveCatalog: jest.Mock;
    listEffective: jest.Mock;
  };
  let caseRow: {
    id: string;
    employee_id: string;
    company_id: string;
    document_type_key: string;
    required: boolean;
    status: string;
    file_ref: string | null;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  };

  function groupCeoAuth() {
    return `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;
  }

  beforeEach(() => {
    caseRow = {
      id: itemId,
      employee_id: employeeId,
      company_id: 'holding',
      document_type_key: 'cccd',
      required: true,
      status: 'missing',
      file_ref: null,
      archived_at: null,
      created_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z',
    };

    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;

    docType = {
      assertDocumentTypeInEffectiveCatalog: jest.fn().mockResolvedValue({
        documentTypeKey: 'cccd',
        nameVi: 'Căn cước công dân',
        sortOrder: 10,
        requiredByDefault: true,
        blocksActivation: true,
        requiresExpiry: false,
        status: 'active',
        source: 'emp_native',
        catalogKind: 'emp_document_type',
      }),
      listEffective: jest.fn().mockResolvedValue({
        total: 1,
        data: [
          {
            documentTypeKey: 'cccd',
            nameVi: 'Căn cước công dân',
            sortOrder: 10,
            requiredByDefault: true,
            blocksActivation: true,
            requiresExpiry: false,
            status: 'active',
            source: 'emp_native',
            catalogKind: 'emp_document_type',
          },
        ],
      }),
    };

    db.query.mockImplementation(async (sql: string, values?: unknown[]) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX') || s.includes('CREATE INDEX')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [empRow] };
      }
      if (s.includes('INSERT INTO public.hrm_document_checklist_item')) {
        const inserted = {
          ...caseRow,
          id: String(values?.[0] ?? caseRow.id),
          employee_id: String(values?.[1] ?? caseRow.employee_id),
          company_id: String(values?.[2] ?? caseRow.company_id),
          document_type_key: String(values?.[3] ?? caseRow.document_type_key),
          required: Boolean(values?.[4]),
          status: String(values?.[5] ?? 'missing'),
          file_ref: (values?.[6] as string | null) ?? null,
        };
        caseRow = { ...inserted };
        return { rows: [inserted] };
      }
      if (s.includes('UPDATE public.hrm_document_checklist_item')) {
        return { rows: [{ ...caseRow }] };
      }
      if (s.includes('FROM public.hrm_document_checklist_item')) {
        return { rows: [{ ...caseRow }] };
      }
      if (s.includes('FROM public.emp_document_type')) {
        return { rows: [] };
      }
      return { rows: [] };
    });

    service = new EmpDocumentChecklistService(
      db,
      docType as unknown as EmpDocumentTypeService,
    );
  });

  it('ensureSchema ADD hrm_document_checklist_item + partial UQ; DENY closed key CHECK / Nest /core table', async () => {
    await service.ensureSchema();
    const sqls = db.query.mock.calls.map((c) => String(c[0]));
    expect(sqls.some((s) => s.includes('CREATE TABLE IF NOT EXISTS public.hrm_document_checklist_item'))).toBe(
      true,
    );
    expect(sqls.some((s) => s.includes("CHECK (status IN ('missing', 'submitted', 'approved'))"))).toBe(
      true,
    );
    expect(sqls.some((s) => s.includes(UQ_HRM_DOC_CHK_EMP_KEY_ACTIVE))).toBe(true);
    expect(sqls.some((s) => s.includes('REFERENCES') && s.includes('employees'))).toBe(false);
    expect(sqls.some((s) => /document_type_key\s+IN\s*\(/i.test(s))).toBe(false);
    expect(sqls.some((s) => s.includes('CREATE TABLE') && s.includes('core') && s.includes('checklist'))).toBe(
      false,
    );
  });

  it('POST create wires assert; required defaults from catalog requiredByDefault', async () => {
    const created = await service.createChecklistItem(
      employeeId,
      query,
      { documentTypeKey: 'cccd' },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(docType.assertDocumentTypeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'holding',
        documentTypeKey: 'cccd',
      }),
    );
    expect(created.required).toBe(true);
    expect(created.status).toBe('missing');
    expect(created.nameVi).toBe('Căn cước công dân');
    expect(created.tokenKey).toBe('emp.doc.cccd');
    expect(created.blocksActivation).toBe(true);
  });

  it('POST invent key when EFF>0 → HRM-EMP-DOC-TYPE-UNKNOWN · no persist', async () => {
    docType.assertDocumentTypeInEffectiveCatalog.mockRejectedValue(
      new ApiException(
        HRM_EMP_DOC_TYPE_UNKNOWN,
        'document_type_key invent',
        HttpStatus.BAD_REQUEST,
      ),
    );
    await expect(
      service.createChecklistItem(
        employeeId,
        query,
        { documentTypeKey: 'invent_key_xyz' },
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_EMP_DOC_TYPE_UNKNOWN });
    const inserts = db.query.mock.calls.filter((c) =>
      String(c[0]).includes('INSERT INTO public.hrm_document_checklist_item'),
    );
    expect(inserts).toHaveLength(0);
  });

  it('POST EFF=0 soft-allow (assert returns null) · required false without catalog', async () => {
    docType.assertDocumentTypeInEffectiveCatalog.mockResolvedValue(null);
    const created = await service.createChecklistItem(
      employeeId,
      query,
      { documentTypeKey: 'soft_allow_key' },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(created.required).toBe(false);
    expect(created.documentTypeKey).toBe('soft_allow_key');
    expect(created.nameVi).toBe('soft_allow_key');
  });

  it('U19 list → get → patch status submitted (Diễn biến #1) under group CEO main→holding', async () => {
    const listed = await service.listChecklist(employeeId, query, groupCeoAuth(), {
      tenantId: 'xevn',
    });
    expect(listed.data.some((r) => r.id === itemId)).toBe(true);
    expect(listed.companyId).toBe('holding');

    const got = await service.getChecklistItemById(
      employeeId,
      itemId,
      query,
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(got.id).toBe(itemId);
    expect(got.documentTypeKey).toBe('cccd');

    caseRow.status = 'submitted';
    caseRow.file_ref = 's3://bucket/cccd.pdf';
    const patched = await service.updateChecklistItem(
      employeeId,
      itemId,
      query,
      { status: 'submitted', fileRef: 's3://bucket/cccd.pdf' },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(patched.status).toBe('submitted');
    expect(patched.fileRef).toBe('s3://bucket/cccd.pdf');
  });

  it('PATCH approved (Diễn biến #2) + key-change re-asserts EFF', async () => {
    caseRow.status = 'submitted';
    db.query.mockImplementation(async (sql: string, values?: unknown[]) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX') || s.includes('CREATE INDEX')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [empRow] };
      }
      if (s.includes('SELECT') && s.includes('FROM public.hrm_document_checklist_item')) {
        return { rows: [{ ...caseRow }] };
      }
      if (s.includes('UPDATE public.hrm_document_checklist_item')) {
        if (values?.[0] === 'approved') {
          caseRow = { ...caseRow, status: 'approved' };
        } else if (typeof values?.[0] === 'string' && values[0] === 'degree') {
          caseRow = { ...caseRow, document_type_key: 'degree' };
        }
        return { rows: [{ ...caseRow }] };
      }
      return { rows: [] };
    });

    const approved = await service.updateChecklistItem(
      employeeId,
      itemId,
      query,
      { status: 'approved' },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(approved.status).toBe('approved');

    docType.assertDocumentTypeInEffectiveCatalog.mockClear();
    docType.assertDocumentTypeInEffectiveCatalog.mockResolvedValue({
      documentTypeKey: 'degree',
      nameVi: 'Bằng cấp',
      sortOrder: 20,
      requiredByDefault: false,
      blocksActivation: false,
      requiresExpiry: false,
      status: 'active',
      source: 'emp_native',
      catalogKind: 'emp_document_type',
    });
    expect(caseRow.document_type_key).toBe('cccd');
    const keyed = await service.updateChecklistItem(
      employeeId,
      itemId,
      query,
      { documentTypeKey: 'degree' },
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(keyed.documentTypeKey).toBe('degree');
    expect(docType.assertDocumentTypeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ documentTypeKey: 'degree', companyId: 'holding' }),
    );
  });

  it('illegal status → HRM-CORE-CHK-VAL-400', async () => {
    await expect(
      service.updateChecklistItem(
        employeeId,
        itemId,
        query,
        { status: 'pending' as never },
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_CORE_CHK_VAL_400 });
  });

  it('duplicate active emp+key → HRM-CORE-CHK-CONFLICT-409', async () => {
    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('CREATE UNIQUE INDEX') || s.includes('CREATE INDEX')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [empRow] };
      }
      if (s.includes('INSERT INTO public.hrm_document_checklist_item')) {
        const err = Object.assign(new Error('duplicate'), {
          code: '23505',
          constraint: UQ_HRM_DOC_CHK_EMP_KEY_ACTIVE,
        });
        throw err;
      }
      return { rows: [] };
    });
    await expect(
      service.createChecklistItem(
        employeeId,
        query,
        { documentTypeKey: 'cccd' },
        groupCeoAuth(),
        { tenantId: 'xevn' },
      ),
    ).rejects.toMatchObject({ code: HRM_CORE_CHK_CONFLICT_409 });
  });

  it('soft archive via POST archive path · get miss after archive → 404', async () => {
    caseRow.archived_at = '2026-08-09T00:00:00.000Z';
    const archived = await service.softArchiveChecklistItem(
      employeeId,
      itemId,
      query,
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(archived.archivedAt).toBeTruthy();

    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('CREATE INDEX') || s.includes('CREATE UNIQUE')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [empRow] };
      }
      if (s.includes('FROM public.hrm_document_checklist_item')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    await expect(
      service.getChecklistItemById(employeeId, itemId, query, groupCeoAuth(), {
        tenantId: 'xevn',
      }),
    ).rejects.toMatchObject({ code: HRM_CORE_CHK_404 });
  });

  it('history retired key GET OK without re-assert (no key change)', async () => {
    caseRow.document_type_key = 'retired_doc';
    docType.listEffective.mockResolvedValue({ total: 1, data: [] });
    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE') || s.includes('CREATE INDEX') || s.includes('CREATE UNIQUE')) {
        return { rows: [] };
      }
      if (s.includes('FROM public.employees')) {
        return { rows: [empRow] };
      }
      if (s.includes('FROM public.hrm_document_checklist_item')) {
        return { rows: [{ ...caseRow }] };
      }
      if (s.includes('FROM public.emp_document_type')) {
        return {
          rows: [
            {
              document_type_key: 'retired_doc',
              name_vi: 'Giấy tờ đã nghỉ',
              sort_order: 50,
              required_by_default: false,
              requires_expiry: false,
              blocks_activation: false,
              status: 'retired',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const got = await service.getChecklistItemById(
      employeeId,
      itemId,
      query,
      groupCeoAuth(),
      { tenantId: 'xevn' },
    );
    expect(got.nameVi).toBe('Giấy tờ đã nghỉ');
    expect(got.catalogStatus).toBe('retired');
    expect(docType.assertDocumentTypeInEffectiveCatalog).not.toHaveBeenCalled();
  });

  it('DENY invent patterns — no Nest emp_custom_field / emp_position / closed DOC enum in ensureSchema', async () => {
    await service.ensureSchema();
    const sqls = db.query.mock.calls.map((c) => String(c[0])).join('\n');
    expect(sqls).not.toMatch(/emp_custom_field/i);
    expect(sqls).not.toMatch(/emp_position/i);
    expect(sqls).not.toMatch(/cccd.*cv.*degree/i);
    expect(sqls).not.toMatch(/@Controller\(['"]core['"]\)/);
  });
});
