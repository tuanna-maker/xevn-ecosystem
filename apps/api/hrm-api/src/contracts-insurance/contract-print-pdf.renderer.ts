/**
 * @CODE-MEMORY
 * Screen:     HRM HĐLĐ print PDF binary (F-CORE-CTR-PDF-01)
 * UC:         FR-UC-BP-CORE-09c · AC-CTR-PRINT-05
 * BR:         VAL-CTR-09 · snapshot-immutable
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §D AC-CTR-PRINT-05
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md §9.3
 * DB_DESIGN:  docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §5.12
 * API_DESIGN: DATA-01 F-CORE-CTR-PDF-01
 * Purpose:    Render application/pdf từ merged_fields + clauses_snapshot (không merge live library).
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-BE-02
 * Coded:      2026-08-07
 * Callers:    contract-legal-print.service.ts renderPrintVersionPdf
 * Callees:    pdfkit · NotoSans-Regular.ttf (Unicode VI)
 * FEActions:  GET …/print-versions/:id/pdf → Blob download
 * BEChain:    issued version → PDFDocument → Buffer %PDF
 * Impact:     Sai snapshot → PDF lệch preview; thiếu font → mất dấu tiếng Việt
 * must_keep:  print from frozen snapshot only · no live library · salary off body
 * SOLID:      Renderer tách service (SRP) — dễ thay engine sau
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-be-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-02
 * change_mode: ADD
 * What: PDFKit binary engine + NotoSans Unicode font
 * Why: QC GWC CONDITION Q-CTR-02 — replace HTML stub with application/pdf
 * must_keep: HTML ?format=html debug; scope/soft-delete on caller; honesty false
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import PDFDocument from 'pdfkit';

/** Minimal clause shape from frozen print snapshot (avoid circular import with service). */
export type ContractPrintClauseSnapshot = {
  code: string;
  title_vi: string;
  body_vi: string;
  sort_order?: number;
};

export type ContractPrintPdfInput = {
  contract_id: string;
  version_no: number;
  pack_code: string;
  merged_fields: Record<string, unknown>;
  clauses: ContractPrintClauseSnapshot[];
};

function fieldText(merged: Record<string, unknown>, key: string): string {
  const v = merged[key];
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

function resolveUnicodeFontPath(): string | null {
  const bundled = join(__dirname, 'assets', 'fonts', 'NotoSans-Regular.ttf');
  if (existsSync(bundled)) return bundled;
  const candidates = [
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\Arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Build PDF binary from frozen print snapshot. Magic bytes start with %PDF.
 */
export async function renderContractPrintPdfBuffer(
  input: ContractPrintPdfInput,
): Promise<Buffer> {
  const fontPath = resolveUnicodeFontPath();
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: `HDLD ${fieldText(input.merged_fields, 'contract_code')} v${input.version_no}`,
      Author: 'XeVN HRM',
      Subject: 'Hop dong lao dong — print version snapshot',
    },
  });

  if (fontPath) {
    doc.registerFont('ContractBody', fontPath);
    doc.font('ContractBody');
  } else {
    doc.font('Helvetica');
  }

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const merged = input.merged_fields;
  doc.fontSize(16).text('HỢP ĐỒNG LAO ĐỘNG', { align: 'center' });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .text(
      `Số: ${fieldText(merged, 'contract_code')} · Gói: ${input.pack_code} · v${input.version_no}`,
      { align: 'center' },
    );
  doc.moveDown();
  doc.fontSize(10);
  doc.text(
    `Bên B (Người lao động): ${fieldText(merged, 'employee_full_name')}`,
  );
  doc.text(`Công việc: ${fieldText(merged, 'job_title')}`);
  doc.text(`Địa điểm làm việc: ${fieldText(merged, 'work_location')}`);
  doc.text(
    `Hiệu lực: ${fieldText(merged, 'effective_from')} → ${fieldText(merged, 'effective_to')}`,
  );
  doc.moveDown();

  const clauses = [...input.clauses].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  clauses.forEach((c, idx) => {
    const rawTitle = (c.title_vi || c.code).trim();
    const formattedTitle = /^điều\s+\d+/i.test(rawTitle)
      ? rawTitle
      : `Điều ${idx + 1}. ${rawTitle}`;
    doc.fontSize(11).text(formattedTitle, { underline: false });
    doc.moveDown(0.25);
    doc.fontSize(10).text(c.body_vi || '', { align: 'justify' });
    doc.moveDown(0.75);
  });

  doc.moveDown();
  doc
    .fontSize(8)
    .fillColor('#555555')
    .text(
      `Phiên bản in snapshot · contract_id=${input.contract_id} · engine=pdfkit`,
      { align: 'left' },
    );

  doc.end();
  return done;
}

/** HTML debug fallback — same snapshot fields as PDF (not live library). */
export function renderContractPrintHtmlDocument(
  input: ContractPrintPdfInput,
): string {
  const merged = input.merged_fields;
  const clauseHtml = [...input.clauses]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c, idx) => {
      const rawTitle = (c.title_vi || c.code).trim();
      const formattedTitle = /^điều\s+\d+/i.test(rawTitle)
        ? rawTitle
        : `Điều ${idx + 1}. ${rawTitle}`;
      return `<section><h3>${escapeHtml(formattedTitle)}</h3><p>${escapeHtml(c.body_vi || '')}</p></section>`;
    })
    .join('\n');
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><title>HĐLĐ ${escapeHtml(fieldText(merged, 'contract_code'))}</title></head>
<body>
  <h1>HỢP ĐỒNG LAO ĐỘNG</h1>
  <p>Số: ${escapeHtml(fieldText(merged, 'contract_code'))} · Gói: ${escapeHtml(input.pack_code)} · v${input.version_no}</p>
  <p>Bên B: ${escapeHtml(fieldText(merged, 'employee_full_name'))}</p>
  <p>Công việc: ${escapeHtml(fieldText(merged, 'job_title'))} · Địa điểm: ${escapeHtml(fieldText(merged, 'work_location'))}</p>
  <p>Hiệu lực: ${escapeHtml(fieldText(merged, 'effective_from'))} → ${escapeHtml(fieldText(merged, 'effective_to'))}</p>
  ${clauseHtml}
  <p><em>HTML debug fallback (?format=html) — cùng snapshot với PDF binary</em></p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
