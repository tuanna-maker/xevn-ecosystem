import { MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { xbosGetData } from './xbosHttp';

export type CommandCenterWorkspaceMeta = {
  asOf: string;
  dataSyncNote?: string | null;
};

export async function fetchCommandCenterWorkspaceMeta(
  tenantId: string,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<CommandCenterWorkspaceMeta | null> {
  try {
    const q = new URLSearchParams({ tenantId, companyId });
    const data = await xbosGetData<CommandCenterWorkspaceMeta>(
      `/command-center/workspace-meta?${q.toString()}`,
      { scope: 'command-center.workspace-meta', tenantId, companyId },
    );
    if (!data?.asOf) return null;
    return data;
  } catch {
    return null;
  }
}
