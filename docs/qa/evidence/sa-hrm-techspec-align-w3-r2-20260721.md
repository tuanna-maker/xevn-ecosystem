# SA-HRM-TECHSPEC-ALIGN-W3-R2 — Extend TechSpec `ref_srs` W2a/W2b/W2c (44 FR)

| Field | Value |
|-------|-------|
| **work_item_id** | `SA-HRM-TECHSPEC-ALIGN-W3-R2` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD-only |
| **khách SoT** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2c** (**44** FR) |
| **team annex** | `docs/hrm/SRS.md` — **must_keep** AC-ATT-SHEET-01..06 |
| **techspec** | `docs/hrm/TECHSPEC.md` §14 (W1 refresh) · **§16** (W2a/b/c) · §12.1/§13 ATT dual-ref |
| **prior SA** | `docs/qa/evidence/sa-hrm-techspec-align-w3-01-20260721.md` (8 spine only) |
| **prior QC** | `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-20260721.md` (GWC · 44 FR · Cao=0) |
| **cấm tuân thủ** | wipe · Phase1/PROD claim · claim 120 UC · `apps/**` |

---

## 1. Entry criteria

| Artifact | Result |
|----------|--------|
| QC gate-02 GWC | 44 FR skeleton PASS; next = SA TechSpec `ref_srs` |
| W3-01 | §14 only 8 FR — gap vs 44 |
| Controllers (read-only) | attendance · payroll · recruitment · admin · catalog-sync · notifications · operations · performance · spreadsheet · employee-metadata · mobile-auth · embed §11 |
| G-RC-01 code state | BE+FE `headcount` present → status **VERIFY** (not re-open as missing) |

---

## 2. ADD-only deltas (`docs/hrm/TECHSPEC.md`)

| Section | Change |
|---------|--------|
| §14 header | SoT bump **v3.0-W2c**; pointer → §16; W1 matrix note 8/44 |
| §14.7 / §14.9 | G-RC-01 → **P0 VERIFY** (BE+FE coded); backlog points to §16.9 |
| §15.3 | TM checklist includes W2 modules + §16 |
| **§16.0** | Coverage rollup W1+W2a+W2b+W2c = **44** |
| **§16.1** | W2a matrix FR #9–20 + gaps G-AT01-01 / G-PR-03 |
| **§16.2** | W2b matrix FR #21–32 + G-SCOPE-01 / G-IM-01 |
| **§16.3** | W2c matrix FR #33–44 + G-INT-* / embed / MOB dual-ref mobile TS |
| **§16.4** | ATT dual-ref must_keep (AC-ATT-SHEET unchanged) |
| **§16.9** | Gap register gộp 44 FR |
| **§16.10** | Option A SELECT; validation = 44 rows |

**Không** sửa `apps/**` · **không** rút AC-ATT-SHEET · **không** claim 120 UC.

---

## 3. Trace count (machine intent)

| Source | Count |
|--------|-------|
| Khách FR headings §3.1–3.44 | 44 |
| TechSpec §14.0 rows | 8 |
| TechSpec §16.1 rows | 12 |
| TechSpec §16.2 rows | 12 |
| TechSpec §16.3 rows | 12 |
| **Sum** | **44 = 44** |

---

## 4. SA status summary (44)

| Status | Approx | Notes |
|--------|--------|-------|
| ALIGNED | majority | API/DTO/table map exists for slice |
| PARTIAL | W1 fields · PR-03 · INT-01/04 · embed dashboard · IM preview | Gaps in §16.9 |
| VERIFY | G-RC-01 | QA U65 pending |
| DELEGATED detail | MOB client NFR | `TECHSPEC_MOBILE.md` (API ALIGNED) |

**Inventory:** 30 Yêu cầu / 120 UC catalog vẫn hiệu lực — **44** FR khách ≠ 120 done.

---

## 5. Architecture (short)

| Option | Verdict |
|--------|---------|
| A — ADD §16 + gap register | **SELECT** |
| B — Wipe rewrite TechSpec | **cấm** |
| C — New INT aggregate API | Reject — FK + journey |
| D — Force 120 FR now | Out of scope (optional W2d) |

**Invariant:** scope parity · empty honesty · U65 · AC-ATT-SHEET.

---

## 6. completion_report

**Closed:**
- TechSpec `ref_srs` extended for all **W2a + W2b + W2c** FR batches (36) atop W1 (8) → **44/44** mapped.
- Gap register §16.9 published; G-RC-01 refreshed to VERIFY.
- AC-ATT-SHEET / §12.1 / §13 dual-ref preserved.
- Evidence this file; no `apps/**`; no Phase1/PROD/120 UC claim.

**Residual:**
1. P0 VERIFY G-RC-01 → QA browser.
2. P0/P1 G-AT10-01 leave company_id; G-SCOPE-01 standing.
3. P1 G-CI-01, G-EM-01, G-AT01-01, G-PR-03, G-INT-01/04.
4. Optional W2d Trung bình×5 (C-SKEL-04) — ba-docs / Sponsor.
5. TM convention gate may still be open on W1 paths — now should include §16 touch list.

**Not claimed:** Phase 1 DONE · PROD-READY · 120 UC body_ready · product UF 🟢 closure.

---

## 7. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/sa-hrm-techspec-align-w3-r2-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: TM-HRM-CODE-SPEC-CONVENTION-01
from_role: pm
to_role: technical-manager
lane: governance
priority: P0

## Entry
SA W3-R2 PASS: docs/qa/evidence/sa-hrm-techspec-align-w3-r2-20260721.md
TechSpec: docs/hrm/TECHSPEC.md §14 (W1) + §16 (W2a/b/c 44 FR) + §15 convention + §12.1 AC-ATT-SHEET must_keep
Khách: docs/client-delivery/hrm/SRS_HRM_KHACH.md v3.0-W2c (44 FR)
QC prior: docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-02-20260721.md
cấm: wipe · Phase1/PROD · claim 120 UC · TM không patch apps/**

## Job
1. Audit boundary hygiene §15.1 on W1 + W2 touched modules listed in §15.3 / §16
2. Confirm gap register §16.9 accurate (esp. G-RC-01 VERIFY not «missing field»; G-AT10-01; G-SCOPE-01)
3. Confirm AC-ATT-SHEET dual-ref §12.1/§13/§16.4 untouched
4. Evidence: docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md
5. Verdict GO / GWC / NO-GO → PASS_TO_PM
6. next_dispatch_prompt: if GO/GWC → QA G-RC-01 U65 (+ optional Dev-BE top P1 from §16.9); if NO-GO → Dev fix cited paths

entry_criteria: SA R2 evidence + TECHSPEC §16 present (44 rows)
exit_criteria: TM evidence + residual owners; ack_status PASS_TO_PM
```

### Alternate (if TM already GO on W1-only)

```text
work_item_id: QA-HRM-G-RC-01-U65
from_role: pm
to_role: qa
lane: execution
priority: P0
entry: FE READY docs/qa/evidence/fe-hrm-g-rc-01-20260721.md · SA §14.7/§16.9 G-RC-01 VERIFY
Job: Browser U65 FR-HRM-RC-01 — create YCTD với số lượng ≥1 → list/detail sau 2xx + F5; cấm seed
evidence: docs/qa/evidence/qa-hrm-g-rc-01-u65-20260721.md
ack_status: PASS_TO_PM
```
