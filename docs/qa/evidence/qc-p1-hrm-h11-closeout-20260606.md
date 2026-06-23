# P1-HRM-H11-QC-CLOSEOUT — HRM web+mobile local slice L3 gate

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-H11-QC-CLOSEOUT` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://localhost:5173` (web) · `http://127.0.0.1:28001` (hrm-api mobile) |
| **account** | Web: `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) · Mobile: `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **executed_at** | 2026-06-06 |
| **decision** | **GO WITH CONDITIONS** — HRM web+mobile **localhost U32** slice promotable with bounded residuals |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — H11 closeout)

| In scope | Out of scope |
|----------|--------------|
| Consolidated L0–L2.5 for **J-HRM-01..07** + **J-MOB-01..05** | nip.io / VPS `:8088` (**C-HRMQC-01** deferred per U32) |
| QA chain H1–H7 · H8b · H9 · H10 · H12 journey | Phase 1 DONE / corporate PROD / `phase1:gate --strict` program |
| Sponsor: no visible business defects on local slice | Full CRUD matrix §3 P0 program closure |
| User policy **U32 local only** | Device strict adb UI (optional) |

---

## Evidence chain audited

| Wave | Artifact | Key signal |
|------|----------|------------|
| H1–H7 QC | `qc-p1-hrm-h1-7-20260606.md` | **GWC** — 5/5 web defects CLOSED; **J-HRM-07** browser PASS; menu-density **7/7** |
| H8b mobile tabs | `p1-hrm-h8b-mobile-tabs-qa-20260606.md` | **PASS** — 41/41 vitest; light-theme tabs; J-MOB-03 API smoke |
| H9 mobile func | `p1-hrm-mob-func-audit-20260606.md` | **PASS** — **J-MOB-01..05** API probe + 37/37 vitest + BE jest 2/2 |
| H10 fidelity | `p1-hrm-h10-fidelity-qa-20260606.md` | **PASS GWC R-H10-01** — density **7/7**; P-CC-04/05/07/08 data @ main |
| H12 journey | `p1-hrm-h12-journey-qa-20260606.md` | **J-HRM-03 PASS** · **J-HRM-04 FAIL** — `D-HRM-J04-CLICK-01` P1 |
| H12 J04 fix (pending QA) | `p1-hrm-h12-j04-fix-20260606.md` | Dev-FE **READY_FOR_QA** — Link + workforce id resolve; **no QA retest file yet** |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h12-journey-qa-20260606.md   # 2/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h10-fidelity-qa-20260606.md  # 1/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h8b-mobile-tabs-qa-20260606.md # 1/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-mob-func-audit-20260606.md   # 5/8
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-h1-7-20260606.md          # 1/8
```

**QC adjudication:** **PROCESS GWC** — all packs auditable (runtime tables + handoff fields in body); failures are **format/out-of-slice**, not missing artifact. Per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 — **not** process NO-GO for bounded localhost slice.

**Authoritative closeout anchor:** `p1-hrm-h12-journey-qa-20260606.md` (latest L2.5 browser evidence for J03/J04).

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-06) | ENV | **PASS** |
| L1 `qc:fe-be-health` exit **0** (H10/H12) | ENV/PRODUCT | **PASS** |
| G-FID menu-density **7/7** (H10) | PRODUCT | **PASS** |
| H1–H7 web defects 5/5 closed (H1–7 QC) | PRODUCT | **PASS** |
| **J-HRM-03** browser L2.5 (H12) | PRODUCT / L2.5 | **PASS** — `D-HRM-J03-DRAWER-01` **CLOSED** |
| **J-HRM-04** browser L2.5 (H12) | PRODUCT / L2.5 | **FAIL** — retest **PENDING** after `P1-HRM-H12-J04-FIX` |
| **J-HRM-01/02/05/06/07** | PRODUCT / L2.5 | **PASS GWC** — carry-forward + H1–7/H10 API; no regression signal |
| **J-MOB-01..05** API localhost (H9 + H8b) | PRODUCT / mobile API | **PASS** |
| Device adb strict UI L2.5 | ENV / coverage | **GWC** — **C-MOB-H9-DEVICE-01** |
| **R-H10-01** trsport/finance contract_ratio | PRODUCT / fidelity | **GWC** — global gate 7/7 PASS; per-company gap |
| P2 residuals (insurance count, dash date, dark tabs) | UX / P2 | **GWC ACCEPTED** — sponsor non-blocking |
| localhost-only; `:8088` not re-run | DEPLOY | **GWC** — **C-HRMQC-01** deferred U32 |
| Sponsor: no visible business defects | ACCEPTANCE | Concurs bounded local promotable slice |

---

## L0 — Dev stack health

| Check | QC spot (2026-06-06) | Result |
|-------|----------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## L2.5 — J-HRM-01..07 (mandatory closeout matrix)

| J-ID | Journey | Evidence | L2.5 verdict | Notes |
|------|---------|----------|--------------|-------|
| **J-HRM-01** | Hợp đồng → Hồ sơ NV | W5B + H10 API carry-forward | **PASS GWC** | Scope parity API; browser not re-clicked H11 |
| **J-HRM-02** | Nhân sự list → detail | W5B + H10 carry-forward | **PASS GWC** | API parity; browser GWC carry |
| **J-HRM-03** | Hợp đồng → chi tiết HĐ | **H12 browser** | **PASS** | Eye → **Chi tiết hợp đồng** dialog; defect **CLOSED** |
| **J-HRM-04** | Bảo hiểm → NV linked → profile | **H12 browser FAIL** · FE fix READY_FOR_QA | **FAIL → CONDITION OPEN** | **Retest pending** — see § J04 below |
| **J-HRM-05** | Tuyển dụng → detail | W5B carry-forward | **PASS GWC** | Not re-run H11; data present @ main |
| **J-HRM-06** | Chấm công → bản ghi | W5B + H10 records | **PASS GWC** | 50+ attendance rows @ main |
| **J-HRM-07** | Lương → phiếu lương | H1–7 browser + H10 | **PASS** | Payslip detail dialog; 893 payslips |

**Web L2.5 summary:** **6/7 PASS or GWC** · **1/7 CONDITION OPEN** (**J-HRM-04** retest pending).

### J-HRM-04 — retest status (explicit)

| Stage | Status | Owner |
|-------|--------|-------|
| H12 QA browser | **FAIL** — `hasLink: false`; `D-HRM-J04-CLICK-01` P1 | qa (2026-06-06) |
| Dev-FE fix | **READY_FOR_QA** — `p1-hrm-h12-j04-fix-20260606.md` | dev-fe |
| QA retest J-HRM-04 only | **NOT EXECUTED** — no `*-j04-retest-*.md` | **qa** (next) |

**QC rule (U19):** Cannot promote **J-HRM-04** to full PASS on journey map until QA browser retest PASS after FE fix. Sponsor «no visible defects» does **not** waive L2.5 documentation gap.

---

## L2.5 — J-MOB-01..05 (mobile)

| J-ID | Evidence | Verdict | Notes |
|------|----------|---------|-------|
| **J-MOB-01** | H9 probe + H8b login | **PASS** | UUID scope; header `holding` |
| **J-MOB-02** | H9 probe | **PASS** | GPS 201; idempotent 400 OK |
| **J-MOB-03** | H9 + H8b history | **PASS** | 6 leaves; list→detail 200 |
| **J-MOB-04** | H9 probe | **PASS** | 1 payslip; net 82.34M VND |
| **J-MOB-05** | H9 probe | **PASS** | Approve 201; `HRM-ATT-REQ-203` mapped |

**Mobile summary:** **5/5 PASS** API/integration localhost. Strict device UI tap **GWC** — prior R4 baseline + **C-MOB-H9-DEVICE-01**.

---

## Accepted P2/P3 residuals (non-blocking)

| ID | Sev | Description | Owner |
|----|-----|-------------|-------|
| **D-HRM-INS-UI-02** | P2 | Insurance row count UX (H12 P2 may address) | dev-fe backlog |
| **D-HRM-DASH-DATE-01** | P2 | Dashboard expiry date drift | dev-fe backlog |
| **H8-LEGACY-DARK-TABS** | P2 | Non-H8b tabs still dark inline | dev-mobile backlog |
| **D-HRM-INS-SUMMARY-01** | P3 | Insurance summary cards «-» with 2 rows | dev-fe backlog |
| **D-HRM-PAY-I18N-01** | P3 | Payslip status i18n object leak | dev-fe backlog |

---

## Conditions (bounded)

| ID | Condition | Owner | Trigger to close |
|----|-----------|-------|------------------|
| **C-HRMQC-01** | VPS/nip.io or `:8088` retest H1–H12 embed + J-* before pilot promotion beyond localhost | devops → qa | **Deferred U32** — browser PASS on pilot URL |
| **C-HRMQC-H11-J04** | QA retest **J-HRM-04** only after `P1-HRM-H12-J04-FIX` — insurance name → profile 200 | **qa** | New evidence `p1-hrm-h12-j04-retest-*.md` PASS |
| **C-HRMQC-H11-PACK** | QA pack format — `portal_url` + `## Residual` on future waves | qa | `verify:qc:evidence-pack` **8/8** |
| **C-HRMQC-H11-MAP** | Sync `PROGRAM_JOURNEY_MAP.md` J-HRM-04 status post J04 retest | pm | Row cites J04 retest or this file |
| **R-H10-01** | `trsport` / `finance` per-company contract_ratio vs 0.95 | dev-be | Seed cohort fix + density persona spot |
| **C-MOB-H9-DEVICE-01** | Strict adb UI L2.5 when emulator/APK available | qa-device | Device script PASS |
| **C-MOB-H9-APK-01** | Rebuild `dist/hrm-mobile-release.apk` before device retest | dev-mobile | APK present |

**Reopen trigger:** **J-HRM-04** retest FAIL after FE fix; H1–H7 target defect reopens; **409** scope or **500** on embed; **J-MOB** probe **401/409** on localhost; menu-density **<7/7**.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| H1–H7 web embed (5/5 defects) | **Promotable** localhost `:5173` group CEO |
| **J-HRM-03** · **J-HRM-07** browser L2.5 | **Promotable** localhost |
| **J-HRM-01/02/05/06** | **Promotable GWC** — carry-forward |
| **J-HRM-04** | **NOT promoted** — retest pending (**C-HRMQC-H11-J04**) |
| G-FID menu-density **7/7** | **Promotable** localhost |
| H8b mobile light-theme tabs | **Promotable** (static + 41/41 vitest) |
| **J-MOB-01..05** API/integration | **Promotable** localhost `:28001` |
| P2 UX residuals | **ACCEPTED GWC** |
| Device strict UI / nip.io / `:8088` | **NOT promoted** |
| Phase 1 DONE / PROD | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor message: **HRM H11 closeout GWC on local U32** — web embed H1–H7 green, **J-HRM-03/07** browser PASS, mobile **J-MOB-01..05** API green, fidelity **7/7**. **J-HRM-04** needs one QA retest after FE fix (READY_FOR_QA) before claiming 7/7 L2.5. **:8088** unchanged until **C-HRMQC-01**.
- Dispatch **qa** narrow **J-HRM-04** retest first (non-blocking for rest of slice).
- Dispatch **pm** to sync journey map J-HRM-04 row after J04 retest.
- Do **not** claim Phase 1 DONE — program gates remain open.

---

## Completion contract

**completion_report:** P1-HRM-H11-QC-CLOSEOUT **GO WITH CONDITIONS** on **localhost U32**. Audited full QA chain (H1–7 QC, H8b, H9, H10, H12). L0 spot **PASS**. **J-HRM:** 03 PASS browser; 07 PASS; 01/02/05/06 GWC carry-forward; **04 FAIL — retest pending** after `p1-hrm-h12-j04-fix-20260606.md` READY_FOR_QA. **J-MOB:** 01..05 API **PASS**. **R-H10-01** per-company fidelity GWC. Sponsor no visible defects concurs bounded promotion. **C-HRMQC-01** VPS deferred U32. **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM-H11 post-QC governance (local U32 HRM web+mobile slice)

work_item_id: P1-HRM-H11-PM-01
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-h11-closeout-20260606.md — GO WITH CONDITIONS localhost; J-HRM 6/7+GWC; J-MOB 5/5 API; J-HRM-04 retest pending
exit_criteria: (1) Bus H11 closeout recorded; (2) Dispatch qa P1-HRM-H12-J04-RETEST — J-HRM-04 only after p1-hrm-h12-j04-fix-20260606.md; (3) Refresh PROGRAM_JOURNEY_MAP J-HRM-04 after retest; (4) C-HRMQC-01 :8088 deferred with owner+expiry; (5) NOT Phase 1 DONE
evidence_path: docs/qa/evidence/qc-p1-hrm-h11-closeout-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-h11-closeout-20260606.md`

**ack_status:** **PASS_TO_PM**
