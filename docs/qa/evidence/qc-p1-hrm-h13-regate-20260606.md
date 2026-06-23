# P1-HRM-H13-QC-REGATE — H8c + H13 batch uplift (conditions closeout)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-H13-QC-REGATE` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://localhost:5173` (web) · `http://127.0.0.1:28001` (hrm-api / mobile) |
| **account** | Web: `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) · Mobile: `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **executed_at** | 2026-06-06 |
| **prior_gate** | `qc-p1-hrm-h11-regate-20260606.md` — **GO WITH CONDITIONS** · **D-HRM-INS-SUMMARY-01** + **R-H10-01** OPEN |
| **decision** | **GO WITH CONDITIONS** — **J-HRM-01..07 7/7 promotable** localhost U32; **D-HRM-INS-SUMMARY-01 CLOSED** · **R-H10-01 CLOSED** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — H13 regate after H8c + H13 QA PASS)

| In scope | Out of scope |
|----------|--------------|
| Close **D-HRM-INS-SUMMARY-01** after H13 ins-summary QA | nip.io / VPS `:8088` (**C-HRMQC-01** deferred U32) |
| Close **R-H10-01** after H13 AC-FID-03 five-slug verify | Phase 1 DONE / corporate PROD / `phase1:gate --strict` program |
| Confirm **J-HRM-01..07** 7/7 unchanged (J04 regression) | **AC-FID-04** insurance per-company (separate CARD-INS-01 wave) |
| Promote H8c mobile light-theme REST slice (static + API) | Strict adb device UI (**C-MOB-H9-DEVICE-01** optional) |
| Carry-forward H11 regate baseline | Full CRUD matrix §3 P0 program closure |

---

## Evidence chain audited (H13 delta)

| Wave | Artifact | Key signal |
|------|----------|------------|
| Prior H11 regate | `qc-p1-hrm-h11-regate-20260606.md` | **GWC** — J-HRM **7/7** · **D-HRM-INS-SUMMARY-01** + **R-H10-01** OPEN |
| H8c mobile REST | `p1-hrm-h8c-mobile-rest-qa-20260606.md` | vitest **41/41** · REST smoke **200** · device visual **GWC** |
| H13 ins summary | `p1-hrm-h13-ins-summary-qa-20260606.md` | **D-HRM-INS-SUMMARY-01 CLOSED** · cards **983** · **J-HRM-04** regression **PASS** |
| H13 AC-FID slugs | `p1-hrm-h13-ac-fid-slugs-qa-20260606.md` | **AC-FID-03** 5 slugs ≥ **0.95** · **R-H10-01 re-verified** · density **7/7** |
| Dev chain | `p1-hrm-h13-ins-summary-20260606.md` · `p1-hrm-h13-ac-fid-slugs-20260606.md` | FE count fallback · BE seed extension present |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h13-ins-summary-qa-20260606.md   # 2/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h13-ac-fid-slugs-qa-20260606.md  # 3/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h8c-mobile-rest-qa-20260606.md   # 4/8
```

**QC adjudication:** **PROCESS GWC** — all three packs auditable (L0 tables, browser/API probes, defect closure, handoff contract). Failures: `work_item_id` / `ack_status` line format (table vs script regex), `crud_or_matrix` / `portal_url` out-of-slice for mobile static wave — **not** process NO-GO per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 and prior H11 regate precedent.

**Authoritative anchors:** ins-summary → `p1-hrm-h13-ins-summary-qa-20260606.md`; AC-FID → `p1-hrm-h13-ac-fid-slugs-qa-20260606.md`; H8c → `p1-hrm-h8c-mobile-rest-qa-20260606.md`.

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot regate 2026-06-06) | ENV | **PASS** |
| **D-HRM-INS-SUMMARY-01** summary cards | PRODUCT / L2 | **CLOSED** — BHXH/BHYT/Tổng **983**; BHTN «-» correct (0 rows) |
| **R-H10-01** per-company contract_ratio | PRODUCT / fidelity | **CLOSED** — all 5 UAT slugs ≥ **0.95** |
| **AC-FID-03** five-slug wave | PRODUCT / fidelity | **CLOSED** — probe exit **0** |
| **J-HRM-01..07** consolidated localhost | PRODUCT / L2.5 | **7/7 PROMOTABLE** — J04 regression re-verified H13 |
| H8c mobile REST + light theme | PRODUCT / mobile | **PASS** static + API · device **GWC optional** |
| **AC-FID-04** insurance per-company | PRODUCT / backlog | **OPEN** — separate wave; non-blocking this gate |
| Device adb strict UI | ENV / coverage | **GWC OPTIONAL** — **C-MOB-H9-DEVICE-01** |
| localhost-only; `:8088` not re-run | DEPLOY | **GWC** — **C-HRMQC-01** deferred U32 |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-06 regate) | Result |
|-------|-----------------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## Condition closure adjudication

### D-HRM-INS-SUMMARY-01 — **CLOSED**

| Criterion | QA evidence | QC verdict |
|-----------|-------------|------------|
| Dev fix chain | `p1-hrm-h13-ins-summary-20260606.md` — count fallback + enrichment | **PASS** |
| Unit tests | `insuranceSummary.test.ts` **7/7** | **PASS** |
| Browser P-CC-05 embed | BHXH/BHYT/Tổng cộng **983** (not «-») with **983** list rows | **PASS** |
| BHTN «-» rule | 0 BHTN participants — display rule correct | **PASS** |
| UI/API parity | Footer **983** = API participation total | **PASS** |
| J-HRM-04 regression | Click Trần Văn Hùng → profile **200** · no **409** | **PASS** |

**Prior H11 regate:** P3 GWC accepted «-» with rows → **superseded CLOSED** by H13 QA browser proof.

### R-H10-01 — **CLOSED**

| Criterion | QA evidence | QC verdict |
|-----------|-------------|------------|
| Prior R-H10-01 seed | Bus `P1-HRM-R-H10-01-SEED-QA` — trsport/finance **1.000** | **PASS** (carry) |
| H13 five-slug probe | holding **0.953** · trsport **1.000** · logistics **0.952** · finance **1.000** · services **0.952** | **PASS** all ≥ **0.95** |
| Global density | `verify:hrm:menu-density` **7/7** | **PASS** |
| P-CC-04 corroboration | contracts API **200** · **50** rows @ `main` | **PASS** |

**Prior H11 regate:** **R-H10-01 OPEN (GWC)** trsport/finance gap → **CLOSED** — H13 extends closure to holding/logistics/services; no slug below **0.95**.

---

## L2.5 — J-HRM-01..07 (7/7 promotable localhost U32)

| J-ID | Journey | Evidence | L2.5 verdict | Promotable |
|------|---------|----------|--------------|------------|
| **J-HRM-01** | Hợp đồng → Hồ sơ NV | W5B + H10 + H13 P-CC-04 probe | **PASS GWC** | **YES** localhost |
| **J-HRM-02** | Nhân sự list → detail | W5B + group CEO API carry | **PASS GWC** | **YES** localhost |
| **J-HRM-03** | Hợp đồng → chi tiết HĐ | H12 browser | **PASS** | **YES** localhost |
| **J-HRM-04** | Bảo hiểm → NV → profile | J04 retest + **H13 ins-summary regression** | **PASS** | **YES** localhost |
| **J-HRM-05** | Tuyển dụng → detail | W5B carry-forward | **PASS GWC** | **YES** localhost |
| **J-HRM-06** | Chấm công → bản ghi | W5B + H10 records | **PASS GWC** | **YES** localhost |
| **J-HRM-07** | Lương → phiếu lương | H1–7 browser + H10 | **PASS** | **YES** localhost |

**Web L2.5 summary:** **7/7 promotable** on `localhost:5173` group CEO embed (`company_id=main`). H13 batch adds **no regression**; J04 re-clicked on insurance tab during ins-summary QA.

---

## H8c mobile slice (additive — not L2.5 gate change)

| Check | Result |
|-------|--------|
| vitest hrm-mobile | **41/41** exit **0** |
| type-check | exit **0** |
| Legacy dark `#0f172a` grep | **0** matches |
| REST smoke @ `uat.nv0001` | Scope · UpdateRequests · Payroll · Notifications **200** |
| Device visual L2.5 | **GWC optional** — unchanged **C-MOB-H9-DEVICE-01** |

---

## Conditions — reduced list (post-H13 regate)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| ~~**D-HRM-INS-SUMMARY-01**~~ | **CLOSED** | ~~Insurance summary cards «-» with populated list~~ | — |
| ~~**R-H10-01**~~ | **CLOSED** | ~~Per-company contract_ratio < 0.95 (trsport/finance + slugs)~~ | — |
| ~~**AC-FID-03**~~ | **CLOSED** | ~~Five UAT slugs contract_ratio backlog~~ | — |
| **C-HRMQC-01** | **OPEN (deferred U32)** | VPS/nip.io or `:8088` retest H1–H13 embed + J-* before promotion beyond localhost | devops → qa |
| **C-MOB-H9-DEVICE-01** | **OPEN (optional GWC)** | Strict adb UI L2.5 when emulator/APK available | qa-device |
| **AC-FID-04** | **OPEN (backlog)** | Per-company insurance ratio < 0.95 — CARD-INS-01 separate wave | dev-be |

**Unchanged from H11 regate:** J-HRM carry-forward GWC rows (01/02/05/06 not re-clicked this regate) — acceptable; H13 touched insurance only.

**Reopen trigger:** Summary cards revert to «-» with populated list; any slug `contract_ratio` < **0.95** after re-seed; J-HRM-04 regression; **409** scope or **500** on embed; menu-density **<7/7**.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **J-HRM-01..07** L2.5 localhost | **7/7 PROMOTABLE** |
| **D-HRM-INS-SUMMARY-01** / P-CC-05 summary | **Promotable** localhost |
| **AC-FID-03** five-slug contract_ratio | **Promotable** localhost seed state |
| H1–H7 web embed (5/5 defects) | **Promotable** localhost |
| G-FID menu-density **7/7** | **Promotable** localhost |
| H8c + H8b mobile light-theme / REST | **Promotable** static + API localhost |
| **J-MOB-01..05** API/integration | **Promotable** localhost |
| **AC-FID-04** insurance per-company | **NOT promoted** |
| Device strict UI / nip.io / `:8088` | **NOT promoted** |
| Phase 1 DONE / PROD | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor message: **H13 regate uplift** — **D-HRM-INS-SUMMARY-01** + **R-H10-01** conditions **CLOSED**; **J-HRM still 7/7** localhost U32; H8c mobile REST **PASS**. **C-HRMQC-01** VPS + **C-MOB** device remain deferred/optional.
- Sync defect register + fidelity matrix AC-FID-03 closed; journey map J-HRM-04 cites H13 ins-summary regression.
- Do **not** claim Phase 1 DONE or PROD.

---

## Completion contract

**completion_report:** P1-HRM-H13-QC-REGATE **GO WITH CONDITIONS** (further reduced). Audited H8c + H13 QA chain. **D-HRM-INS-SUMMARY-01 CLOSED** (cards **983**, J04 regression PASS). **R-H10-01 CLOSED** + **AC-FID-03** five slugs ≥ **0.95**. **J-HRM-01..07 7/7 promotable** localhost U32 confirmed. L0 spot **PASS**. **C-HRMQC-01** VPS deferred. **C-MOB-H9-DEVICE-01** optional GWC. **AC-FID-04** insurance backlog open (non-blocking). **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM-H13 post-regate governance (conditions closed · J-HRM 7/7 local U32)

work_item_id: P1-HRM-H13-PM-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-h13-regate-20260606.md — D-HRM-INS-SUMMARY-01 + R-H10-01 CLOSED; J-HRM 7/7 promotable localhost
exit_criteria: (1) Bus H13 regate recorded; (2) Defect register D-HRM-INS-SUMMARY-01 CLOSED; (3) Fidelity matrix AC-FID-03 five-slug CLOSED; (4) PROGRAM_JOURNEY_MAP J-HRM-04 cites H13 ins-summary QC ref; (5) C-HRMQC-01 :8088 deferred; C-MOB device optional; (6) NOT Phase 1 DONE / NOT PROD
evidence_path: docs/qa/evidence/qc-p1-hrm-h13-regate-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-h13-regate-20260606.md`

**ack_status:** **PASS_TO_PM**
