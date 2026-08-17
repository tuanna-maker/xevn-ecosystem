/**
 * @CODE-MEMORY
 * Screen: Portal `/login` — LoginPage (PORT-01)
 * UC: FR-UC-M01 · brand shell login
 * BR: ADR dual-surface — dark brandShell only on login/splash
 * SRS: N/A theme remaster (no SRS mutate)
 * TechSpec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §7–§9 · §16
 * Purpose: Dark brand shell + surface card; mark+wordmark XeVN; sharp labels; primary CTA.
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A
 * Coded: 2026-08-05
 * Callers: App.tsx Route /login
 * Callees: AuthContext.login · consumeLoginRedirect
 * FEActions: submit → login → navigate redirect
 * must_keep: redirect query/state; no purple AI hero; no stats strip; AuthContext.login API
 * SOLID: Auth chrome only — no CC business
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-port-login.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A · 2026-08-05
 * change_mode: UPGRADE
 * What: Card → xevn-dialog-surface (thin primary bar A4); CODE-MEMORY cite ADR-20260805
 * Why: Inventory PORT-01 brand hero signal · pale ban §8
 * must_keep: AuthContext contract; redirect param parity with HRM portalLogin
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W4-PORT-LOGIN · 2026-08-05
 * change_mode: UPGRADE
 * What: Two-pane neo layout — left brandShell hero XeVN wordmark; right glass card
 *       (4px #1E40AF bar + wordmark + Đăng nhập); empty password (no fake credentials UI);
 *       remove Dev credential strip; Montserrat display hero.
 * Why: ui-neo/login.html SoT · ADR §16 fonts already loading · brand test without nav
 * must_keep: AuthContext.login · redirect query/state · no seed · no auth bypass
 * Neo: docs/client-delivery/hrm-enterprise-blueprint/ui-neo/login.html
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W4-PORT-LOGIN · 2026-08-05 (stall n=1 CLOSE)
 * change_mode: UPGRADE
 * What: Hero mark alt=XeVN; visual h1/p via CSS neo lockstep; evidence WRITE before READY.
 * Why: Prior seat evidence MISS — close stall without breaking AuthContext.login
 * must_keep: loginPortal API · redirect query/state · remaster_program_done=false
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-PORTAL-LOGIN-LOGO-01 · 2026-08-06
 * change_mode: FIX
 * What: Hero mark 56px → 112px (h-28); card wordmark 32→40 — brand-first left pane
 * Why: Sponsor screenshot — mark quá nhỏ vs hero brand weight Precision Motion
 * must_keep: src=/xevn-logo.png · testIDs portal-login-mark|wordmark · AuthContext.login
 * LastVerified: docs/qa/evidence/po-hrm-ui-portal-login-logo-01.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-PORTAL-LOGIN-LOGO-02 · 2026-08-06
 * change_mode: FIX
 * What: Hero mark pad bg-black → bg-white; card wordmark pad white (override brand-shell)
 * Why: Sponsor CORRECTION «Logo nền trắng» — keep size h-28/112 from LOGO-01
 * must_keep: src=/xevn-logo.png · testIDs portal-login-mark|wordmark · dialog center untouched
 * LastVerified: docs/qa/evidence/po-hrm-ui-portal-login-logo-02.md
 */

import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { consumeLoginRedirect } from '../../integrations/authSession';

/** Must match `PORTAL_LOGIN_REDIRECT_PARAM` in apps/web/hrm `portalLogin.ts`. */
const LOGIN_REDIRECT_QUERY = 'redirect';

function safeRedirectPath(raw: string | null | undefined): string | null {
  const path = raw?.trim();
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

/**
 * XeVN Precision Motion — neo two-pane login (ADR §9 · ui-neo/login.html).
 * Brand test: left pane mark + wordmark alone identify XeVN (no nav).
 */
const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [from] = useState(() => {
    const fromQuery = safeRedirectPath(
      new URLSearchParams(location.search).get(LOGIN_REDIRECT_QUERY),
    );
    if (fromQuery) return fromQuery;
    const fromState = safeRedirectPath((location.state as { from?: string } | null)?.from);
    if (fromState) return fromState;
    return consumeLoginRedirect() ?? '/command-center';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="xevn-login-page"
      data-testid="portal-login-neo"
    >
      <section
        className="xevn-login-visual"
        aria-label="Nhận diện XeVN"
      >
        <img
          src="/xevn-logo.png"
          alt="XeVN"
          width={112}
          height={112}
          className="xevn-login-mark mb-6 h-28 w-28 rounded-[14px] bg-white object-contain"
          data-testid="portal-login-mark"
        />
        <h1
          className="font-display xevn-login-hero-title"
          data-testid="portal-login-wordmark"
        >
          XeVN
        </h1>
        <p className="xevn-login-hero-sub">
          Cổng vận hành tập đoàn — nhân sự, chấm công, điều hành đa công ty.
        </p>
      </section>

      <section className="xevn-login-panel">
        <div className="xevn-dialog-surface w-full max-w-[400px] p-0">
          <div className="xevn-dialog-header-glass flex items-center gap-3 px-5 py-3.5">
            <img
              src="/xevn-logo.png"
              alt=""
              width={40}
              height={40}
              className="xevn-dialog-wordmark h-10 w-10 !bg-white"
              aria-hidden="true"
              data-testid="portal-login-card-wordmark"
            />
            <div className="min-w-0">
              <h2 className="xevn-type-title font-display text-xevn-text">Đăng nhập</h2>
              <p className="xevn-type-label mt-0.5">Portal nội bộ XeVN</p>
            </div>
          </div>

          <form
            className="space-y-4 px-5 pb-2 pt-4"
            onSubmit={(e) => void onSubmit(e)}
            data-testid="portal-login-form"
          >
            <label className="block">
              <span className="xevn-type-label">Email công việc</span>
              <input
                type="email"
                required
                autoComplete="username"
                placeholder="vd. ceo@xe.vn"
                className="xevn-field-line xevn-type-body mt-1 w-full rounded-input border border-xevn-border bg-xevn-surface px-3 py-2.5 text-xevn-text outline-none focus-visible:ring-2 focus-visible:ring-xevn-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="portal-login-email"
              />
            </label>
            <label className="block">
              <span className="xevn-type-label">Mật khẩu</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                className="xevn-field-line xevn-type-body mt-1 w-full rounded-input border border-xevn-border bg-xevn-surface px-3 py-2.5 text-xevn-text outline-none focus-visible:ring-2 focus-visible:ring-xevn-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="portal-login-password"
              />
            </label>

            {error ? (
              <p
                className="rounded-input bg-rose-50 px-3 py-2 text-sm font-medium text-xevn-danger"
                role="alert"
                data-testid="portal-login-error"
              >
                {error}
              </p>
            ) : null}

            <div className="xevn-dialog-footer-sticky -mx-5 mt-2 px-5 py-3.5">
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-10 rounded-input bg-xevn-primary py-2.5 text-sm font-semibold text-white transition hover:bg-xevn-primaryPressed active:scale-[0.99] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-xevn-primary focus-visible:ring-offset-2"
                data-testid="portal-login-submit"
              >
                {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
