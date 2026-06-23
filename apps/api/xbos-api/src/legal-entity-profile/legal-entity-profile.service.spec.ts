import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ApiException } from '../common/api.exception';
import type { XbosDbService } from '../db/xbos-db.service';
import type { OrgFoundationService } from '../org-foundation/org-foundation.service';
import {
  LegalEntityProfileService,
  relativeStorageKey,
  resolveStoredFilePath,
  storageRoot,
} from './legal-entity-profile.service';

const ENTITY_ID = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';
const DOC_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function createService(db: XbosDbService, org: OrgFoundationService) {
  return new LegalEntityProfileService(db, org);
}

describe('LegalEntityProfileService — legal document file (UC-CC-P0-02)', () => {
  let tempRoot: string;
  let prevStorageRoot: string | undefined;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'xbos-legal-doc-'));
    prevStorageRoot = process.env.XBOS_LEGAL_DOC_STORAGE_ROOT;
    process.env.XBOS_LEGAL_DOC_STORAGE_ROOT = tempRoot;
  });

  afterEach(() => {
    if (prevStorageRoot === undefined) {
      delete process.env.XBOS_LEGAL_DOC_STORAGE_ROOT;
    } else {
      process.env.XBOS_LEGAL_DOC_STORAGE_ROOT = prevStorageRoot;
    }
    rmSync(tempRoot, { recursive: true, force: true });
  });

  describe('resolveStoredFilePath', () => {
    it('returns null when storage_path is empty', () => {
      expect(resolveStoredFilePath(null)).toBeNull();
      expect(resolveStoredFilePath('')).toBeNull();
      expect(resolveStoredFilePath('   ')).toBeNull();
    });

    it('resolves relative storage key under storage root', () => {
      const key = relativeStorageKey('xevn', ENTITY_ID, DOC_ID, '.pdf');
      const abs = join(tempRoot, 'xevn', ENTITY_ID, `${DOC_ID}.pdf`);
      mkdirSync(join(tempRoot, 'xevn', ENTITY_ID), { recursive: true });
      writeFileSync(abs, '%PDF-1.4');

      expect(resolveStoredFilePath(key)).toBe(abs);
    });

    it('re-roots legacy absolute path when file moved to current storage root', () => {
      const key = relativeStorageKey('xevn', ENTITY_ID, DOC_ID, '.pdf');
      const abs = join(tempRoot, 'xevn', ENTITY_ID, `${DOC_ID}.pdf`);
      mkdirSync(join(tempRoot, 'xevn', ENTITY_ID), { recursive: true });
      writeFileSync(abs, '%PDF-1.4');

      const legacyAbsolute = `/old/cwd/storage/legal-documents/${key}`;
      expect(resolveStoredFilePath(legacyAbsolute)).toBe(abs);
    });

    it('returns null when file missing on disk', () => {
      const key = relativeStorageKey('xevn', ENTITY_ID, DOC_ID, '.pdf');
      expect(resolveStoredFilePath(key)).toBeNull();
    });
  });

  describe('streamDocumentFile', () => {
    it('throws XBOS-DOC-404 when metadata has empty storage_path', async () => {
      const db = {
        query: jest.fn(async () => ({
          rows: [{ storage_path: null, mime_type: 'application/pdf', document_name: 'Giấy ĐKKD' }],
        })),
      } as unknown as XbosDbService;
      const org = {} as OrgFoundationService;
      const service = createService(db, org);

      await expect(service.streamDocumentFile(DOC_ID)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-DOC-404',
      });
    });

    it('throws XBOS-DOC-404 when storage_path set but file missing', async () => {
      const key = relativeStorageKey('xevn', ENTITY_ID, DOC_ID, '.pdf');
      const db = {
        query: jest.fn(async () => ({
          rows: [{ storage_path: key, mime_type: 'application/pdf', document_name: 'Giấy ĐKKD' }],
        })),
      } as unknown as XbosDbService;
      const service = createService(db, {} as OrgFoundationService);

      await expect(service.streamDocumentFile(DOC_ID)).rejects.toMatchObject({
        code: 'XBOS-DOC-404',
        message: 'File not found',
      });
    });
  });

  describe('uploadDocumentFile', () => {
    it('writes file and stores relative storage_path (not absolute cwd path)', async () => {
      const org = {
        resolveLegalEntityPartition: jest.fn(async () => ({
          tenantId: 'xevn',
          companyId: 'holding',
        })),
      } as unknown as OrgFoundationService;

      let capturedStoragePath: string | undefined;
      const db = {
        query: jest.fn(async (sql: string, params?: unknown[]) => {
          const text = String(sql);
          if (text.includes('SELECT * FROM public.xbos_legal_entity_document') && text.includes('status')) {
            return { rows: [{ id: DOC_ID }] };
          }
          if (text.includes('UPDATE public.xbos_legal_entity_document SET')) {
            capturedStoragePath = params?.[1] as string;
            return {
              rows: [
                {
                  id: DOC_ID,
                  storage_path: capturedStoragePath,
                  file_url: `http://127.0.0.1:28002/api/xbos/org-foundation/legal-documents/${DOC_ID}/file`,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as XbosDbService;

      const service = createService(db, org);
      await service.uploadDocumentFile(
        'xevn',
        'holding',
        ENTITY_ID,
        DOC_ID,
        { buffer: Buffer.from('%PDF'), size: 4, originalname: 'dkkd.pdf' },
      );

      const expectedKey = relativeStorageKey('xevn', ENTITY_ID, DOC_ID, '.pdf');
      expect(capturedStoragePath).toBe(expectedKey);
      expect(resolveStoredFilePath(expectedKey)).toBe(
        join(storageRoot(), 'xevn', ENTITY_ID, `${DOC_ID}.pdf`),
      );
    });
  });
});
