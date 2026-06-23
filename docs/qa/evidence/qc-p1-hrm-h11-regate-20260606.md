# P1-HRM-H11-QC-REGATE — J-HRM-04 retest closeout (H11 slice uplift)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-H11-QC-REGATE` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://localhost:5173` (web) · `http://127.0.0.1:28001` (hrm-api mobile) |
| **account** | Web: `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) · Mobile: `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **executed_at** | 2026-06-06 |
| **prior_gate** | `qc-p1-hrm-h11-closeout-20260606.md` — **GO WITH CONDITIONS** · **C-HRMQC-H11-J04** OPEN |
| **decision** | **GO WITH CONDITIONS** — **J-HRM-01..07 7/7 promotable** localhost U32; reduced condition list |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — H11 regate after J04 PASS)

| In scope | Out of scope |
|----------|--------------|
| Re-adjudicate **J-HRM-04** after `P1-HRM-H12-J04-RETEST` | nip.io / VPS `:8088` (**C-HRMQC-01** deferred U32) |
| Close **C-HRMQC-H11-J04** if retest valid | Phase 1 DONE / corporate PROD / `phase1:gate --strict` program |
| Confirm **J-HRM-01..07** 7/7 promotable localhost | Full CRUD matrix §3 P0 program closure |
| Carry-forward H11 mobile + fidelity slice unchanged | Strict adb device UI (optional **C-MOB-H9-DEVICE-01**) |

---

## Evidence chain audited (regate delta)

| Wave | Artifact | Key signal |
|------|----------|------------|
| Prior H11 closeout | `qc-p1-hrm-h11-closeout-20260606.md` | **GWC** — J04 **CONDITION OPEN** · 6/7+GWC |
| H12 J04 FAIL (baseline) | `p1-hrm-h12-journey-qa-20260606.md` | `D-HRM-J04-CLICK-01` P1 · `hasLink: false` |
| Dev-FE fix | `p1-hrm-h12-j04-fix-20260606.md` | Workforce id resolve + `Link` parity · vitest **6/6** · hrm **125/125** |
| **J04 retest (authoritative)** | `p1-hrm-h12-j04-qa-20260606.md` | **J-HRM-04 PASS** · **D-HRM-J04-CLICK-01 CLOSED** · **D-HRM-INS-UI-02 CLOSED** |
| H11 carry-forward (unchanged) | `qc-p1-hrm-h1-7-20260606.md` · H8b/H9/H10 packs | H1–H7 · J-MOB · G-FID **7/7** |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h12-j04-qa-20260606.md  # 3/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-h11-closeout-20260606.md  # (prior — process GWC)
```

**QC adjudication:** **PROCESS GWC** — J04 retest pack auditable (L0/L1 tables, browser click paths A+B, defect closure, handoff YAML). Failures: `work_item_id` line format, `crud_or_matrix` out-of-slice, `## Residual` heading — **not** process NO-GO per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3.

**Authoritative J04 anchor:** `p1-hrm-h12-j04-qa-20260606.md`.

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot regate 2026-06-06) | ENV | **PASS** |
| L1 `qc:fe-be-health` exit **0** (J04 QA) | ENV/PRODUCT | **PASS** |
| **J-HRM-04** browser L2.5 retest | PRODUCT / L2.5 | **PASS** — **C-HRMQC-H11-J04 CLOSED** |
| **D-HRM-J04-CLICK-01** | DEFECT P1 | **CLOSED** |
| **D-HRM-INS-UI-02** | DEFECT P2 | **CLOSED** — UI **983** = API **983** |
| **J-HRM-01..07** consolidated localhost | PRODUCT / L2.5 | **7/7 PROMOTABLE** — see § matrix |
| **J-MOB-01..05** API (H9 carry) | PRODUCT / mobile | **PASS** — unchanged |
| **R-H10-01** trsport/finance contract_ratio | PRODUCT / fidelity | **GWC** — per-company gap non-blocking |
| **D-HRM-INS-SUMMARY-01** summary cards «-» | UX / P3 | **GWC ACCEPTED** |
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

## L2.5 — J-HRM-01..07 (7/7 promotable localhost U32)

| J-ID | Journey | Evidence | L2.5 verdict | Promotable |
|------|---------|----------|--------------|------------|
| **J-HRM-01** | Hợp đồng → Hồ sơ NV | W5B + H10 carry-forward | **PASS GWC** | **YES** localhost |
| **J-HRM-02** | Nhân sự list → detail | W5B + group CEO API carry | **PASS GWC** | **YES** localhost |
| **J-HRM-03** | Hợp đồng → chi tiết HĐ | H12 browser | **PASS** | **YES** localhost |
| **J-HRM-04** | Bảo hiểm → NV → profile | **J04 retest browser** | **PASS** | **YES** localhost |
| **J-HRM-05** | Tuyển dụng → detail | W5B carry-forward | **PASS GWC** | **YES** localhost |
| **J-HRM-06** | Chấm công → bản ghi | W5B + H10 records | **PASS GWC** | **YES** localhost |
| **J-HRM-07** | Lương → phiếu lương | H1–7 browser + H10 | **PASS** | **YES** localhost |

**Web L2.5 summary:** **7/7 promotable** on `localhost:5173` group CEO embed (`company_id=main`).

**U19 note:** J04 retest satisfies mandatory browser click path (paths A+B documented). J01/02/05/06 remain **GWC carry-forward** (not re-clicked H11 regate) — acceptable per prior H11/H1–7 QC adjudication; no regression signal.

### J-HRM-04 — closure adjudication

| Criterion | QA evidence | QC verdict |
|-----------|-------------|------------|
| FE fix chain present | `p1-hrm-h12-j04-fix-20260606.md` | **PASS** |
| Browser click insurance → profile | Lê Văn An LOG-0003 → `/hr/employees/b2b02b49-…` | **PASS** |
| Corroboration second row | Trần Văn Hùng VTH-0962 → profile **200** | **PASS** |
| Scope / embed params | `portal=1` · `companyId=main` · no 409 | **PASS** |
| API corroboration | `GET /employees/:id` → **200** `HRM-EMP-200` | **PASS** |
| Prior P1 defect | `D-HRM-J04-CLICK-01` | **CLOSED** |

**Condition closed:** **C-HRMQC-H11-J04** — retest valid; no reopen.

---

## L2.5 — J-MOB-01..05 (unchanged from H11 closeout)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-MOB-01..05** | **PASS** API localhost | H9 + H8b · 37/37 vitest · device UI **GWC optional** |

---

## Conditions — reduced list (post-regate)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| ~~**C-HRMQC-H11-J04**~~ | **CLOSED** | ~~J-HRM-04 retest after FE fix~~ | — |
| **C-HRMQC-01** | **OPEN (deferred U32)** | VPS/nip.io or `:8088` retest H1–H12 embed + J-* before promotion beyond localhost | devops → qa |
| **C-MOB-H9-DEVICE-01** | **OPEN (optional GWC)** | Strict adb UI L2.5 when emulator/APK available | qa-device |
| **R-H10-01** | **OPEN (GWC)** | `trsport` / `finance` per-company contract_ratio vs 0.95 | dev-be |
| **D-HRM-INS-SUMMARY-01** | **OPEN (P3 GWC)** | Insurance summary cards «-» with populated list | dev-fe backlog |

**Removed / downgraded from H11 closeout:**

| ID | Disposition |
|----|-------------|
| **C-HRMQC-H11-MAP** | Satisfied by this regate + journey map sync |
| **C-HRMQC-H11-PACK** | Downgraded — process GWC only; not blocking localhost slice |
| **C-MOB-H9-APK-01** | Folded into optional device lane |

**Reopen trigger:** J-HRM-04 regression on insurance click; **409** scope or **500** on embed; menu-density **<7/7**; H1–H7 target defect reopen.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **J-HRM-01..07** L2.5 localhost | **7/7 PROMOTABLE** |
| H1–H7 web embed (5/5 defects) | **Promotable** localhost |
| G-FID menu-density **7/7** | **Promotable** localhost |
| H8b mobile light-theme tabs | **Promotable** (static + 41/41 vitest) |
| **J-MOB-01..05** API/integration | **Promotable** localhost |
| P3 **D-HRM-INS-SUMMARY-01** | **GWC accepted** |
| Device strict UI / nip.io / `:8088` | **NOT promoted** |
| Phase 1 DONE / PROD | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor message: **H11 regate uplift** — **J-HRM-04 PASS** closes last L2.5 blocker; **7/7 J-HRM promotable localhost U32**. Mobile **J-MOB-01..05** unchanged. **:8088**/nip.io still **C-HRMQC-01** deferred.
- Sync `PROGRAM_JOURNEY_MAP.md` J-HRM-04 → ✅ PASS (this file).
- Do **not** claim Phase 1 DONE or PROD.

---

## Completion contract

**completion_report:** P1-HRM-H11-QC-REGATE **GO WITH CONDITIONS** (reduced). Audited J04 chain: FE fix → QA retest PASS. **C-HRMQC-H11-J04 CLOSED**. **J-HRM-01..07 7/7 promotable** localhost U32 (4 carry-forward GWC + 3 fresh browser PASS incl. J04). L0 spot **PASS**. **C-HRMQC-01** VPS deferred. **C-MOB-H9-DEVICE-01** optional GWC. **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM-H11 post-regate governance (J-HRM 7/7 local U32)

work_item_id: P1-HRM-H11-PM-02
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-h11-regate-20260606.md — J-HRM 7/7 promotable localhost; C-HRMQC-H11-J04 CLOSED
exit_criteria: (1) Bus regate recorded; (2) PROGRAM_JOURNEY_MAP J-HRM-04 → ✅ PASS cites regate file; (3) Defect register D-HRM-J04-CLICK-01 + D-HRM-INS-UI-02 CLOSED; (4) C-HRMQC-01 :8088 deferred with owner; (5) NOT Phase 1 DONE / NOT PROD
evidence_path: docs/qa/evidence/qc-p1-hrm-h11-regate-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-h11-regate-20260606.md`

**ack_status:** **PASS_TO_PM**
