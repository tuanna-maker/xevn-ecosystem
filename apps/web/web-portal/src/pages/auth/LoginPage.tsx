import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
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
 * XeVN Precision Motion — dark brand shell (proposal §4.1 · XEVN-THM-FE-00 / P1 start).
 * Brand test: no nav — mark + wordmark alone identify XeVN.
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

  const [email, setEmail] = useState('ceo@xe.vn');
  const [password, setPassword] = useState('Xevn@2026');
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
    <div className="xevn-brand-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-card border border-xevn-border bg-xevn-surface p-8 shadow-soft">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="/xevn-logo.png"
            alt="XeVN"
            className="h-16 w-16 object-contain"
            width={64}
            height={64}
          />
          <div>
            <h1 className="xevn-type-title text-xevn-text">XeVN Portal</h1>
            <p className="xevn-type-label mt-1">Đăng nhập tập đoàn / công ty thành viên</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <label className="block">
            <span className="xevn-type-label">Email</span>
            <span className="mt-1 flex items-center gap-2 rounded-input border border-xevn-border px-3 py-2">
              <Mail className="h-4 w-4 shrink-0 text-xevn-textMuted" aria-hidden />
              <input
                type="email"
                required
                autoComplete="username"
                className="xevn-type-body w-full bg-transparent outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
          </label>
          <label className="block">
            <span className="xevn-type-label">Mật khẩu</span>
            <span className="mt-1 flex items-center gap-2 rounded-input border border-xevn-border px-3 py-2">
              <Lock className="h-4 w-4 shrink-0 text-xevn-textMuted" aria-hidden />
              <input
                type="password"
                required
                autoComplete="current-password"
                className="xevn-type-body w-full bg-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </span>
          </label>

          {error ? (
            <p className="rounded-input bg-rose-50 px-3 py-2 text-sm text-xevn-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-input bg-xevn-primary py-2.5 text-sm font-semibold text-white transition hover:bg-xevn-primaryPressed active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-xevn-textSecondary">
          Dev: <span className="font-mono">du-lich.ceo@xe.vn</span> /{' '}
          <span className="font-mono">Xevn@2026</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
