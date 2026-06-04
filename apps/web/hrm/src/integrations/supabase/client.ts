/**
 * P1-SUPA-FE-02 — Supabase client removed from HRM app runtime.
 * Use `hrmApi` + `portalAuthBridge` / `hrmMobileAuth` instead.
 */
export const isSupabaseConfigured = false;

export const supabase = new Proxy(
  {} as Record<string, unknown>,
  {
    get() {
      throw new Error('HRM_SUPABASE_BLOCKED: use Nest /api/hrm (P1-SUPA-FE-02)');
    },
  },
);
