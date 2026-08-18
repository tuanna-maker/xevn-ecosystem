# QC Gate Decision — QC-HRM-U72-FIELD-DISPLAY-01 · **R3 product re-gate** (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-U72-FIELD-DISPLAY-01` |
| **gate_revision** | **R3** (product re-gate after QA-HRM-U72-FIELD-DISPLAY-02) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **slice** | HRM U72 field display / label-leak — **local** `:5173` / `:8080` / `:28001` / `:28002` only |
| **prior_decision** | **NO-GO (product)** — `docs/qa/evidence/qc-hrm-u72-field-display-01-r2-20260727.md` · **C-U72-U02-P0 OPEN** |
| **qa_evidence** | `docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md` · overall **PASS** · `PASS_TO_PM` |
| **prior_qa_maps** | `docs/qa/evidence/qa-hrm-u72-field-display-01-20260727.md` — AC-FD-01..13 (non-U02) / AC-CO-IND-02 kept |
| **fe_fix** | `docs/qa/evidence/d-hrm-u72-label-fe-02-20260727.md` · `READY_FOR_QA` |
| **spec** | `docs/hrm/SRS_FIELD_DISPLAY.md` §3 U-02 · §4 **AC-FD-U02** · **AC-U72-GLOBAL** · AC-CO-IND-02 · AC-FD-04 · F-01..F-13 |
| **rule** | `.cursor/rules/display-label-no-raw-key.mdc` · `.cursor/rules/qc-evidence-pack-gate.mdc` · U65 zero-seed |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · runtime `seed: false` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** · local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen** | **No** — U02 CLOSED; soft leave P3 = condition OK; PASS maps kept |
| **must_keep** | `resolveIndustryDisplay` · F-01..F-13 · XBOS U72 GWC slice **separate** |

---

## 0. Supersession note

| Item | R2 (prior) | R3 (this gate) |
|------|------------|----------------|
| Pack `verify:qc:evidence-pack` | **PASS 8/8** on QA-01 (C-U72-PACK-01 CLOSED) | **PASS 8/8** on QA-02 + this QC R3 MD |
| **C-U72-PACK-01** | **CLOSED** | Remains **CLOSED** — not re-opened |
| Product **AC-FD-U02** / **AC-U72-GLOBAL** | **FAIL** (`LEGAL_SPECIALIST` on HLD-0996) | **PASS · CLOSED** |
| **C-U72-U02-P0** | **OPEN** (blocker) | **CLOSED** |
| Decision | **NO-GO (product)** | **GO WITH CONDITIONS** |

Prior R1 NO-GO (process) + R2 NO-GO (product) files **retained** (history). R3 does **not** wipe R1/R2. Pack 8/8 alone **≠** product GO — U02 PASS row + runtime + screenshots audited.

---

## 1. Scope audited

**In scope (this re-gate):**
- Product close of **AC-FD-U02** / **AC-U72-GLOBAL** after FE-02 + QA-02
- Keep PASS maps: **AC-CO-IND-02** · **AC-FD-04** · **AC-FD-01..13** (non-U02) from QA-01 where still valid
- Soft leave residual = **condition OK** (P3) — **no** Dev reopen
- Locks: U65 · HOLD_DEPLOY · no Phase1/PROD/:8088 · XBOS U72 GWC **not** re-opened here

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` · matrix Dev8088 promote · Dev reopen for soft leave / PASS label surfaces

---

## 2. Evidence pack gate (mandatory)

### 2a. Upstream QA-02 pack

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

### 2b. This QC R3 evidence pack

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS |
| portal_url | PASS |
| journey_l25 | PASS |
| crud_or_matrix | PASS |
| residual_section | PASS |
| timestamp | PASS |

**Pack integrity:** **8/8**. Process pack from R2 remains **CLOSED**. Product promotion requires §3 U02 audit (below) — **not** pack score alone.

---

## 3. Product audit (blocking → CLOSED)

Corroborated from QA-02 MD + `_tmp-qa-hrm-u72-field-display-02-runtime.json` (`overall: PASS`, `seed: false`, finished `2026-07-27T08:40:41.988Z`) + screenshots on disk:

| AC / rollup | QA-02 | QC R3 | Evidence note |
|-------------|-------|-------|---------------|
| **AC-FD-U02** | **PASS** | **PASS · CLOSED** | HLD-0996 · header + «Chức vụ» = **Chuyên viên Pháp chế** · `hasJobKeyVisible=false` · `hasJobKeyInBody=false` · PNG `01-profile-u02.png` |
| **AC-FD-U02-F5** | **PASS** | **PASS · CLOSED** | Same VI after F5 · PNG `02-profile-u02-f5.png` |
| **AC-U72-GLOBAL** (spot) | **PASS** | **PASS · CLOSED** | Runtime: `U02 closed; no job_title_key leak on profile spot` |
| **AC-CO-IND-02** | **PASS** | **Keep PASS** | 5× `-` · leak=[] · PNG `04-company-industry.png` — **no Dev reopen** |
| **AC-FD-04** | **PASS** | **Keep PASS** | VI contract types · raw=0 · PNG `05-contracts.png` |
| **AC-FD-01..13** (non-U02) · U01/U03..U06 | PASS (QA-01) | **Keep PASS** | Anti-leak maps from QA-01 — not re-failed by QA-02 spot — **no Dev reopen** |
| Leave soft anti-leak | **PASS** soft | **Condition OK** | `rawVisible=[]` · VI hint · PNG `03-leave-soft.png` |
| `LEGAL_SPECIALIST` user-visible | — | **ABSENT** | String only in runtime detail *«no LEGAL_SPECIALIST»* — not in UI slices |

### Screenshot corroboration (QC spot-read)

| File | Observe |
|------|---------|
| `docs/qa/evidence/screenshots/qa-hrm-u72-field-display-02/01-profile-u02.png` | Profile card + Chức vụ show **Chuyên viên Pháp chế**; badge **HLD-0996**; **no** raw `LEGAL_SPECIALIST` |
| `02-profile-u02-f5.png` | Same after F5 |
| `03-leave-soft.png` · `04-company-industry.png` · `05-contracts.png` | Cited by QA-02; present on disk (5/5) |

### Soft residual (condition OK — not Dev reopen)

| ID | Severity | Status |
|----|----------|--------|
| **C-U72-LEAVE-P3** / R-U72-LEAVE-UNKNOWN-POSITIVE | P3 soft | **OK** — catalog-miss → `—` not force-proven under U65; visible raw=0 PASS — **no Dev reopen** |
| R-PORTAL-HRM-8080 | ENV | Portal `/hr` needs HRM Vite `:8080` — L0 checklist note; recovered in QA-02 |
| R-U72-POSITIVE-GENDER · R-U72-AC-FD-11 | P3 | N/D — U65 no seed / import N/A — OK |

### Classification

| Signal | Class | Gate impact |
|--------|-------|-------------|
| AC-FD-U02 + F5 VI label | **PRODUCT** | **CLOSED** — clears R2 NO-GO product blocker |
| AC-U72-GLOBAL (spot) | **PRODUCT** | **CLOSED** for U02 closure |
| AC-CO-IND-02 · AC-FD-04 · F-01..F-13 non-U02 | **PRODUCT** | Keep PASS — **no Dev reopen** |
| Leave unknown→— positive | **PRODUCT** P3 soft | **C-U72-LEAVE-P3** OK for GWC |
| Missing `:8080` mid-wave (QA) | **ENV** | Recovered — not product NO-GO |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Governance | Stands |

---

## 4. L2.5 journey coverage (U19)

| J-* | In-scope? | Status |
|-----|-----------|--------|
| **J-HRM-01** (cite) | Yes (profile deep link) | **PASS** — HLD-0996 profile 200 · Chức vụ VI · no scope 404 |
| **J-HRM-CO-01** | Yes | **PASS** — industry `/hr/company` · no entity_type leak |
| Label product close | Product | **PASS** AC-FD-U02 — journey + label both PASS |

U19 satisfied. Product GLOBAL spot **PASS** after U02 close.

### Read-only module matrix (promoted local)

| Module | Mode | AC / UF | Verdict |
|--------|------|---------|---------|
| Employee profile · Chức vụ / job title | **read-only** display | AC-FD-U02 · F5 | **PASS** |
| Company · Ngành nghề | **read-only** display | AC-CO-IND-02 · J-HRM-CO-01 | **PASS** |
| Contracts · loại HĐ VI | **read-only** display | AC-FD-04 | **PASS** |
| Attendance · Nghỉ phép calendar | **read-only** display | leave soft anti-leak | **PASS** soft |
| Other F-01..F-13 surfaces (QA-01) | **read-only** display | AC-FD-01..13 non-U02 | **Keep PASS** |

---

## 5. Conditions table (GWC)

| ID | Status | Statement | Owner |
|----|--------|-----------|-------|
| **C-U72-PACK-01** | **CLOSED** | Pack repair verified since R2 (8/8) | — |
| **C-U72-U02-P0** | **CLOSED** | AC-FD-U02 / AC-U72-GLOBAL — no `LEGAL_SPECIALIST` on HLD-0996 header + Chức vụ | — |
| **C-U72-HOLD-01** | Stands | **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-U72-LEAVE-P3** | OK soft | Leave catalog-miss → `—` positive path optional; visible raw=0 — **no Dev reopen** | **pm** / optional later **qa** |
| **C-U72-NO-DEV** | Stands | **No** Dev reopen of PASS AC maps / soft leave unless FAIL | **pm** |
| **C-U72-LOCAL-ONLY** | Stands | Local `:5173`/`:8080`/`:28001`/`:28002` only — **not** `:8088` | **pm** |
| **C-U72-XBOS-SEPARATE** | Stands | XBOS U72 GWC slice remains separate — not re-gated here | **pm** |

---

## 6. Decision

### **GO WITH CONDITIONS**

- Process: pack **8/8** on QA-02 + QC R3 · **C-U72-PACK-01** remains **CLOSED**.
- Product: **AC-FD-U02** + **AC-U72-GLOBAL** **CLOSED** (VI **Chuyên viên Pháp chế**; never user-visible `LEGAL_SPECIALIST`) — clears R2 **NO-GO (product)**.
- Keep PASS: **AC-CO-IND-02** · **AC-FD-04** · **F-01..F-13** (non-U02) from prior QA-01.
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088**.
- Soft leave **P3** = condition OK — **no** Dev reopen.
- **No seed**. **must_keep** `resolveIndustryDisplay` · XBOS U72 separate.

---

## 7. Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| C-U72-LEAVE-P3 / R-U72-LEAVE-UNKNOWN-POSITIVE | P3 soft | qa (later) | Optional positive path under U65 — not blocker |
| R-PORTAL-HRM-8080 | ENV | devops | Keep HRM Vite `:8080` in L0 for portal `/hr` |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Governance | pm | Honored |

**Prior P0 AC-FD-U02 / LEGAL_SPECIALIST:** **CLOSED**.

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md` | **0** | **PASS** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md` | **0** | **PASS** (8/8) |
| QC product audit U02 (runtime + PNG spot-read) | — | **PASS** · **CLOSED** |
| Seed | n/a | **none** |

**Browser evidence pointers:**  
`docs/qa/evidence/qa-hrm-u72-field-display-02-20260727.md` · `_tmp-qa-hrm-u72-field-display-02-runtime.json` · `docs/qa/evidence/screenshots/qa-hrm-u72-field-display-02/`

**Portal URL (local):** `http://127.0.0.1:5173/hr/employees/ff16d855-41e4-4390-8381-9ec56262848c?portal=1&tenantId=xevn&companyId=main`

---

## completion_report

**Closed:** R3 product re-gate after QA-02; **AC-FD-U02** / **AC-U72-GLOBAL** **CLOSED** (HLD-0996 header + Chức vụ = **Chuyên viên Pháp chế**; no `LEGAL_SPECIALIST`); F5 PASS; **C-U72-U02-P0 CLOSED**; keep PASS maps AC-CO-IND-02 / AC-FD-04 / F-01..F-13 (non-U02); J-HRM-01 + J-HRM-CO-01 PASS; pack 8/8; U65 zero-seed; **GO WITH CONDITIONS**.

**Residual / conditions:** **HOLD_DEPLOY** · **NOT Phase1/PROD/:8088** · soft leave P3 OK · ENV note `:8080` · XBOS U72 separate · **no Dev reopen**.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-U72-FIELD-DISPLAY-01-R3
from_role: pm
to_role: pm (intake) → continue program backlog (U71 SA / other open waves)
lane: governance
entry_criteria:
  - QC R3 GO WITH CONDITIONS @ docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md
  - C-U72-U02-P0 CLOSED · C-U72-PACK-01 CLOSED
  - HOLD_DEPLOY · NOT Phase1/PROD/:8088 · U65
exit_criteria:
  1) Bus INTAKE CLOSE HRM U72 field-display product gate (local GWC)
  2) Do NOT reopen Dev for soft leave P3 unless FAIL
  3) Do NOT claim Phase1/PROD/:8088; XBOS U72 GWC remains separate
  4) Continue next open dispatch from pm:idle:check / U71 design backlog
evidence_path: docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md
cấm: seed · Dev reopen PASS maps · Phase1/PROD/:8088 · treat pack alone as PROD GO
```

### evidence_path

`docs/qa/evidence/qc-hrm-u72-field-display-01-r3-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

HRM U72 field-display local **GWC** — U02 CLOSED; **HOLD_DEPLOY**; soft leave P3 OK; continue program (U71 / backlog) — **no** Dev reopen unless FAIL.
