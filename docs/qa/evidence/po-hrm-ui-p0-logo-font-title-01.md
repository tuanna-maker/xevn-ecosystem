# PO-HRM-UI-P0-LOGO-FONT-TITLE-01 — Dev-FE evidence

**work_item_id:** `PO-HRM-UI-P0-LOGO-FONT-TITLE-01`  
**role:** dev-fe  
**date:** 2026-08-06  
**slice:** `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` (P0 UI only)  
**ack_status:** `READY_FOR_QA`

## Sponsor literal (closed this seat)

1. Logo popup/dialog — nền trắng / SURFACE (không bg đen)  
2. Font toàn hệ to hơn + nét hơn (root scale)  
3. Popup thêm mới — trường Tiêu đề đứng đầu form  

**Out of scope (must_keep):** JD dynamic drag builder · remaster_program_done · invent gradient/purple · U65 seed

---

## 1) Logo dialog — root cause + before/after

### Root cause

| Layer | Before | After |
|-------|--------|-------|
| CSS `.xevn-dialog-wordmark` (HRM + portal) | `background-color: var(--xevn-color-brand-shell)` → **`#000000`** | `background-color: var(--xevn-color-surface)` → **`#ffffff`** |
| `DialogHeader` / `AlertDialogHeader` img | class `xevn-dialog-wordmark` only | `xevn-dialog-wordmark !bg-white` (belt + suspenders vs shell override) |
| Portal `ConfirmDialog` wordmark | same black CSS | `!bg-white` + SURFACE CSS |
| Login LOGO-02 | already SURFACE / `!bg-white` | **untouched** |

ADR §7: `--xevn-color-brand-shell #000` = **login/splash only** — dialog chrome was incorrectly reusing it.

### Computed style notes (QA browser check)

Open any HRM Dialog (e.g. Recruitment → Tạo tin tuyển dụng) or AlertDialog confirm:

```
[data-testid="xevn-dialog-wordmark"]  OR  img.xevn-dialog-wordmark
  background-color: rgb(255, 255, 255)   /* expected — NOT rgb(0,0,0) */
  width/height: 32px
```

AlertDialog: `[data-testid="xevn-alert-dialog-wordmark"]` same white pad.

Portal ConfirmDialog: `.xevn-dialog-wordmark` → white pad (parent CSS lockstep).

---

## 2) Font — root cause (87.5% vs density) + fix

| Surface | Before | Effective rem | After | Effective rem |
|---------|--------|---------------|-------|---------------|
| HRM `html` | `font-size: 87.5%` | **14px** | `font-size: 100%` | **16px** |
| Portal `html` | `calc(100% * var(--xevn-ui-density, 0.9))` | **~14.4px** | default density **1.0** | **16px** |
| `uiDensity.ts` DEFAULT | `0.9` | — | `1` | — |
| x-bos-core `html` | `87.5%` | 14px | `100%` | 16px |

**Sharper (“nét hơn”):**

- `body { font-weight: 500 }` (HRM + portal)  
- `.xevn-type-label { font-weight: 600 }` (was 500)  
- antialiased kept  

Aligns ADR §7 type floor: *body ≥15 prefer 16*. Absolute title floor 20px / dialog center R2 / login white pad **unchanged**.

---

## 3) Title-first dialogs

| Dialog | File | Change |
|--------|------|--------|
| Tạo / Sửa tin tuyển dụng | `JobPostingsTab.tsx` | `title` moved **above** Basic Info h3; `data-testid="rec-job-form-title"`; autoFocus |
| Thêm / Sửa JD template | `JobTemplatesTab.tsx` | `title` **before** code + position grid (was 3rd) |
| Tạo yêu cầu tuyển dụng | `JobRequisitionsTab.tsx` | `title` **before** JD library picker; `applyTemplate` still fills title only if empty |

**Already title-first (no reorder):** `HeadcountProposalTab` create.

**Not reordered:** Campaign form uses `name` as campaign name (not `title` spine); JD dynamic builder deferred to BA/SA.

---

## 4) Verify (agent)

```text
web-portal: vitest uiDensity.test.ts + ConfirmDialog.test.tsx → 7/7 PASS
hrm:        vitest dialogCenter.source.test.ts → 9/9 PASS
  (includes P0 white-pad + html 100% source locks)
```

U65: no seed. Browser QA required for visual white pad + title-first click path.

---

## 5) Files touched

- `apps/web/hrm/src/components/ui/dialog.tsx`
- `apps/web/hrm/src/components/ui/alert-dialog.tsx`
- `apps/web/hrm/src/components/ui/dialogCenter.source.test.ts`
- `apps/web/hrm/src/index.css`
- `apps/web/web-portal/src/index.css`
- `apps/web/web-portal/src/config/uiDensity.ts` (+ test)
- `apps/web/web-portal/src/components/common/ConfirmDialog.tsx` (chrome parity)
- `apps/web/x-bos-core/src/index.css`
- `apps/web/hrm/src/components/recruitment/JobPostingsTab.tsx`
- `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx`
- `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx`

---

## completion_report

**Closed:** Dialog/AlertDialog/ConfirmDialog wordmark white SURFACE pad; enterprise root 16px (HRM/portal/x-bos-core); title-first on create-job + JD template + YCTD create; CODE-MEMORY APPEND; source vitest locks.

**Residual:** Browser U65 visual confirm (wordmark computed bg white; create-job title first focus); JD dynamic TopCV wave still with ba/sa — not this seat.

---

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QA
role: qa
entry_criteria: L0 stack up; U65 browser-only zero-seed; evidence FE READY @ docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md
persona: ceo@xe.vn / Xevn@2026
hdsd_align: Recruitment → Tin tuyển dụng → Tạo; Thư viện JD → Thêm; YCTD → Tạo
AC:
1) Open create-job Dialog — wordmark pad WHITE (DevTools background-color rgb(255,255,255)); same AlertDialog confirm if opened
2) Portal ConfirmDialog (any CC confirm) wordmark white if exercised
3) Body/root larger: html computed font-size 16px (not 14 / 14.4)
4) Create job form: first field = Tiêu đề (testid rec-job-form-title); JD template create: Tiêu đề before Mã JD; YCTD: Tiêu đề before JD picker
cấm: seed; remaster_program_done; JD drag builder scope
exit_criteria: evidence append PASS/FAIL + screenshots; PASS_TO_PM or FAIL with defect ids
evidence_path: docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qa.md
```

**ack_status:** `READY_FOR_QA`
