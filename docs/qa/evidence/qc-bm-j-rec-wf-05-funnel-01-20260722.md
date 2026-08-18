# QC Gate — QC-BM-J-REC-WF-05-FUNNEL-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-BM-J-REC-WF-05-FUNNEL-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — **J-REC-WF-05** / BM-05 dashboard funnel (6 cột live + ĐVTV filter) **CLOSED** on Dev8088 |
| **scope_claim** | Recruitment dashboard funnel only: P-CC-06 / Dashboard → Pipeline 6 F6 columns live aggregate → filter ĐVTV (rollup ↔ member honest empty) → chip→Ứng viên stage tabs · U65 zero-seed · no ERROR banner |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser FE only; **cấm** seed |
| **cấm this gate** | seed · Phase1/PROD claim · require **J-REC-WF-06** reject path |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA PASS for **J-REC-WF-05** (dashboard funnel 6 cột + ĐVTV) | Full BM wave · full HRM menu |
| Confirm live aggregate (not hardcoded 1OFFICE mock) | Mutate hire / spawn / inbox approve (prior gates) |
| Confirm ĐVTV filter changes counts / honest empty | **J-REC-WF-06** reject path |
| Layer B pack verify + Classification | Phase 1 DONE · PROD-READY |
| Residual P0/P1 only in Residual | Side KPI «Chỉ tiêu» empty (P3 soft) |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-qa-j-rec-wf-05-funnel-01-20260722.md` | QA | **PASS** — Dashboard Tuyển dụng · Pipeline 6 cột F6 (new4 / screening0 / interview0 / offer0 / hired1 / rejected0 · Tổng **5**) · ĐVTV Khối Vận tải → `company_id=trsport` · Tổng **0** honest empty · rollup restore · chip→Ứng viên stage tabs · no ERROR / 54321 · U65 no seed |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-REC-WF-05** already ✅ PASS cite `bm-qa-j-rec-wf-05-funnel-01` |
| `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | Matrix | **P-CC-06** `/command-center/hrm/recruitment` — L2 prior PASS; this gate = L2.5 funnel |
| Spec | BA / FE SoT | Extends AC-CD-F6-03/04 · BR-DQ-01 · `recruitmentFunnel.ts` F6 stages |

**No re-run** of full browser suite — audit-only per PM entry. Local `pnpm run qc:dev-stack` not required for Dev8088 substance audit (ENV local N/A).

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-j-rec-wf-05-funnel-01-20260722.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `PORTAL_DEV_URL` token (`:8088` alone fails portal_url regex) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-bm-j-rec-wf-05-funnel-01-20260722.md` | **PASS** exit **0** (8/8) | This gate file |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** PROCESS gaps on QA pack are **format-only** (precedent `process-pack-not-product-nogo`). Browser substance — 6 F6 columns with VI labels, live rollup counts summing to 5, ĐVTV filter Network `company_id=main|trsport`, honest empty on member, no ERROR banner, U65 no seed — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Six F6 columns + VI labels + Tổng = sum | PRODUCT L2.5 | **PASS** — 4+0+0+0+1+0 = 5 |
| Live aggregate (not mock KPI) | PRODUCT | **PASS** — candidates-pool Resource Timing; hired=1 consistent with prior hire-bind |
| ĐVTV filter → count change / honest empty | PRODUCT L2.5 | **PASS** — rollup 5 → trsport 0; options include Tập đoàn + 4 khối |
| Chip → Ứng viên stage tabs | PRODUCT L2.5 | **PASS** — Tất cả 5 / Ứng tuyển 4 / Đã tuyển 1 |
| ERROR / Sync ERROR / 54321 | PRODUCT | **PASS** — none |
| Seed | PROCESS U65 | **PASS** — none |
| Side KPI «Chỉ tiêu» empty | PRODUCT soft | **P3** — honest empty, not funnel fail |
| Brief `—` on chips after ĐVTV change | PRODUCT soft | **P3** — settles; not ERROR |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Local L0 `qc:dev-stack` | ENV | **N/A** for Dev8088 gate (audit-only) |
| J-REC-WF-06 reject | OUT OF SLICE | **Deferred** |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (J-REC-WF-05 / BM-05)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **6 F6 columns** | Pipeline 6 stages + VI labels | Chờ CV/Mới · Sàng lọc · Phỏng vấn · Đề nghị · Đã tuyển · Từ chối | **PASS** |
| **Live aggregate** | Counts from API / not hardcoded | GET candidates-pool; sum 5; CV card 5 / Đã tuyển 1 | **PASS** |
| **ĐVTV filter** | Exists + changes counts or honest empty | combobox; main→5; trsport→0 | **PASS** |
| **Post activity / no ERROR** | After YCTD/hire activity, funnel OK | hired=1; empty stages=0; no banner | **PASS** |
| **U65** | No seed | QA browser-only | **PASS** |
| **J-REC-WF-06** | Reject path | Out of gate | **N/A deferred** |

---

## L2.5 — J-REC-WF-05 (narrow funnel)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-REC-WF-05** | Dashboard funnel 6 cột + ĐVTV | `bm-qa-j-rec-wf-05-funnel-01` | **PASS** | Bounded funnel slice |
| **P-CC-06** | Recruitment route L2 | Matrix prior + QA surface | **PASS** (L2 prior; L2.5 this gate) | — |
| **J-REC-WF-06** | Reject path | Not in this gate | **Deferred** | Do not require for GWC |

**Mandatory J-* for this slice:** **J-REC-WF-05** — **PASS**.  
**Deferred (explicit):** **J-REC-WF-06** — out of funnel gate / PM cấm Phase1-PROD scope.  
**Journey map:** J-REC-WF-05 already ✅ cite QA evidence — soft promote QC cite optional.

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blocker for J-REC-WF-05 / BM-05 funnel on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-REC-WF-05-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA pack: `command_table` + `PORTAL_DEV_URL=http://14.225.217.232:8088` → verify 8/8 |
| **C-REC-WF-05-MAP-QC** | P3 governance | pm (optional) | OPEN | Optionally append QC gate cite on `PROGRAM_JOURNEY_MAP.md` J-REC-WF-05 (already ✅ from QA) |
| **C-REC-WF-05-KPI-TARGET** | P3 soft | ba/dev-fe (optional) | NOTE | Side KPI **Chỉ tiêu** = «Không có dữ liệu» under rollup — honest empty; not funnel fail |
| **C-REC-WF-05-FILTER-SETTLE** | P3 soft | dev-fe (optional) | NOTE | Chips briefly `—` after ĐVTV change then settle — not ERROR |
| **C-REC-WF-06** | soft / next wave | pm → qa | DEFER OK | Reject path J-REC-WF-06 — **not** required by this gate |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit QA PASS J-REC-WF-05 vs AC | **DONE** — product PASS |
| Confirm live 6 cột + ĐVTV + no ERROR / U65 | **DONE** |
| Audit L2.5 **J-REC-WF-05** | **DONE** — **PASS** |
| GO or GWC; Residual P0/P1 only | **GWC** — Residual P0/P1 = **none** |
| Evidence this file | **DONE** |
| cấm seed · Phase1/PROD | **RESPECTED** |

---

## Executive summary

QC audited **J-REC-WF-05** on Dev8088: Dashboard **Pipeline ứng viên (6 giai đoạn)** live aggregate (4/0/0/0/1/0 · Tổng **5**), ĐVTV filter rollup↔`trsport` honest empty, chip→Ứng viên stage parity, no ERROR banner, U65 no seed. Layer B QA pack 2/8 = PROCESS P3 only. Soft residuals (Chỉ tiêu empty; brief chip `—`) do not block funnel. **J-REC-WF-06** explicitly out of scope.

**GO WITH CONDITIONS** for this bounded funnel slice only. Conditions = pack polish (P3) + optional map QC cite + soft KPI/settle notes + J-06 defer + **explicit NOT Phase1/PROD**.

---

## Handoff

- **completion_report:** Closed QC gate `QC-BM-J-REC-WF-05-FUNNEL-01`. Product **J-REC-WF-05** / BM-05 dashboard funnel **PASS** on `:8088` U65. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3. J-06 deferred. **NOT** Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qc-bm-j-rec-wf-05-funnel-01-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-BM-J-REC-WF-05-CLOSE-01
from_role: pm
to_role: pm
lane: governance
priority: P2
entry_criteria: QC GWC docs/qa/evidence/qc-bm-j-rec-wf-05-funnel-01-20260722.md; Residual P0/P1 none; J-REC-WF-05 PASS; J-06 not required
exit_criteria: Bus INTAKE QC-BM-J-REC-WF-05-FUNNEL-01 GWC; TEAM_WORKING_NOW / evidence index cite qc-bm-j-rec-wf-05-funnel-01-20260722.md; optionally append QC cite on PROGRAM_JOURNEY_MAP J-REC-WF-05; do NOT claim Phase1/PROD; next wave = highest open P0/P1 from pm:idle:check (BM residual / J-REC-WF-06 if backlog prioritizes reject) — do not reopen funnel product without regression
cấm: seed · reopen J-REC-WF-05 product · require J-06 from this gate · Phase1/PROD claim
```

Optional (P3 process — do not block):

```text
work_item_id: C-REC-WF-05-PACK-01
to_role: qa
exit: Edit docs/qa/evidence/bm-qa-j-rec-wf-05-funnel-01-20260722.md — add command_table (pnpm verify exit) + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
