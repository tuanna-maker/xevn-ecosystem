# QA-UX-VI-FORMAT-PORTAL-01 — Browser evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-UX-VI-FORMAT-PORTAL-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` |
| **evidence_dev** | `docs/qa/evidence/d-ux-vi-format-portal-01-fe-20260720.md` |
| **persona** | `ceo@xe.vn` / portal `:5173` |
| **L0** | PASS — hrm-api `:28001` 200 · xbos-api `:28002` 200 · portal `:5173` 200 |
| **U65** | zero-seed · browser FE only |
| **ack_status** | **FAIL_TO_PM** |
| **unit** | `pnpm --filter web-portal test -- src/utils/viNumberFormat.test.ts` → **10/10 PASS** |

---

## Verdict summary

| # | Sample | Typing / display | Network body | F5 | Result |
|---|--------|------------------|--------------|-----|--------|
| 1 | Charter capital | `20000000` → **`20.000.000`** | `charterCapital: 20000000` (number) PUT **200** | **`20.000.000`** | **PASS** |
| 2 | Shareholder `contributedValue` + ratio % | góp → **`20.000.000`**; ratio **`10`** `type=number` (no `1.000`) | `contributedValue: 20000000`, `ratioPercent: 10` PUT **200** | góp **`20.000.000`**; ratios `10` | **PASS** |
| 3 | Vendors `creditLimit` | → **`20.000.000`**; discount % stays spinbutton | `creditLimit: 20000000` PUT **200** `/api/xbos/business-master/vendors/items/…` | n/a (create) | **PASS** |
| 4 | Expense `maxAmountNoApproval` | → **`20.000.000`** | `maxAmountNoApproval: 20000000` PUT **200** `/api/xbos/business-master/expense_categories/items/…` | n/a (create) | **PASS** |
| 5 | CC `firstIssueDate` | Display existing **`16/07/2026`**; entry UI accepts **`20/07/2026`** | After Lưu: still `establishedAt` / `payload.companyForm.firstIssueDate` = **`2026-07-16`** (not `2026-07-20`) | Date unchanged **`16/07/2026`** | **FAIL** |

**Overall: FAIL** — money MUST samples 1–4 meet AC-UX-NUM-01/02; date sample 5 fails AC-UX-DATE-02 (entry → store ISO → F5).

---

## Sample detail

### 1) Charter capital (UF-XBOS / CC Đơn vị thành viên)

- Path: `/command-center?settings=company_member_units` → Chỉnh sửa **Tập đoàn XeVN**
- Before: UI `55.500.000`
- Action: clear + type `20000000` (slow) → UI **`20.000.000`** before submit
- Network: `PUT /api/xbos/org-foundation/legal-entities/20109cf3-…` **200**  
  body includes `"charterCapital":20000000` (numeric, no `"20.000.000"`)
- F5 / re-open: charter **`20.000.000`**
- AC: AC-UX-NUM-01 / AC-UX-NUM-02 **PASS**

### 2) Shareholder contributedValue + ratio EXEMPT

- Same legal entity form — cổ đông **anh Nam**
- Type `20000000` into **Giá trị góp** → **`20.000.000`**
- Ratio spinbutton remains **`10`** (`type=number`) — EXEMPT % untouched
- Network: `PUT …/shareholders/1cfcb5cd-…` **200**  
  `{"holderName":"anh Nam","ratioPercent":10,"contributedValue":20000000}`
- F5: góp **`20.000.000`**, ratios `10` / `10`
- AC: AC-UX-NUM-01/02 + AC-UX-NUM-03 (ratio) **PASS**

### 3) Settings Vendors `creditLimit`

- Path: `/dashboard/settings/vendors` → **Thêm đối tác mới**
- Field **Hạn mức công nợ** — type `20000000` → **`20.000.000`**
- Chiết khấu (%) remains `type=number` spinbutton (EXEMPT)
- Network: `PUT /api/xbos/business-master/vendors/items/vnd-1784537098696` **200**  
  `"creditLimit":20000000`
- Created code `QA-VI-98573` (FE flow; not seed)
- AC: AC-UX-NUM-01/02 **PASS**

### 4) Settings Expense `maxAmountNoApproval`

- Path: `/dashboard/settings/expense-categories` → **Thêm loại chi phí**
- Field **Mức tối đa không cần duyệt** — UI **`20.000.000`** after type
- Fill required: code `QA-EXP-01`, name `QA VI Expense Format`, account `6277` → **Thêm mới**
- Network: `PUT /api/xbos/business-master/expense_categories/items/exp-1784537157818` **200**  
  `"maxAmountNoApproval":20000000`
- AC: AC-UX-NUM-01/02 **PASS**

### 5) CC `firstIssueDate` — FAIL mutate

- Component: `ViDateInput` (commit ISO **on blur** only — `packages/ui/src/components/ViDateInput.tsx`)
- **Display PASS:** loaded value shown as **`16/07/2026`** (not ISO-Z); placeholder `dd/MM/yyyy`
- **Entry UI:** typed **`20/07/2026`**; blur via click **Mã số thuế** (draft remained `20/07/2026`)
- **Network FAIL:** subsequent `PUT` legal-entity still sent:
  - `establishedAt: "2026-07-16"`
  - `payload.companyForm.firstIssueDate: "2026-07-16"`
- Parent `companyForm.firstIssueDate` did **not** receive `2026-07-20` before save
- Unit helper PASS: `parseViDisplayToIsoDate('20/07/2026') === '2026-07-20'` (vitest)
- AC: AC-UX-DATE-01 display **PASS**; AC-UX-DATE-02 entry+store+F5 **FAIL**

**Hypothesis for Dev-FE:** `ViDateInput` draft updates on `onChange`, but `onValueChange(iso)` on blur is not reliably applied to `CommandCenterPage` `companyForm` before **Lưu thay đổi** (or save path ignores draft). Needs React blur/commit fix or commit-on-change for valid complete dates.

---

## Residual / data hygiene

| Item | Severity | Owner |
|------|----------|-------|
| `firstIssueDate` blur → parent state / Network ISO | **P1** | `dev-fe` — `D-UX-VI-FORMAT-DATE-BLUR-01` |
| Holding charter left at **20.000.000** (was 55.500.000) after money sample | P2 hygiene | restore via FE to `55.500.000` when fixing / after retest |
| QA vendor `QA-VI-*` + expense `QA-EXP-01` created via FE | OK U65 | optional cleanup later |
| Concurrent HRM soft-nav on shared browser tab mid-session | noise | not product defect |

---

## Cấm respected

- No `pnpm seed:*` · no API-only PASS for samples 1–4 · no Phase1/PROD claim · CC shareholder money path not rewritten beyond format verification

---

## completion_report

**Closed:** L0 PASS; browser samples 1–4 (charter, contributedValue+ratio EXEMPT, vendors creditLimit, expense maxAmountNoApproval) PASS typing vi-VN group + Network numeric. Unit viNumberFormat 10/10 PASS.

**Open:** Sample 5 `firstIssueDate` — display dd/MM/yyyy OK; **Save does not persist newly entered date as ISO** (Network kept `2026-07-16`). Overall **FAIL_TO_PM**.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: D-UX-VI-FORMAT-DATE-BLUR-01
from_role: pm
to_role: dev-fe
lane: execution
entry_criteria: QA-UX-VI-FORMAT-PORTAL-01 FAIL sample 5; L0; U65
spec_ref: docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md AC-UX-DATE-02 · ViDateInput onBlur
evidence_qa: docs/qa/evidence/qa-ux-vi-format-portal-01-20260720.md

Fix: CC company firstIssueDate — type dd/MM/yyyy → blur → companyForm.firstIssueDate ISO yyyy-MM-dd → Lưu PUT establishedAt + payload.companyForm.firstIssueDate match; F5 still dd/MM/yyyy.
must_keep: charter/contributedValue grouping; shareholder ratio % EXEMPT; vendors/expense numeric payloads.
Also restore holding charterCapital to 55500000 via FE if still 20000000.
exit: READY_FOR_QA · evidence docs/qa/evidence/d-ux-vi-format-date-blur-01-fe-20260720.md
cấm: seed · break CC shareholder · Phase1/PROD
```

## ack_status

**FAIL_TO_PM**
