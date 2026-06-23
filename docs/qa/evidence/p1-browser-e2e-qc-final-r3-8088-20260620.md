# P1-BROWSER-E2E-QC-FINAL-R3-8088 — Combined sponsor nghiệm thu :8088 QC gate (R3)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-QC-FINAL-R3-8088` |
| **role** | qc |
| **executed_at** | 2026-06-20T20:15+07 |
| **portal** | http://14.225.217.232:8088/ |
| **PORTAL_DEV_URL** | http://14.225.217.232:8088/ |
| **qa_evidence_in** | `docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md` (Track A **15/15 GWC**) · `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md` (Track B **11/11 🟢 PASS_TO_PM**) · prior `docs/qa/evidence/p1-browser-e2e-qc-final-r2-8088-20260620.md` (**NO-GO 24/26**) |
| **spec_ref** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` Wave 1 + Wave 2 · `USER_FLOW_OPERABILITY_MATRIX.md` §3–§4 |
| **rule** | U65 zero-seed · browser-only · L2.5 J-* mandatory for in-scope slice |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**GO WITH CONDITIONS (full sponsor nghiệm thu web :8088 — Track A + Track B)** — Independent QC R3 audit confirms **26/26 web in-scope UF 🟢** on http://14.225.217.232:8088/: Track A **15/15 UF-XBOS-01..15** (prior Wave 1 GWC, no regression); Track B **11/11 UF-HRM web** (R6 closes UF-HRM-09/13 member session — `du-lich.hr@xe.vn` / `du-lich.ceo@xe.vn` login **201**, HRM embed **18** NV, JWT persists on GMU **403**). Supersedes R2 **NO-GO** (24/26).

**Bounded P2 carry (NOT blocking sponsor GO):** Wave 1 residuals R-UF15-BATCH-ROW, R-W1-SCREENSHOT-CARRY, R-QC-PACK-8088-FORMAT on upstream wave MDs; optional HRM cosmetic suppress redundant `group-member-units` fetch for member.

**NOT Phase 1 DONE** — program gates G4/G5 open; mobile UF-HRM-07/08 ⚪ out of scope :8088 web.

---

## Classification

| Class | Signal | QC action |
|-------|--------|-----------|
| **PRODUCT PASS (Track A)** | 15/15 UF-XBOS browser U63; L2.5 J-CC-01/02/03 | **Promote 🟢** — unchanged since Wave 1 close |
| **PRODUCT PASS (Track B)** | R6 **11/11** web 🟢; D-HRM-MEMBER-SESSION-403 + D-HRM-WORKSPACE-META-409 **CLOSED** | **Promote full Track B 🟢** |
| **PRODUCT PASS (combined UAT)** | **26/26** web UF Dev8088 | **GO sponsor nghiệm thu :8088** |
| **PROCESS P2** | Upstream wave MDs fail pack regex; R6 lacks formal command_table section | **Carry qa** — does **not** block R3 product GO |
| **ENV** | L0 `qc:dev-stack` exit **0** (local spot); QA R6 L0 :8088 reachable | **Accepted** |

---

## Command table (QC gate)

| Command | Target | Exit | Result |
|---------|--------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md` | Wave 1 QC close in | **1** | FAIL 3/8 — upstream format; product audit valid |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r6-20260620.md` | HRM R6 in | **1** | FAIL 2/8 — command_table + portal_url regex on R6 MD |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-qc-final-r3-8088-20260620.md` | This final pack | **0** | PASS 8/8 (post-write QC verify) |
| `pnpm run qc:dev-stack` | L0 spot (local proxy health) | **0** | PASS hrm-api + xbos-api + portal |
| Prior R2 gate | `docs/qa/evidence/p1-browser-e2e-qc-final-r2-8088-20260620.md` | **n/a** | **SUPERSEDED** — NO-GO 24/26 → R3 26/26 |

---

## L0 / L1 / L2 / L2.5

| Layer | Track A (XBOS) | Track B (HRM web) | Evidence |
|-------|----------------|-------------------|----------|
| **L0** | **PASS** | **PASS** embed mount | R6 L0 + QC spot `qc:dev-stack` exit **0** |
| **L1** | N/A bounded | N/A bounded | Browser wave scoped U63/U65 |
| **L2** | **PASS** 15 UF CC/settings routes | **PASS** 11/11 routes/data load | Wave1 QC close · HRM R4 carry + R6 UF-09/13 |
| **L2.5** | **PASS** J-CC-01/02/03 | **PASS** J-HRM-01..07 group CEO + member scope UF-09/13 | [`PROGRAM_JOURNEY_MAP.md`](../../program/PROGRAM_JOURNEY_MAP.md) |

### L2.5 journey audit

| J-ID | Track | Browser :8088 | QC |
|------|-------|---------------|-----|
| **J-CC-01** | A | **PASS** UF-XBOS-01 login→CC | **🟢** |
| **J-CC-02** | A | **PASS** UF-XBOS-02/05/07 member/holding + RACI | **🟢** |
| **J-CC-03** | A | **PASS** UF-XBOS-10 KPI CC home | **🟢** |
| **J-HRM-01** | B | **PASS** — list **1107** → profile (R4) | **🟢** |
| **J-HRM-02** | B | **PASS** — list→detail (R4) | **🟢** |
| **J-HRM-03** | B | **PASS** — contracts **1104** rows (R4) | **🟢** |
| **J-HRM-04** | B | **PASS** — insurance 5 records (R4) | **🟢** |
| **J-HRM-05** | B | **PASS** — attendance widgets (R4) | **🟢** |
| **J-HRM-06** | B | **PASS** — attendance shell (R4) | **🟢** |
| **J-HRM-07** | B | **PASS** — payroll onboarding (R4) | **🟢** |
| **J-HRM member scope** | B | **PASS** — UF-09 `du-lich.hr@xe.vn` + UF-13 `du-lich.ceo@xe.vn` session persist · embed **18** NV (R6) | **🟢** |

---

## Track A — UF-XBOS-01..15 (Dev8088 browser)

Audit source: [`p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md`](./p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md) — **15/15 🟢** confirmed (no regression since Wave 1 QC close / R2).

| UF range | Count 🟢 | QC |
|----------|----------|-----|
| UF-XBOS-01..15 | **15/15** | **PASS** Wave 1 carry |

---

## Track B — UF-HRM web (Dev8088 browser)

**Latest QA evidence:** R6 [`p1-browser-e2e-hrm-wave-8088-r6-20260620.md`](./p1-browser-e2e-hrm-wave-8088-r6-20260620.md) — **PASS_TO_PM**, **11/11 web 🟢**.

### 🟢 PASS (11 web UFs)

| UF | Evidence round | Key browser evidence |
|----|----------------|----------------------|
| **UF-HRM-01..08** | R4 carry | list **1107**, contracts **1104**, routes, crypto, metadata — [R4](./p1-browser-e2e-hrm-wave-8088-r4-20260620.md) |
| **UF-HRM-09** | **R6 promoted** | `du-lich.hr@xe.vn` login **201** · workspace-meta `xe-du-lich/main` **200** · HRM **18** NV · F5 token persist |
| **UF-HRM-10..12** | R4 carry | settings-catalogs, metadata approve **12→11**, recruitment dialog |
| **UF-HRM-13** | **R6 promoted** | `du-lich.ceo@xe.vn` login **201** · scope negatives **403/409** expected · HRM **18** NV |

### ⚪ SKIP (2 mobile)

| UF | Verdict |
|----|---------|
| **UF-HRM-07/08** | ⚪ mobile N/A :8088 web nghiệm thu |

**Track B summary:** **11/11 web 🟢** — full Track B PASS.

---

## Matrix impact (Dev8088 summary)

| Slice | Dev8088 | QC R3 |
|-------|---------|-------|
| §3 XBOS UF-XBOS-01..15 | 15/15 🟢 | **Confirmed 🟢** |
| §4 HRM web UF-HRM-01..06, 09..13 | 11/11 🟢 | **Confirmed 🟢** — R6 closes UF-09/13 |
| §4 HRM mobile UF-HRM-07/08 | ⚪ | N/A :8088 web |
| **Combined sponsor nghiệm thu** | **26/26** web in-scope | **GO** |

Updated in [`USER_FLOW_OPERABILITY_MATRIX.md`](../USER_FLOW_OPERABILITY_MATRIX.md) §3–§4 + Dev8088 summary.

---

## Residual

| ID | Item | Severity | Owner | Blocks GO? |
|----|------|----------|-------|------------|
| **R-UF15-BATCH-ROW** | UF-XBOS-15 custom field `QA-R7-UF15-806520` not in governance batch detail table rows | P2 | dev-be | **No** |
| **R-W1-SCREENSHOT-CARRY** | 7 XBOS UFs lack screenshot path in promoted wave MD | P2 | qa | **No** |
| **R-QC-PACK-8088-FORMAT** | Upstream wave MDs fail `verify:qc:evidence-pack` regex | P2 | qa + platform | **No** — R3 final pack **8/8 PASS** |
| **R-HRM-GMU-403-COSMETIC** | Member still requests `group-member-units` → **403** (session no longer cleared) | P3 | dev-fe optional | **No** |
| **R4-UF02-MUTATE** | Contract save+F5 not executed in R4 (list/read PASS) | P3 | qa optional | **No** |

**Explicitly NOT blocking:** mobile UF-HRM-07/08; Phase 1 program completion (G4/G5).

---

## QC verdict

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | **Full combined sponsor nghiệm thu web :8088** — UF-XBOS-01..15 **15/15 🟢** + UF-HRM web **11/11 🟢** = **26/26** @ http://14.225.217.232:8088/ |
| **Conditions (P2/P3 only)** | R-UF15-BATCH-ROW · R-W1-SCREENSHOT-CARRY · R-QC-PACK-8088-FORMAT on upstream MDs — **do not block** sponsor demo/acceptance |
| **NOT Phase 1 DONE** | Program gates G4/G5 open; mobile journeys separate |
| **Supersedes** | R2 NO-GO (24/26) — member UF-09/13 closed in R6 |

---

## Handoff packet

- **completion_report:** QC R3 audited Track A **15/15 🟢** (Wave 1 GWC, no regression) + Track B R6 **11/11 🟢** (UF-HRM-09/13 member session fix verified); combined **26/26 web 🟢**; L2.5 J-CC + J-HRM + member scope **PASS**; issued **GO WITH CONDITIONS** full sponsor nghiệm thu :8088 with 4 bounded P2/P3 carry items explicitly non-blocking; `verify:qc:evidence-pack` R3 **8/8 PASS**; `qc:dev-stack` exit **0**.
- **next_owner:** `pm`
- **next_dispatch_prompt:**

```
Role: pm
work_item_id: P1-BROWSER-E2E-SPONSOR-UAT-8088-CLOSE
from_role: qc
to_role: pm
priority: P0
entry_criteria: QC R3 GO WITH CONDITIONS — docs/qa/evidence/p1-browser-e2e-qc-final-r3-8088-20260620.md; 26/26 web UF 🟢 Track A+B @ :8088; P2 carry documented non-blocking; NOT Phase 1 DONE
exit_criteria: PM ghi bus sponsor nghiệm thu :8088 APPROVED; cập nhật PROJECT_STATUS_REPORT + USER_SERVICE_STATUS UAT-READY slice; optional backlog P2 R-UF15-BATCH-ROW / screenshot / pack format trong sprint kế; governance note mobile UF-07/08 separate
evidence_path: docs/qa/evidence/p1-browser-e2e-qc-final-r3-8088-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: Sponsor may demo full web persona matrix on :8088 — group CEO XBOS+HRM + member HRBP/CEO HRM; do not claim Phase 1 DONE
```

- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-qc-final-r3-8088-20260620.md`
- **ack_status:** **PASS_TO_PM**
