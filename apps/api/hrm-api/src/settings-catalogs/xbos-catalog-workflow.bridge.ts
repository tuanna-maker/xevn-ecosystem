import { Injectable, Logger } from '@nestjs/common';
import { CatalogSyncService, resolveXbosApiBaseUrl } from '../catalog-sync/catalog-sync.service';
import { MASTER_TENANT_ID } from '../common/hrm-list-scope';
import { TOURISM_COMPANY_ID, TOURISM_TENANT_ID } from './tourism-fleet-catalog';

const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';

@Injectable()
export class XbosCatalogWorkflowBridge {
  private readonly logger = new Logger(XbosCatalogWorkflowBridge.name);

  constructor(private readonly catalogSync: CatalogSyncService) {}

  private xbosBaseUrl(): string {
    return resolveXbosApiBaseUrl();
  }

  /** UF-XBOS-09/15 — group CEO (xevn) and member tourism (xe-du-lich) extension paths. */
  shouldStartCatalogWorkflow(tenantId: string, companyId: string): boolean {
    const t = tenantId.trim().toLowerCase();
    const c = companyId.trim().toLowerCase();
    if (t === TOURISM_TENANT_ID) return true;
    if (t === MASTER_TENANT_ID && (c === GROUP_HOLDING_COMPANY_ID || c === GROUP_OPERATING_MAIN)) {
      return true;
    }
    return false;
  }

  async startCatalogWorkflowIfConfigured(
    batchId: string,
    tenantId: string,
    companyId: string,
    requesterUserId?: string,
  ): Promise<{ workflowInstanceId?: string } | null> {
    if (!this.shouldStartCatalogWorkflow(tenantId, companyId)) {
      return null;
    }
    const memberTenantId = tenantId.trim().toLowerCase();
    const memberCompanyId = companyId.trim().toLowerCase() || TOURISM_COMPANY_ID;
    // UF-XBOS-09/15 S2S: production xbos-be rejects static key alone (NODE_ENV=production) — mint service JWT.
    const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(undefined, {
      tenantId: memberTenantId,
      companyId: memberCompanyId,
    });
    try {
      const res = await fetch(`${this.xbosBaseUrl()}/api/xbos/catalog-governance/workflows/start`, {
        method: 'POST',
        headers: {
          ...upstreamHeaders,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          batchId,
          memberTenantId,
          memberCompanyId,
          requesterUserId: requesterUserId ?? null,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        code?: string;
        message?: string;
        data?: { workflowInstanceId?: string };
      };
      if (!res.ok || !json.success) {
        this.logger.warn(
          `XBOS workflow start failed: ${res.status} code=${json.code ?? 'unknown'} msg=${json.message ?? ''}`,
        );
        return null;
      }
      return json.data ?? null;
    } catch (err) {
      this.logger.warn(`XBOS workflow start error: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }
}
