# QA-UX-VI-FORMAT-DATE-BLUR-01 — Browser retest (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-UX-VI-FORMAT-DATE-BLUR-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` AC-UX-DATE-01 / AC-UX-DATE-02 |
| **evidence_dev** | `docs/qa/evidence/d-ux-vi-format-date-blur-01-fe-20260720.md` |
| **prior_fail** | `docs/qa/evidence/qa-ux-vi-format-portal-01-20260720.md` sample 5 |
| **persona** | `ceo@xe.vn` / portal `:5173` |
| **L0** | PASS — hrm-api `:28001` 200 · xbos-api `:28002` 200 · portal `:5173` 200 |
| **U65** | zero-seed · browser FE only |
| **unit** | `pnpm --filter web-portal test -- src/utils/viNumberFormat.test.ts` → **11/11 PASS** |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict summary

| # | Check | Result |
|---|-------|--------|
| 5 | CC `firstIssueDate` type `20/07/2026` → blur MST → **Lưu** → Network ISO `2026-07-20` → re-open `dd/MM/yyyy` | **PASS** |
| R1 | Charter capital still vi-VN grouped (`20.000.000` then restore) | **PASS** (spot) |
| R2 | Shareholder `contributedValue` still `20.000.000`; ratio `%` spinbutton plain `10` | **PASS** (spot) |
| Hygiene | Holding charter restored `55500000` → UI `55.500.000` → PUT numeric **200** | **DONE** |

**Overall: PASS** — closes `D-UX-VI-FORMAT-DATE-BLUR-01` / prior portal sample-5 FAIL (AC-UX-DATE-02).

---

## Sample 5 — `firstIssueDate` (AC-UX-DATE-02)

- **Path:** `/command-center?settings=company_member_units` → **Chỉnh sửa** Tập đoàn XeVN
- **Before:** UI `16/07/2026` (dd/MM/yyyy, not ISO-Z)
- **Action:** clear + type `20/07/2026` (slow) → blur via **Mã số thuế** → **Lưu thay đổi**
- **FE after type:** draft remains `20/07/2026`
- **Network:** `PUT /api/xbos/org-foundation/legal-entities/20109cf3-0621-4921-baf7-f820be944731` **200**
  - `establishedAt: "2026-07-20"`
  - `payload.companyForm.firstIssueDate: "2026-07-20"`
  - (prior FAIL kept `2026-07-16`)
- **F5 / re-open:** navigate back to settings → Chỉnh sửa → date **`20/07/2026`**
- **AC:** AC-UX-DATE-01 display **PASS**; AC-UX-DATE-02 entry+store+F5 **PASS**

---

## Regression spot — money samples 1–2

| Field | Observation |
|-------|-------------|
| **Vốn điều lệ** | Loaded as **`20.000.000`** (grouped); typing `55500000` → **`55.500.000`** before submit |
| **Giá trị góp** (anh Nam) | Remains **`20.000.000`** |
| **Ratio %** | Spinbutton **`10`** (`type=number`) — EXEMPT unchanged |
| Charter restore PUT | `charterCapital: 55500000` (number) + still `establishedAt`/`firstIssueDate` `2026-07-20` **200** |

---

## Unit

```text
pnpm --filter web-portal test -- src/utils/viNumberFormat.test.ts
→ 11/11 PASS (includes isCompleteViDateDraft)
```

---

## Residual

| Item | Severity | Notes |
|------|----------|-------|
| Concurrent soft-nav to `/command-center/hrm/*` mid-session | noise | Shared browser tab; not product defect for this AC |
| Shareholder contributed still 20M from prior money sample | P3 hygiene | Out of scope unless PM asks restore |

---

## Cấm respected

- No `pnpm seed:*` · no API-only PASS · no Phase1/PROD claim · FE Lưu + Network + F5 only

---

## completion_report

**Closed:** Browser retest sample 5 AC-UX-DATE-02 PASS after ViDateInput commit-on-complete + flushSync blur; money grouping spot R1/R2 PASS; holding charter restored to 55.500.000 via FE; unit 11/11 PASS.

**Open:** none for this work_item.

## next_owner

`pm` (optional: `qc` residual close on portal VI date blur)

## next_dispatch_prompt

```text
work_item_id: QC-UX-VI-FORMAT-DATE-BLUR-01 (optional) OR PM close D-UX-VI-FORMAT-DATE-BLUR-01
from_role: qa
to_role: pm
ack: PASS_TO_PM
evidence: docs/qa/evidence/qa-ux-vi-format-date-blur-01-20260720.md
summary: Sample 5 firstIssueDate 20/07/2026 → PUT ISO 2026-07-20 → F5 dd/MM/yyyy PASS; money spot still grouped; charter restored 55.500.000.
cấm: seed · Phase1/PROD
```

## ack_status

**PASS_TO_PM**
