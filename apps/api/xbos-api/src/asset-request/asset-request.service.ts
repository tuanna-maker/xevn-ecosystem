import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';

const STATUS_FLOW = ['draft', 'pending_finance', 'finance_confirmed', 'recorded', 'assigned', 'completed'] as const;

@Injectable()
export class AssetRequestService {
  constructor(private readonly db: XbosDbService) {}

  async create(tenantId: string, companyId: string, body: Record<string, unknown>) {
    const code = String(body.requestCode ?? `AR-${Date.now()}`);
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_asset_request (tenant_id, company_id, asset_id, request_code, status, requested_by, payload)
       VALUES ($1,$2,$3::uuid,$4,'pending_finance',$5,$6::jsonb) RETURNING *`,
      [tenantId, companyId, body.assetId ?? null, code, body.requestedBy ?? 'system', JSON.stringify(body.payload ?? {})],
    );
    return rows[0];
  }

  async list(tenantId: string, companyId: string) {
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_asset_request WHERE tenant_id = $1 AND company_id = $2 ORDER BY created_at DESC`,
      [tenantId, companyId],
    );
    return rows;
  }

  async transition(tenantId: string, companyId: string, requestId: string, nextStatus: string, actor: string) {
    const { rows: current } = await this.db.query(
      `SELECT * FROM public.xbos_asset_request WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3`,
      [requestId, tenantId, companyId],
    );
    if (!current[0]) throw new ApiException('XBOS-AST-404', 'Asset request not found', HttpStatus.NOT_FOUND);
    const cur = current[0] as { status: string };
    const curIdx = STATUS_FLOW.indexOf(cur.status as (typeof STATUS_FLOW)[number]);
    const nextIdx = STATUS_FLOW.indexOf(nextStatus as (typeof STATUS_FLOW)[number]);
    if (nextIdx < 0 || (curIdx >= 0 && nextIdx !== curIdx + 1 && nextStatus !== 'completed')) {
      throw new ApiException('XBOS-AST-400', 'Invalid status transition', HttpStatus.BAD_REQUEST);
    }
    const financeFields =
      nextStatus === 'finance_confirmed'
        ? `, finance_confirmed_by = $5, finance_confirmed_at = NOW()`
        : '';
    const { rows } = await this.db.query(
      `UPDATE public.xbos_asset_request SET status = $4, updated_at = NOW()${financeFields}
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 RETURNING *`,
      nextStatus === 'finance_confirmed' ? [requestId, tenantId, companyId, nextStatus, actor] : [requestId, tenantId, companyId, nextStatus],
    );
    return rows[0];
  }
}
