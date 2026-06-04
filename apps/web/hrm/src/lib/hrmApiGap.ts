import { toast } from 'sonner';

const LOGGED = new Set<string>();

export type HrmApiGapOptions = {
  workItemId?: string;
  feature: string;
  userMessage?: string;
  silent?: boolean;
};

/**
 * Nest endpoint not wired yet — toast once per feature + console for BE backlog.
 * P1-SUPA-FE-02: no Supabase fallback.
 */
export function notifyHrmApiGap(opts: HrmApiGapOptions): void {
  const key = `${opts.workItemId ?? 'P1-SUPA-BE-02'}:${opts.feature}`;
  if (!LOGGED.has(key)) {
    LOGGED.add(key);
    console.warn(
      `[HRM API gap] ${opts.feature} — dispatch ${opts.workItemId ?? 'P1-SUPA-BE-02'}`,
    );
  }
  if (opts.silent) return;
  toast.info(
    opts.userMessage ??
      'Chức năng đang chuyển sang API HRM. Vui lòng dùng portal pilot hoặc thử lại sau.',
  );
}

export function isHrmApiGapLogged(feature: string, workItemId = 'P1-SUPA-BE-02'): boolean {
  return LOGGED.has(`${workItemId}:${feature}`);
}
