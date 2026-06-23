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
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <img src="/xevn-logo.png" alt="XeVN" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">XeVN Portal</h1>
            <p className="text-sm text-slate-500">Đăng nhập tập đoàn / công ty thành viên</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Email</span>
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Mail className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="email"
                required
                autoComplete="username"
                className="w-full text-sm outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">Mật khẩu</span>
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Lock className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full text-sm outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </span>
          </label>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#1E40AF] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Dev: <span className="font-mono">du-lich.ceo@xe.vn</span> / <span className="font-mono">Xevn@2026</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
