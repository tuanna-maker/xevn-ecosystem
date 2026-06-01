import { Injectable } from '@nestjs/common';
import {
  XBOS_GROUP_LEGAL_HOLDING,
  XBOS_GROUP_OPERATING_MAIN,
} from '../common/xbos-group-legal-scope';
import { XbosDbService } from '../db/xbos-db.service';

/** BR-CC-META-DATE-01 — never expose epoch / pre-2000 as workspace freshness. */
const MIN_VALID_AS_OF_MS = Date.UTC(2000, 0, 1);

export function workspaceMetaCompanyIds(companyId: string): string[] {
  const id = companyId.trim().toLowerCase();
  if (id === XBOS_GROUP_LEGAL_HOLDING || id === XBOS_GROUP_OPERATING_MAIN) {
    return [XBOS_GROUP_LEGAL_HOLDING, XBOS_GROUP_OPERATING_MAIN];
  }
  return [companyId];
}

export function resolveWorkspaceAsOf(raw: string | Date | null | undefined): string {
  if (raw == null) {
    return new Date().toISOString();
  }
  const ms = new Date(raw).getTime();
  if (!Number.isFinite(ms) || ms < MIN_VALID_AS_OF_MS) {
    return new Date().toISOString();
  }
  return new Date(ms).toISOString();
}

@Injectable()
export class CommandCenterService {
  constructor(private readonly db: XbosDbService) {}

  async getWorkspaceMeta(tenantId: string, companyId: string) {
    const partitionIds = workspaceMetaCompanyIds(companyId);
    const { rows } = await this.db.query<{ as_of: string | null; data_sync_note: string | null }>(
      `SELECT
        GREATEST(
          (SELECT MAX(updated_at) FROM public.xbos_legal_entity
           WHERE tenant_id = $1 AND company_id = ANY($2::text[])),
          (SELECT MAX(t.updated_at) FROM public.xbos_workflow_step_task t
           JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
           WHERE i.tenant_id = $1 AND i.company_id = ANY($2::text[])),
          (SELECT MAX(updated_at) FROM public.xbos_legal_entity_document
           WHERE tenant_id = $1 AND company_id = ANY($2::text[]))
        ) AS as_of,
        NULL::text AS data_sync_note`,
      [tenantId, partitionIds],
    );
    const asOf = resolveWorkspaceAsOf(rows[0]?.as_of);
    return {
      asOf,
      dataSyncNote: process.env.XBOS_CC_DATA_SYNC_NOTE?.trim() || rows[0]?.data_sync_note || null,
    };
  }
}
