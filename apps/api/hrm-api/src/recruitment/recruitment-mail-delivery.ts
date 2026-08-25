/**
 * @CODE-MEMORY
 * Screen:     HRM REC mail delivery (SMTP / local stub)
 * UC:         UC-BP-REC-06 · F-REC-MAIL-01 provider path
 * Purpose:    Resolve HRM_MAIL_PROVIDER + send via nodemailer (Gmail SMTP App Password).
 * WorkItem:   PO-HRM-REC-MAIL-SMTP-01
 * must_keep:  local stub ONLY when HRM_MAIL_PROVIDER=local · DENY silent fake sent · reject .local TO
 */

import * as nodemailer from 'nodemailer';

export type HrmMailProviderMode = 'local' | 'smtp';

export type HrmMailSendInput = {
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
};

export type HrmMailSendResult = {
  providerRef: string;
  mode: HrmMailProviderMode;
  accepted: string[];
};

const EMAIL_SHAPE_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/** Domains that look valid but never reach a real inbox (dev fixtures / RFC reserved). */
const NON_DELIVERABLE_DOMAIN_RE =
  /\.(local|localhost|test|example|invalid)$/i;

export function isDeliverableEmailAddress(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!EMAIL_SHAPE_RE.test(e)) return false;
  const at = e.lastIndexOf('@');
  if (at <= 0) return false;
  const domain = e.slice(at + 1);
  if (!domain || domain.includes('..')) return false;
  if (NON_DELIVERABLE_DOMAIN_RE.test(domain)) return false;
  if (domain === 'localhost' || domain.endsWith('.localhost')) return false;
  return true;
}

export function assertDeliverableRecipients(
  to: string[],
  cc: string[] = [],
): { to: string[]; cc: string[] } {
  const cleanTo = to.map((x) => x.trim().toLowerCase()).filter(Boolean);
  const cleanCc = cc.map((x) => x.trim().toLowerCase()).filter(Boolean);
  const badTo = cleanTo.filter((e) => !isDeliverableEmailAddress(e));
  const badCc = cleanCc.filter((e) => !isDeliverableEmailAddress(e));
  if (badTo.length > 0 || badCc.length > 0) {
    const bad = [...badTo, ...badCc].join(', ');
    throw new Error(
      `Email không gửi được inbox thật (vd. @dev.local / @localhost): ${bad}. Nhập địa chỉ Gmail/Outlook thật rồi gửi lại.`,
    );
  }
  if (cleanTo.length === 0) {
    throw new Error('Cần ít nhất một địa chỉ người nhận (To) hợp lệ.');
  }
  return { to: cleanTo, cc: cleanCc };
}

export function hasHrmSmtpCredentials(): boolean {
  const user = (process.env.HRM_SMTP_USER ?? '').trim();
  const pass = (process.env.HRM_SMTP_PASS ?? '').trim();
  const from = (process.env.HRM_MAIL_FROM ?? user).trim();
  return Boolean(user && pass && from);
}

/**
 * Provider resolution (plan):
 * - `local` → stub `local-…` (tests / explicit stub only)
 * - `smtp` → real SMTP; missing creds → throw (never fake sent)
 * - unset / other → smtp if creds present, else throw (never silent local)
 */
export function resolveHrmMailProviderMode(): HrmMailProviderMode {
  const raw = (process.env.HRM_MAIL_PROVIDER ?? '').trim().toLowerCase();
  if (raw === 'local') return 'local';
  if (raw === 'smtp') return 'smtp';
  if (hasHrmSmtpCredentials()) return 'smtp';
  throw new Error(
    'Chưa cấu hình gửi thư thật: đặt HRM_MAIL_PROVIDER=smtp kèm HRM_SMTP_USER/HRM_SMTP_PASS/HRM_MAIL_FROM (Gmail App Password), hoặc HRM_MAIL_PROVIDER=local nếu cố ý dùng stub (không gửi inbox).',
  );
}

export function assertSmtpConfiguredOrThrow(): {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
} {
  const host = (process.env.HRM_SMTP_HOST ?? 'smtp.gmail.com').trim();
  const port = Number.parseInt(process.env.HRM_SMTP_PORT ?? '587', 10) || 587;
  const user = (process.env.HRM_SMTP_USER ?? '').trim();
  const pass = (process.env.HRM_SMTP_PASS ?? '').trim();
  const from = (process.env.HRM_MAIL_FROM ?? user).trim();
  const fromName = (process.env.HRM_MAIL_FROM_NAME ?? 'XeVN HRM').trim();
  if (!user || !pass || !from) {
    throw new Error(
      'SMTP chưa cấu hình: cần HRM_SMTP_USER, HRM_SMTP_PASS, HRM_MAIL_FROM trong apps/api/hrm-api/.env (Gmail App Password). Restart hrm-api sau khi sửa.',
    );
  }
  return { host, port, user, pass, from, fromName };
}

export function describeHrmMailProviderForLog(): string {
  const raw = (process.env.HRM_MAIL_PROVIDER ?? '').trim().toLowerCase() || '(unset)';
  if (raw === 'local') return 'local-stub';
  if (hasHrmSmtpCredentials()) {
    const user = (process.env.HRM_SMTP_USER ?? '').trim();
    return `smtp:${user}`;
  }
  return `unconfigured provider=${raw}`;
}

export async function deliverRecruitmentMail(
  input: HrmMailSendInput,
  opts?: { outboxId?: string; forceLocal?: boolean },
): Promise<HrmMailSendResult> {
  const recipients = assertDeliverableRecipients(input.to, input.cc ?? []);

  if (opts?.forceLocal === true) {
    const id = (opts?.outboxId ?? 'local').slice(0, 8);
    return {
      providerRef: `local-${id}`,
      mode: 'local',
      accepted: recipients.to,
    };
  }

  const mode = resolveHrmMailProviderMode();

  if (mode === 'local') {
    const id = (opts?.outboxId ?? 'local').slice(0, 8);
    return {
      providerRef: `local-${id}`,
      mode: 'local',
      accepted: recipients.to,
    };
  }

  const cfg = assertSmtpConfiguredOrThrow();
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    requireTLS: cfg.port === 587,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  const info = await transporter.sendMail({
    from: cfg.fromName ? `"${cfg.fromName}" <${cfg.from}>` : cfg.from,
    to: recipients.to.join(', '),
    cc: recipients.cc.length > 0 ? recipients.cc.join(', ') : undefined,
    subject: input.subject,
    text: input.text,
  });

  const accepted = (info.accepted ?? [])
    .map((x) => String(x).trim().toLowerCase())
    .filter(Boolean);
  const rejected = (info.rejected ?? [])
    .map((x) => String(x).trim().toLowerCase())
    .filter(Boolean);

  if (rejected.length > 0) {
    throw new Error(
      `SMTP từ chối người nhận: ${rejected.join(', ')}. Kiểm tra địa chỉ email.`,
    );
  }
  if (accepted.length === 0) {
    throw new Error(
      'SMTP không xác nhận accepted[] — thư có thể chưa vào hàng gửi. Kiểm tra HRM_SMTP_* / App Password.',
    );
  }

  const messageId =
    typeof info.messageId === 'string' && info.messageId.trim()
      ? info.messageId.trim()
      : `smtp-${opts?.outboxId?.slice(0, 8) ?? 'ok'}`;

  return { providerRef: messageId, mode: 'smtp', accepted };
}
