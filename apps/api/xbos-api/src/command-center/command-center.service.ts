import { Injectable } from '@nestjs/common';
import { XbosDbService } from '../db/xbos-db.service';

@Injectable()
export class CommandCenterService {
  constructor(private readonly db: XbosDbService) {}

  async getWorkspaceMeta(tenantId: string, companyId: string) {
    const { rows } = await this.db.query<{ as_of: string | null; data_sync_note: string | null }>(
      `SELECT
        GREATEST(
          COALESCE((SELECT MAX(updated_at) FROM public.xbos_legal_entity WHERE tenant_id = $1 AND company_id = $2), 'epoch'::timestamptz),
          COALESCE((
            SELECT MAX(t.updated_at) FROM public.xbos_workflow_step_task t
            JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
            WHERE i.tenant_id = $1 AND i.company_id = $2
          ), 'epoch'::timestamptz),
          COALESCE((SELECT MAX(updated_at) FROM public.xbos_legal_entity_document WHERE tenant_id = $1 AND company_id = $2), 'epoch'::timestamptz)
        ) AS as_of,
        NULL::text AS data_sync_note`,
      [tenantId, companyId],
    );
    const asOf = rows[0]?.as_of ?? new Date().toISOString();
    return {
      asOf: new Date(asOf).toISOString(),
      dataSyncNote: process.env.XBOS_CC_DATA_SYNC_NOTE?.trim() || rows[0]?.data_sync_note || null,
    };
  }
}
