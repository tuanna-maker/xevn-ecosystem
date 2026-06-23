# P1-BROWSER-E2E-QC-FINAL-R2-8088 — Combined sponsor nghiệm thu :8088 QC gate (R2)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-QC-FINAL-R2-8088` |
| **role** | qc |
| **executed_at** | 2026-06-20T18:45+07 |
| **portal** | http://14.225.217.232:8088/ |
| **PORTAL_DEV_URL** | http://14.225.217.232:8088/ |
| **qa_evidence_in** | `docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md` (Wave 1 **15/15 GWC**) · `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md` (**9/11 FAIL_TO_PM**) · `docs/qa/evidence/p1-hrm-member-ui-login-8088-be-20260620.md` (READY_FOR_QA — R5 **absent**) |
| **spec_ref** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` Wave 1 + Wave 2 |
| **rule** | U65 zero-seed · browser-only · L2.5 J-* mandatory for in-scope slice |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**NO-GO (full combined sponsor nghiệm thu :8088)** — Track B HRM web **9/11 🟢**; QA R5 **not executed** (dev-be member-login fix READY_FOR_QA; `p1-browser-e2e-hrm-wave-8088-r5-20260620.md` **MISSING**). Residual P0: **UF-HRM-09** + **UF-HRM-13** member UI login — no `xevn.portal.accessToken` after submit.

**GO WITH CONDITIONS (Track A XBOS + Track B partial 9/11)** — Wave 1 **15/15 UF-XBOS-01..15 🟢** confirmed via prior QC close; Wave 2 R4 promotes **9** web UFs with browser U63 blocks (list **1107**, contracts **1104**, routes, crypto, metadata mutate+F5).

**NOT Phase 1 DONE** · **NOT full sponsor show-all** until R5 closes UF-HRM-09/13 → **11/11**.

---

## Classification

| Class | Signal | QC action |
|-------|--------|-----------|
| **PRODUCT PASS (Track A)** | 15/15 UF-XBOS browser U63; L2.5 J-CC-01/02/03 cited PASS | **Promote Wave 1 🟢** |
| **PRODUCT PARTIAL (Track B)** | R4 **9/11** web 🟢; R2/R3 P0 FE defects **closed**; member login **FAIL** UF-09/13 | **GWC Track B partial** — explicit UF list below |
| **PRODUCT FAIL (full UAT)** | Combined 24/26 web in-scope (15+9); need 26/26 | **NO-GO full sponsor nghiệm thu** |
| **PROCESS** | R4 pack verify **2/8** (command_table + portal_url regex); R5 evidence absent | **Carry qa** — does not block R4 product audit |
| **ENV** | L0 `qc:dev-stack` exit **0** (local spot) | **Accepted** |

---

## Command table (QC gate)

| Command | Target | Exit | Result |
|---------|--------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md` | Wave 1 QC close in | **1** | FAIL 3/8 — prior wave format; product audit still valid |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-20260620.md` | HRM R4 in | **1** | FAIL 2/8 — command_table + portal_url regex |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-qc-final-r2-8088-20260620.md` | This final pack | **0** | PASS 8/8 (post-write QC verify) |
| `pnpm run qc:dev-stack` | L0 spot (local proxy health) | **0** | PASS hrm-api + xbos-api + portal |
| HRM R5 browser pack | `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r5-20260620.md` | **n/a** | **MISSING** — QA not run after dev-be READY_FOR_QA |

---

## L0 / L1 / L2 / L2.5

| Layer | Track A (XBOS) | Track B (HRM web) | Evidence |
|-------|----------------|-------------------|----------|
| **L0** | **PASS** | **PASS** embed mount | R4 L0 + QC spot `qc:dev-stack` exit **0** |
| **L1** | N/A bounded | N/A bounded | Browser wave scoped U63 |
| **L2** | **PASS** 15 UF CC/settings routes | **PARTIAL** — 9/11 routes/data load | Wave1 QC close · HRM R4 |
| **L2.5** | **PASS** J-CC-01/02/03 | **PARTIAL** — J-HRM-01..07 **PASS** for group CEO slice; J-HRM member scope **FAIL** (UF-09/13) | [`PROGRAM_JOURNEY_MAP.md`](../../program/PROGRAM_JOURNEY_MAP.md) |

### L2.5 journey audit

| J-ID | Track | Browser :8088 | QC |
|------|-------|---------------|-----|
| **J-CC-01** | A | **PASS** UF-XBOS-01 login→CC | **🟢** |
| **J-CC-02** | A | **PASS** UF-XBOS-02/05/07 member/holding + RACI | **🟢** |
| **J-CC-03** | A | **PASS** UF-XBOS-10 KPI CC home | **🟢** |
| **J-HRM-01** | B | **PASS** — list **1107** → profile Hồ Minh An | **🟢** |
| **J-HRM-02** | B | **PASS** — list→detail Đặng Xuân Hà | **🟢** |
| **J-HRM-03** | B | **PASS** — contracts **1104** rows | **🟢** |
| **J-HRM-04** | B | **PASS** — insurance 5 records | **🟢** |
| **J-HRM-05** | B | **PASS** — attendance widgets | **🟢** |
| **J-HRM-06** | B | **PASS** — attendance shell | **🟢** |
| **J-HRM-07** | B | **PASS** — payroll onboarding | **🟢** |
| **J-HRM member scope** | B | **FAIL** — UF-09/13 UI login no token | **🔴** |

---

## Track A — UF-XBOS-01..15 (Dev8088 browser)

Audit source: [`p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md`](./p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md) — **15/15 🟢** confirmed (no regression since R1 QC final).

| UF range | Count 🟢 | QC |
|----------|----------|-----|
| UF-XBOS-01..15 | **15/15** | **PASS** Wave 1 GWC |

---

## Track B — UF-HRM web (Dev8088 browser)

**Latest QA evidence:** R4 [`p1-browser-e2e-hrm-wave-8088-r4-20260620.md`](./p1-browser-e2e-hrm-wave-8088-r4-20260620.md) — **FAIL_TO_PM**, **9/11 web 🟢**.

### 🟢 PASS (9 UFs — R4 browser U63)

| UF | R4 verdict | Key evidence |
|----|------------|--------------|
| **UF-HRM-01** | 🟢 | list **1107** · `page_size=100` · J-HRM-01 list→detail |
| **UF-HRM-02** | 🟢 | contracts **1104** rows · D-HRM-CONTRACTS-UI-EMPTY **closed** |
| **UF-HRM-03** | 🟢 | profile Đặng Xuân Hà · cross-nav tabs |
| **UF-HRM-04** | 🟢 | insurance 5 records |
| **UF-HRM-05** | 🟢 | attendance widgets load |
| **UF-HRM-06** | 🟢 | payroll onboarding shell |
| **UF-HRM-10** | 🟢 | settings-catalogs route **closed** (was 404) |
| **UF-HRM-11** | 🟢 | metadata approve **12→11** + F5 |
| **UF-HRM-12** | 🟢 | recruitment dialog · crypto polyfill **closed** |

### 🔴 FAIL (2 UFs — blocks 11/11)

| UF | R4 verdict | Blocker (PRODUCT) | R5 status |
|----|------------|-------------------|-----------|
| **UF-HRM-09** | 🔴 | `du-lich.hr@xe.vn` UI login → no token | **pending** — dev-be fix READY_FOR_QA |
| **UF-HRM-13** | 🔴 | `du-lich.ceo@xe.vn` UI login → no token | **pending** — same blocker |

### ⚪ SKIP (2 mobile)

| UF | Verdict |
|----|---------|
| **UF-HRM-07/08** | ⚪ mobile N/A :8088 web |

**Track B summary:** **9/11 web 🟢** — **GWC partial**; **NOT** full Track B PASS.

---

## Matrix impact (Dev8088 summary)

| Slice | Dev8088 | QC R2 |
|-------|---------|-------|
| §3 XBOS UF-XBOS-01..15 | 15/15 🟢 | **Confirmed 🟢** |
| §4 HRM web UF-HRM-01..06, 09..13 | **9/11 🟢** (2 🔴) | **GWC partial** — promote 9 rows |
| §4 HRM mobile UF-HRM-07/08 | ⚪ | N/A :8088 web |
| **Combined sponsor nghiệm thu** | **24/26** web in-scope | **NO-GO** (need 26/26 🟢) |

---

## Residual

| ID | Item | Severity | Owner | Trigger to close |
|----|------|----------|-------|------------------|
| **R-HRM-R5-BLOCK** | R5 absent; UF-HRM-09/13 member UI login | **P0** | pm → devops → qa | xbos-be recreate + Task `P1-BROWSER-E2E-HRM-WAVE-8088-R5` browser PASS |
| **R-UF15-BATCH-ROW** | UF-XBOS-15 custom field not in batch detail table | P2 | dev-be | Batch row lists stamp OR SRS waiver |
| **R-W1-SCREENSHOT-CARRY** | 7 XBOS UFs lack screenshot path in promoted MD | P2 | qa | Append MCP refs |
| **R-R4-PACK-FORMAT** | R4 pack verify FAIL 2/8 (regex) | P2 | qa | Pack verify exit **0** on R4/R5 MDs |
| **R4-UF02-MUTATE** | Contract save+F5 not executed (list/read PASS) | P3 | qa optional | Full mutate AC if SRS requires |

---

## QC verdict

| Decision | Scope |
|----------|-------|
| **NO-GO** | **Full combined sponsor nghiệm thu web :8088** — Track B **9/11**; R5 absent; UF-HRM-09/13 🔴 |
| **GO WITH CONDITIONS** | **Track A** — UF-XBOS-01..15 **15/15 🟢** @ http://14.225.217.232:8088/ |
| **GO WITH CONDITIONS** | **Track B partial** — UF-HRM-01..06, 10..12 **9/11 🟢**; **exclude** UF-HRM-09/13 from sponsor demo until R5 |
| **NOT Phase 1 DONE** | Program gates G4/G5 open; HRM member scope incomplete |
| **NOT sponsor show-all** | PM may demo CC+XBOS + group-CEO HRM; **do not** demo member HRBP/CEO login until R5 |

---

## Handoff packet

- **completion_report:** QC R2 audited Track A **15/15 🟢** (Wave 1 GWC carry); Track B R4 **9/11 🟢** with browser U63 blocks; R5 **missing** — dev-be member-login fix READY_FOR_QA not browser-verified; issued **NO-GO full UAT** + **GWC Track A + Track B partial (explicit 9 UF list)**; updated matrix Dev8088 summary.
- **next_owner:** `pm`
- **next_dispatch_prompt:**

```
Role: pm
work_item_id: P1-BROWSER-E2E-HRM-WAVE-8088-R5-DEPLOY
from_role: qc
to_role: pm
priority: P0
entry_criteria: QC R2 NO-GO full :8088 — docs/qa/evidence/p1-browser-e2e-qc-final-r2-8088-20260620.md; Wave 1 XBOS GWC 15/15; HRM R4 9/11 GWC partial; dev-be READY_FOR_QA docs/qa/evidence/p1-hrm-member-ui-login-8088-be-20260620.md; R5 evidence absent
exit_criteria: PM ensure xbos-be recreated on VPS :8088 per dev-be deploy notes; Task qa P1-BROWSER-E2E-HRM-WAVE-8088-R5 browser U63 UF-HRM-09/13 only; on 11/11 🟢 re-dispatch qc P1-BROWSER-E2E-QC-FINAL-R3-8088 for full GO Track A+B
evidence_path: docs/qa/evidence/p1-browser-e2e-qc-final-r2-8088-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: Sponsor demo approved scoped: XBOS 15/15 + HRM group-CEO 9 UF; block member persona demo until R5
```

- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-qc-final-r2-8088-20260620.md`
- **ack_status:** **PASS_TO_PM**
