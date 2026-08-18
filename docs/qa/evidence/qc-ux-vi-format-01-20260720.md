# QC-UX-VI-FORMAT-01 — Go/No-Go gate (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-UX-VI-FORMAT-01` |
| **from_role** | qc |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** |
| **scope** | Bounded UX vi-VN format wave: shared util + HRM Top20 money (sampled) + portal MUST money + CC `ViDateInput` |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` · rule `.cursor/rules/uiux-quality-accessibility.mdc` |
| **qa_evidence** | `qa-ux-vi-format-01-r2-hrm-20260720.md` · `qa-ux-vi-format-date-blur-01-20260720.md` · `qa-ux-vi-format-portal-01-20260720.md` (money 1–4; date closed R2) |
| **inventory** | `docs/qa/evidence/d-ux-vi-format-inventory-01-20260720.md` |
| **U65** | respected — browser FE-only; no seed; no Phase1/PROD claim |
| **portal_url** | `http://127.0.0.1:5173` (QA persona `ceo@xe.vn`) |

---

## Verdict summary

**GO WITH CONDITIONS** on the **bounded sponsor lock slice** (date display/entry on wired surfaces + MUST money thousand-group + numeric API payload). **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT full-project UX format closure** while inventory `type=date` gap remains.

---

## Evidence pack verification

| Path | verify:qc:evidence-pack | Notes |
|------|-------------------------|-------|
| `qa-ux-vi-format-01-r2-hrm-20260720.md` | **FAIL** (7/8) | Missing `journey_l25` label |
| `qa-ux-vi-format-date-blur-01-20260720.md` | **FAIL** (6/8) | Missing `journey_l25`, `crud_or_matrix` |
| `qa-ux-vi-format-portal-01-20260720.md` | **FAIL** (6/8) | Prior FAIL sample 5 **closed** by date-blur retest; pack format gaps remain |

**Classification:** **PROCESS** — missing J-* / CRUD matrix labels in QA MD; **not product NO-GO** for this bounded UX AC wave (precedent: QC residual gates 2026-07-20 — process pack ≠ product reopen). PM may optionally dispatch QA pack polish; **does not block** format GWC.

---

## L0 spot-check (QC)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm-api **200** · xbos-api **200** · portal **200** (Node exit noise on Windows — HTTP checks PASS) |

QA session L0 also PASS on all three evidence files.

---

## AC audit vs `UX_VI_DATE_NUMBER_FORMAT_AC.md`

| AC | In-scope evidence | QC audit |
|----|-------------------|----------|
| **AC-UX-DATE-01** display | HRM contracts/profile `dd/MM/yyyy`; CC `firstIssueDate` display; payroll period `05/2026` | **PASS** |
| **AC-UX-DATE-02** entry + F5 | CC sample 5: type `20/07/2026` → PUT ISO `2026-07-20` → F5 **`20/07/2026`** (date-blur retest); HRM compensation effective `20/07/2026` + F5 stable | **PASS** (wired surfaces) |
| **AC-UX-NUM-01** typing MUST | Portal charter/contributed/creditLimit/maxAmount; HRM ViMoney base + allowances; insurance BH base | **PASS** |
| **AC-UX-NUM-02** submit numeric | Network bodies numeric (`20000000`, `55500000`, …); no `"20.000.000"` strings | **PASS** |
| **AC-UX-NUM-03** EXEMPT | Shareholder `ratioPercent` spinbutton plain `10`; insurance tỷ lệ % plain | **PASS** |
| **AC-UX-NUM-04** read-only parity | Payroll list `17.190.000 ₫`; insurance preview grouped ₫ | **PASS** (spot) |

**Prior P0 closed:** `D-UX-VI-COMP-PANEL-LINES-MAP-01` — Đãi ngộ no `active.lines.map` crash when package lacks `lines`.

**Prior P1 closed:** `D-UX-VI-FORMAT-DATE-BLUR-01` — CC `firstIssueDate` blur→parent ISO→Lưu→F5.

---

## UF / journey mapping (bounded — not full L2.5 sweep)

| Id | Role | Result | Notes |
|----|------|--------|-------|
| UF-XBOS-03/05 | Portal charter + contributed | **PASS** | Samples 1–2 + date-blur R1/R2 |
| UF-HRM-03 | Compensation Đãi ngộ | **PASS** | R2 core matrix |
| UF-HRM-04 | Insurance money typing | **PASS** | Spot (no Save — format only) |
| UF-HRM-06 | Payroll display | **PASS** | List grouping spot |
| UF-HRM-12 | Job salary_min/max | **not promoted** | Defer optional QA |
| J-HRM-03 | Employee contract/comp smoke | **implicit PASS** | Via UF-HRM-03 click path; label absent in QA pack (process) |

**L2.5 note:** Wave is **UX format AC**, not cross-nav journey closure. Full `PROGRAM_JOURNEY_MAP.md` J-* sweep **out of scope** this gate.

---

## Conditions (OPEN)

| ID | Severity | Condition | Owner / trigger |
|----|----------|-----------|-----------------|
| **C-UX-VI-01** | gate | **NOT Phase 1 DONE** · **NOT PROD-READY** | QC standing |
| **C-UX-VI-02** | P2 defer | **Wave 2:** ~40+ HRM + portal native `type=date` entry fields (inventory §B2) — display mostly `dd/MM/yyyy`; entry chrome not migrated | `D-UX-VI-FORMAT-DATE-WAVE2-01` when PM schedules |
| **C-UX-VI-03** | P3 defer | UF-HRM-12 recruitment `salary_min`/`salary_max` typing not promoted | optional QA |
| **C-UX-VI-04** | P2 product | `R-UX-VI-COMP-POST-404` — POST `/compensation-packages` **404** after numeric body built — **persistence**, not format AC fail | PM → `dev-be` if create must work |
| **C-UX-VI-05** | process | QA packs missing `journey_l25` / `crud_or_matrix` sections — add J-HRM-03 + UF row in consolidated retest | optional `qa` pack polish |
| **C-UX-VI-06** | scope | Remaining Top20 money fields not browser-spotted (AdvanceRequests, BonusPolicy fixed amount, HeadcountProposal, …) — wired in FE evidence but not all QA-typed | accept for GWC; expand QA on wave 2 or spot matrix |

---

## Residual classification

| Item | Class | Blocks GWC? |
|------|-------|-------------|
| Inventory `type=date` gap | **PRODUCT defer** | No — explicitly wave 2 |
| Compensation POST 404 | **PRODUCT** P2 | No — format AC met; persistence separate |
| Job salary typing untested | **PRODUCT** P3 | No |
| QA pack verify FAIL | **PROCESS** | No |
| Charter restored 55.500.000 | hygiene **CLOSED** | — |

---

## Controls respected

- No seed in QA evidence paths
- No Phase1 / PROD claim in QA or this gate
- EXEMPT fields (% ratio, page size) not regressed
- Prior portal money samples 1–4 remain valid; sample 5 date defect closed in R2

---

## completion_report

**Closed (QC):** Audited three QA evidence packs against `UX_VI_DATE_NUMBER_FORMAT_AC.md`; product AC PASS on in-scope shared + HRM compensation/insurance/payroll samples + portal MUST money + CC ViDateInput date blur fix; P0 lines.map crash and P1 date-blur defects closed; L0 stack 200 spot-check.

**Open (standing):** Wave 2 `type=date` inventory; optional UF-HRM-12 typing; compensation POST 404 triage; QA pack process labels; partial Top20 money QA coverage.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PM-UX-VI-FORMAT-CLOSE-01
from_role: qc
to_role: pm
lane: governance
ack: PASS_TO_PM
evidence: docs/qa/evidence/qc-ux-vi-format-01-20260720.md
summary: QC GO WITH CONDITIONS on bounded vi-VN format wave — money group + numeric payload + wired date entry PASS; wave 2 defer native type=date inventory; NOT Phase1/PROD.
optional_dispatch:
  - dev-be R-UX-VI-COMP-POST-404 if create compensation must work on env
  - D-UX-VI-FORMAT-DATE-WAVE2-01 when PM prioritizes inventory §B2 type=date migration
  - qa pack polish (journey_l25 labels) — process only
cấm: seed · Phase1 DONE · PROD claim · full-project PASS while inventory open
```

## ack_status

**PASS_TO_PM**
