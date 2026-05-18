import { Injectable, Logger } from '@nestjs/common';
import { TOURISM_COMPANY_ID, TOURISM_TENANT_ID } from './tourism-fleet-catalog';

@Injectable()
export class XbosCatalogWorkflowBridge {
  private readonly logger = new Logger(XbosCatalogWorkflowBridge.name);

  private xbosBaseUrl(): string {
    const port = process.env.XBOS_BE_PORT ?? '28002';
    return (process.env.XBOS_API_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, '');
  }

  async startCatalogWorkflowIfConfigured(
    batchId: string,
    tenantId: string,
    companyId: string,
    requesterUserId?: string,
  ): Promise<{ workflowInstanceId?: string } | null> {
    if (tenantId !== TOURISM_TENANT_ID) {
      return null;
    }
    const key = process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
    try {
      const res = await fetch(`${this.xbosBaseUrl()}/api/xbos/catalog-governance/workflows/start`, {
        method: 'POST',
        headers: {
          'x-internal-api-key': key,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          batchId,
          memberTenantId: tenantId,
          memberCompanyId: companyId || TOURISM_COMPANY_ID,
          requesterUserId: requesterUserId ?? null,
        }),
      });
      const json = (await res.json()) as { success?: boolean; data?: { workflowInstanceId?: string } };
      if (!res.ok || !json.success) {
        this.logger.warn(`XBOS workflow start failed: ${res.status}`);
        return null;
      }
      return json.data ?? null;
    } catch (err) {
      this.logger.warn(`XBOS workflow start error: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }
}
