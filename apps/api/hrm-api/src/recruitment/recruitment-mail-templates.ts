/**
 * @CODE-MEMORY
 * Screen:     Default REC mail templates (VI) — fail_cv / interview_invite / offer + custom
 * UC:         UC-BP-REC-06 · F-REC-MAIL-01
 * Purpose:    Catalog subject/body + {{placeholder}} fill; company KV merge.
 * WorkItem:   PO-HRM-REC-MAIL-SMTP-01 · PO-HRM-REC-MAIL-TEMPLATES-CFG-01
 * must_keep:  3 standard codes always present · customs allowed · offer ≠ hire chốt
 */

import { DEFAULT_MAIL_TEMPLATE_CODES } from './rec-mail-eval.constants';

export type RecMailTemplateVars = {
  candidate_name: string;
  position: string;
  company: string;
};

export type RecMailTemplateContent = {
  subject: string;
  body: string;
};

export type RecMailTemplateCatalogItem = {
  code: string;
  label_vi: string;
  subject: string;
  body: string;
  active: boolean;
};

/** Max templates per company (3 chuẩn + tùy chỉnh). */
export const REC_MAIL_TEMPLATE_CATALOG_MAX = 20;

/** slug: a-z 0-9 _ - , 2–64 chars */
export const REC_MAIL_TEMPLATE_CODE_RE = /^[a-z][a-z0-9_-]{1,63}$/;

const LABEL_VI: Record<string, string> = {
  fail_cv: 'Từ chối CV (fail_cv)',
  interview_invite: 'Mời phỏng vấn (interview_invite)',
  offer: 'Thư offer / đề nghị nhận việc (offer)',
};

const DEFAULTS: Record<string, RecMailTemplateContent> = {
  fail_cv: {
    subject: '[{{company}}] Thông báo kết quả hồ sơ ứng tuyển — {{position}}',
    body: `Kính gửi {{candidate_name}},

Cảm ơn bạn đã quan tâm và nộp hồ sơ ứng tuyển vị trí {{position}} tại {{company}}.

Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu vị trí ở thời điểm hiện tại.

Chúng tôi sẽ lưu hồ sơ và liên hệ lại nếu có cơ hội phù hợp hơn trong tương lai.

Trân trọng,
Phòng Nhân sự — {{company}}`,
  },
  interview_invite: {
    subject: '[{{company}}] Thư mời phỏng vấn — {{position}}',
    body: `Kính gửi {{candidate_name}},

{{company}} trân trọng mời bạn tham dự buổi phỏng vấn cho vị trí {{position}}.

Vui lòng xác nhận tham dự và phản hồi thời gian phù hợp (hoặc theo lịch đã thỏa thuận với bộ phận tuyển dụng).

Nếu bạn có câu hỏi, vui lòng trả lời email này.

Trân trọng,
Phòng Nhân sự — {{company}}`,
  },
  offer: {
    subject: '[{{company}}] Thư đề nghị nhận việc (offer) — {{position}}',
    body: `Kính gửi {{candidate_name}},

{{company}} vui mừng gửi đến bạn thư đề nghị nhận việc cho vị trí {{position}}.

Đây là thư offer theo mẫu tuyển dụng — chưa thay thế hợp đồng chính thức. Vui lòng phản hồi chấp nhận / từ chối theo hướng dẫn của bộ phận Nhân sự.

Trân trọng,
Phòng Nhân sự — {{company}}`,
  },
};

export function isStandardRecMailTemplateCode(code: string): boolean {
  return (DEFAULT_MAIL_TEMPLATE_CODES as readonly string[]).includes(
    code.trim().toLowerCase(),
  );
}

export function isValidRecMailTemplateCode(code: string): boolean {
  return REC_MAIL_TEMPLATE_CODE_RE.test(code.trim().toLowerCase());
}

export function fillRecMailTemplatePlaceholders(
  template: string,
  vars: RecMailTemplateVars,
): string {
  return template
    .replaceAll('{{candidate_name}}', vars.candidate_name || 'Ứng viên')
    .replaceAll('{{position}}', vars.position || 'Vị trí tuyển dụng')
    .replaceAll('{{company}}', vars.company || 'Công ty');
}

export function getDefaultRecMailTemplateCatalog(): RecMailTemplateCatalogItem[] {
  return DEFAULT_MAIL_TEMPLATE_CODES.map((code) => {
    const raw = DEFAULTS[code];
    return {
      code,
      label_vi: LABEL_VI[code] ?? code,
      subject: raw.subject,
      body: raw.body,
      active: true,
    };
  });
}

function parseCatalogRows(stored: unknown): unknown[] {
  if (Array.isArray(stored)) return stored;
  if (stored && typeof stored === 'object') {
    const items = (stored as { items?: unknown; templates?: unknown }).items;
    const templates = (stored as { templates?: unknown }).templates;
    if (Array.isArray(items)) return items;
    if (Array.isArray(templates)) return templates;
  }
  return [];
}

function rowToItem(
  row: Record<string, unknown>,
  fallback?: RecMailTemplateCatalogItem,
): RecMailTemplateCatalogItem | null {
  const code = String(row.code ?? '')
    .trim()
    .toLowerCase();
  if (!isValidRecMailTemplateCode(code)) return null;
  const label =
    typeof row.label_vi === 'string' && row.label_vi.trim()
      ? row.label_vi.trim()
      : typeof row.label === 'string' && row.label.trim()
        ? row.label.trim()
        : (fallback?.label_vi ?? code);
  const subject =
    typeof row.subject === 'string' && row.subject.trim()
      ? row.subject.trim()
      : (fallback?.subject ?? `[{{company}}] Thư tuyển dụng — {{position}}`);
  const body =
    typeof row.body === 'string' && row.body.trim()
      ? row.body.trim()
      : (fallback?.body ??
        `Kính gửi {{candidate_name}},\n\nNội dung thư từ {{company}}.\n\nTrân trọng.`);
  const active =
    typeof row.active === 'boolean'
      ? row.active
      : row.active === 'false' || row.active === 0
        ? false
        : (fallback?.active ?? true);
  return { code, label_vi: label, subject, body, active };
}

/**
 * Merge stored KV with defaults:
 * - 3 standard codes always first (override from stored when present)
 * - additional custom codes appended (create/update/delete via full PUT)
 */
export function mergeRecMailTemplateCatalog(
  stored: unknown,
): RecMailTemplateCatalogItem[] {
  const defaults = getDefaultRecMailTemplateCatalog();
  const byCode = new Map(defaults.map((d) => [d.code, { ...d }]));
  const customOrder: string[] = [];

  for (const raw of parseCatalogRows(stored)) {
    if (!raw || typeof raw !== 'object') continue;
    const rawCode = String((raw as { code?: unknown }).code ?? '')
      .trim()
      .toLowerCase();
    const parsed = rowToItem(raw as Record<string, unknown>, byCode.get(rawCode));
    if (!parsed) continue;
    if (isStandardRecMailTemplateCode(parsed.code)) {
      byCode.set(parsed.code, parsed);
      continue;
    }
    if (!byCode.has(parsed.code)) {
      customOrder.push(parsed.code);
    }
    byCode.set(parsed.code, parsed);
  }

  const standards = DEFAULT_MAIL_TEMPLATE_CODES.map((code) => byCode.get(code)!);
  const customs = customOrder
    .map((code) => byCode.get(code))
    .filter((x): x is RecMailTemplateCatalogItem => Boolean(x));

  const merged = [...standards, ...customs];
  if (merged.length > REC_MAIL_TEMPLATE_CATALOG_MAX) {
    return merged.slice(0, REC_MAIL_TEMPLATE_CATALOG_MAX);
  }
  return merged;
}

export function resolveRecMailTemplateContent(input: {
  templateCode: string;
  subject?: string | null;
  body?: string | null;
  catalogSubject?: string | null;
  catalogBody?: string | null;
  vars: RecMailTemplateVars;
}): RecMailTemplateContent {
  const code = input.templateCode.trim();
  const defaults = DEFAULTS[code] ?? {
    subject: `[{{company}}] Thư tuyển dụng — {{position}}`,
    body: `Kính gửi {{candidate_name}},\n\nNội dung thư tuyển dụng từ {{company}}.\n\nTrân trọng.`,
  };
  const subjectRaw =
    typeof input.subject === 'string' && input.subject.trim()
      ? input.subject.trim()
      : typeof input.catalogSubject === 'string' && input.catalogSubject.trim()
        ? input.catalogSubject.trim()
        : defaults.subject;
  const bodyRaw =
    typeof input.body === 'string' && input.body.trim()
      ? input.body.trim()
      : typeof input.catalogBody === 'string' && input.catalogBody.trim()
        ? input.catalogBody.trim()
        : defaults.body;
  return {
    subject: fillRecMailTemplatePlaceholders(subjectRaw, input.vars),
    body: fillRecMailTemplatePlaceholders(bodyRaw, input.vars),
  };
}

export function getDefaultRecMailTemplateRaw(
  templateCode: string,
): RecMailTemplateContent {
  const code = templateCode.trim();
  return (
    DEFAULTS[code] ?? {
      subject: '[{{company}}] Thư tuyển dụng — {{position}}',
      body: `Kính gửi {{candidate_name}},\n\nNội dung thư tuyển dụng từ {{company}}.\n\nTrân trọng.`,
    }
  );
}
