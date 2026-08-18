# QC Gate Decision — QC-HRM-U72-FIELD-DISPLAY-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-U72-FIELD-DISPLAY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` (re-dispatch **qa** for pack repair) |
| **execution_date** | `2026-07-27` |
| **decision** | **NO-GO (process)** |
| **slice** | HRM U72 field display / label-leak — **local** `:5173` / `:28001` / `:28002` only |
| **qa_handoff** | `docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md` (claims **PASS** / `PASS_TO_PM`) |
| **spec** | `docs/hrm/SRS_FIELD_DISPLAY.md` §2–§4 · AC-FD-01..13 · AC-CO-IND-02 · AC-U72-GLOBAL |
| **rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · QA runtime `seed: false` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** · local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen** | **No** — process pack gap only; no Dev reopen for QA PASS items |

---

## 1. Scope audited

**In scope (this gate):**
- AC-FD-01..13 + AC-FD-U01..U06 + AC-CO-IND-02 + AC-U72-GLOBAL vs QA evidence
- Evidence pack gate (`verify:qc:evidence-pack`) before any GO/GWC
- Soft residual note: LeaveTab `resolveLeaveTypeLabel` raw fallback on catalog miss = **P2 condition OK** (when product gate opens)
- Locks: U65 zero-seed · HOLD_DEPLOY · no Phase1/PROD/:8088 claim

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` · matrix Dev8088 promote · Dev reopen for PASS label surfaces

---

## 2. Evidence pack gate (blocking)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
→ FAIL: QC evidence pack incomplete (2/8 checks)
  - journey_l25: List at least one J-* journey id from PROGRAM_JOURNEY_MAP.md with PASS/FAIL
  - crud_or_matrix: CRUD matrix, read-only module table, or L2.5 journey matrix with PASS rows
```

| Check | Result |
|-------|--------|
| Pack integrity | **FAIL 6/8** — missing `journey_l25` + `crud_or_matrix` |
| Root cause | QA MD has AC matrix with `\| **PASS**` but **no** `J-*` id and **no** token `L2.5` / `journey` / `read-only` / CRUD matrix wording required by `scripts/verify-qc-evidence-pack.mjs` |
| QA MD readable | Yes |
| Runtime JSON | Present · `_tmp-qa-hrm-u72-field-display-01-runtime.json` · `overall: PASS` after recheck · `seed: false` |
| Leave recheck | `_tmp-qa-hrm-u72-leave-visible-runtime.json` · `rawVisible=[]` · calendar side shows **Ốm** |
| Screenshots on disk | **18** PNGs under `docs/qa/evidence/screenshots/qa-hrm-u72-field-display-01/` |

**Rule:** `.cursor/rules/qc-evidence-pack-gate.mdc` — verify FAIL ⇒ **NO-GO (process)** → return to **QA**, not Dev. QC **must not** issue GO/GWC.

---

## 3. AC audit vs SRS (provisional — not promoted)

Runtime + MD + spot screenshots **corroborate** most QA claims. Listed for repair context only — **not** a GO.

| AC | QA claim | QC corroboration | Provisional |
|----|----------|------------------|-------------|
| **AC-CO-IND-02** | industry `-`/`—`; no holding/subsidiary | PNG `01-company-industry` · Ngành nghề `-` ×5 · status VI | Would PASS |
| **AC-FD-01** | null→`—`; no male/female | runtime genderRaw=false · null fail-closed | Would PASS (positive Nam/Nữ N/D) |
| **AC-FD-02** | no full_time raw | anti-leak PASS · positive «Toàn thời gian» N/D on emp sample | Would PASS (anti-leak) |
| **AC-FD-03** | no base/PHU_CAP_* cells | runtime rawCells=[] · bodyHasVI | Would PASS |
| **AC-FD-04** | HĐ types VI | PNG contracts · `Hợp đồng thử việc` / `Có thời hạn` / `Không thời hạn` | Would PASS |
| **AC-FD-05** | no active/expired raw | runtime rawStatus=[] | Would PASS |
| **AC-FD-06** | no annual/LVT_* dashboard | runtime rawNodes=[] | Would PASS |
| **AC-FD-07** | Toàn thời gian ×6 | runtime values VI | Would PASS |
| **AC-FD-08** | no slug mono cells | slugLeak=false | Would PASS |
| **AC-FD-09** | no full UUID cells | uuidCells=[] | Would PASS |
| **AC-FD-10** | no single/married raw | raw=[] | Would PASS |
| **AC-FD-11** | N/A import preview | runtime N/A · funnel U06 cover | **N/A condition OK** |
| **AC-FD-12** | no active/draft raw | rawNodes=[] | Would PASS |
| **AC-FD-13** | no draft/Employee {uuid} | statusRaw=[] · hasVI | Would PASS |
| **AC-FD-U01..U03,U05,U06** | PASS anti-leak / `—` | runtime aligned | Would PASS |
| **AC-FD-U04** | PASS after visibility recheck · **Ốm** | leave-visible runtime `rawVisible=[]` · text contains **Ốm** | Would PASS |
| **AC-U72-GLOBAL** | no confirmed visible raw leak | rollup after recheck | Would PASS (in-scope) |

### Soft residual (pre-accepted for future GWC — not blocker of this NO-GO)

| ID | Severity | Note |
|----|----------|------|
| **R-U72-LEAVE-FALLBACK** | P2 | LeaveTab `resolveLeaveTypeLabel` still `?? code` on catalog miss — **condition OK** when product gate opens; align to `—` optional FE |
| **R-U72-POSITIVE-GENDER** | P3 | Nam/Nữ / employment positive map not live-proven (API null · U65 no seed) |
| **R-U72-AC-FD-11** | P3 | Import preview N/A this session |

### Classification

| Signal | Class | Action |
|--------|-------|--------|
| Pack missing `journey_l25` + `crud_or_matrix` | **PROCESS** | **NO-GO** → QA patch MD then re-gate QC |
| AC-FD / AC-CO-IND-02 / GLOBAL browser claims | PRODUCT | Provisional closed — **no Dev reopen** |
| LeaveTab raw fallback on miss | PRODUCT P2 soft | Condition OK on future GWC — not Dev reopen now |
| Vite ECONNRESET mid-wave | ENV | Ops note — not product NO-GO |
| `qc:dev-stack` UV assert after 200 (QA note) | ENV | Ignore for product |

---

## 4. L2.5 journey coverage (U19)

| J-* | In-scope this gate? | Status under this decision |
|-----|---------------------|----------------------------|
| **J-HRM-CO-01** | Yes (industry regression AC-CO-IND-02 + company surface) | QA exercised `/hr/company` — **not cited as J-*** in pack → **not QC-promoted** until pack 8/8 |
| **J-HRM-01** (optional cite) | Cross-nav contracts→employee labels | Not listed in QA MD |
| Other HRM/CC J-* | No | Out of slice |

**NO-GO (process)** until QA adds explicit L2.5 / J-* matrix with `| **PASS**` rows (recommended: **J-HRM-CO-01** for industry + label surfaces; optionally **J-HRM-01** if contracts→profile path claimed).

---

## 5. Conditions / locks (stand)

| ID | Statement | Owner |
|----|-----------|-------|
| **C-U72-PACK-01** | Pack repair required before any GO/GWC on this work_item | **qa** |
| **C-U72-HOLD-01** | **HOLD_DEPLOY** stands · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-U72-LEAVE-P2** | LeaveTab catalog-miss raw fallback = **P2 condition OK** (no Dev reopen for PASS items) | **pm** / optional later **dev-fe** |
| **C-U72-NO-DEV** | **No** Dev reopen for QA PASS AC rows unless pack re-gate finds product FAIL | **pm** |

---

## 6. Decision

### **NO-GO (process)**

- Fail-closed: `verify:qc:evidence-pack` **6/8** (missing journey + matrix wording).
- Product/browser substance **looks** PASS for in-scope AC-FD + AC-CO-IND-02 + AC-U72-GLOBAL (provisional) — **cannot promote**.
- Soft residual LeaveTab P2 **acknowledged OK** for future GWC — does **not** justify Dev reopen now.
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088**.
- **No seed**. **No Dev reopen** for PASS label items.

---

## 7. Handoff

### completion_report

- **Closed:** QC audit of HRM U72 field-display slice gate; pack verify executed (FAIL 2 checks); SRS AC matrix cross-checked; screenshots/runtime spot-checked; locks + P2 LeaveTab note recorded.
- **Open / blocking:** QA evidence pack missing `J-*` / `L2.5`/`journey`/`read-only` matrix wording → **NO-GO (process)**.
- **Residual (non-blocking product):** R-U72-LEAVE-FALLBACK P2; R-U72-POSITIVE-GENDER P3; AC-FD-11 N/A.

### next_owner

`qa` (then `qc` re-gate same work_item)

### next_dispatch_prompt

```text
work_item_id: QA-HRM-U72-FIELD-DISPLAY-PACK-01
from_role: pm
to_role: qa
lane: execution · U65 zero-seed · pack repair only (no product retest required unless pack edit breaks claims)
entry_criteria:
  - QC NO-GO (process): docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md
  - Source claims: docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
exit_criteria:
  1) Patch QA MD: add "## L2.5 journey matrix" with at least | J-HRM-CO-01 | industry/label spot | **PASS** | (and optional J-HRM-01 if contracts→profile claimed); include tokens L2.5 / journey so verify passes
  2) Keep AC-FD-01..13 · AC-CO-IND-02 · AC-U72-GLOBAL · LeaveTab P2 soft residual · seed:none · HOLD_DEPLOY language
  3) Do NOT seed; do NOT reopen Dev for PASS items; do NOT claim Phase1/PROD/:8088
  4) Re-run: pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md → exit 0 (8/8)
  5) ack_status READY_FOR_QC → PM Task QC-HRM-U72-FIELD-DISPLAY-01 re-gate (expect GWC local + C-U72-LEAVE-P2)
evidence_path: docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md
cấm: seed · Dev reopen for PASS AC · Phase1/PROD/:8088 claim
```

### evidence_path

`docs/qa/evidence/qc-hrm-u72-field-display-01-20260727.md`

### ack_status

**PASS_TO_PM**
