# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-REC-00 C-SLICE only** · **not** module REC UAT |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-5) |
| **depends_on** | QA-02 `PASS_TO_PM` stamp **`REC00QA2-MSL0EZS5`** · FE-02 COMMENT-ASTERISK FIX · BE-01 LIVE |
| **uc_ids** | `UC-BP-REC-00` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | **PASS_TO_PM** |
| **qa_ref** | [`po-hrm-mvp-gd1-rec-00-cluster-qa-02.md`](po-hrm-mvp-gd1-rec-00-cluster-qa-02.md) |
| **be_ref** | [`po-hrm-mvp-gd1-rec-00-cluster-be-01.md`](po-hrm-mvp-gd1-rec-00-cluster-be-01.md) |
| **fe_ref** | [`po-hrm-mvp-gd1-rec-00-cluster-fe-02.md`](po-hrm-mvp-gd1-rec-00-cluster-fe-02.md) |
| **ba_ref** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md) AC-REC-JD-00-01..05 · P01–P05 · O1–O7 |
| **api_ref** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md) F-JD-01..04 · PUB-* · physical `/recruitment/job-templates*` |
| **sa_ref** | [`PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-SA-01.md) Option A LOCKED |
| **machine** | `_tmp-po-hrm-mvp-gd1-rec-00-cluster-qa-02.json` · overall **PASS** · stamp **`REC00QA2-MSL0EZS5`** |
| **stamp** | QC **`REC00QC1-MSL0JMUT`** · QA **`REC00QA2-MSL0EZS5`** |
| **U65** | zero-seed · browser FE-after-2xx + F5 · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` |
| **portal_url** | portal `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=jd-library` · HRM `:28001` |

---

## Honesty locks (mandatory)

| Flag / claim | Value | QC |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module REC UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **`SERVICE_READINESS` promote** | **DENIED** | Out of slice |
| **Nest `/rec` dual SoT** | **DENIED** | QA 0 Nest `/rec` browser hits · L1 `/rec/job-descriptions` 404 |
| **Boolean-only UI PASS** | **DENIED** | status chips Nháp/Hiệu lực/Ngừng proven |
| **Seed in evidence** | **DENIED** (U65) | QA + QC no seed |
| **Reopen W1–W4 sealed AC** | **DENIED** | RETAIN prior GWC |
| **C-SLICE-≠-MODULE** | **RETAIN** | Wave-5 JD GWC ≠ module GO |

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `jd_dynamic_done=true`? | **NO** |
| May PM claim module REC UAT / Phase1 DONE from this seat? | **NO** |
| May PM promote `SERVICE_READINESS`? | **NO** |
| May PM open next UC seat **UC-BP-REC-04** (board #8) as **sa Option**? | **YES** (U88/U89 continuous) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT narrow seal for continuous cluster **UC-BP-REC-00** (JD master library) after QA stamp **`REC00QA2-MSL0EZS5`**.

Audited: QA-02 MD · machine JSON L0/L1/network/journeys · FE-02 COMMENT-ASTERISK · BE-01 LIVE · BA AC-REC-JD-00 · API F-JD-01..04 · SA Option A.

**U65 ACCEPT:** Thư viện JD mounts (no whitescreen) · chips Nháp/Hiệu lực/Ngừng · draft POST 201 → publish POST `/publish` 201 → soft Ngừng DELETE 200 · CODE-DUP 409 toast · Network physical `/recruitment/job-templates*` only.

**Seal:** **`R-REC-00-FE-COMMENT-ASTERISK` CLOSED** (FE-02 + QA-02 mount seal).

**OBS ACCEPT (non-blocking):** YCTD create picker UI not opened this run — AC-04 sealed via L1 `bindable=true` active-only + EX-05 `HRM-JD-YCTD-STATUS` 400 · soft FK cite **J-HRM-JD-YCTD-01** RETAIN.

**NOT Phase 1 DONE. NOT module REC UAT. NOT `jd_dynamic_done=true`.**

---

## Classification

| Signal | Class | Disposition |
|--------|-------|-------------|
| J-HRM-REC-JD-00-01..04 browser + AC-REC-JD-00-01..05 | PRODUCT L2.5 | **ACCEPT** this seat |
| R-REC-00-FE-COMMENT-ASTERISK mount / Vite parse | PRODUCT | **CLOSED** · seal |
| Draft→publish→retire · CODE-DUP 409 | PRODUCT | **ACCEPT** |
| Nest `/rec` dual · 0 browser hits · L1 404 | PRODUCT / GOVERNANCE | **ACCEPT** · DENY dual |
| YCTD picker UI `picker_missing` | PRODUCT **P3 OBS** | **ACCEPT** non-blocking · L1+EX-05 seal |
| QA pack `verify:qc:evidence-pack` 2/8 miss `command_table` + `residual_section` | PROCESS | **OBS** — QC consolidates **8/8** below |
| Stack ENV | ENV | L0 hrm/xbos/portal **200** (QC spot `qc:dev-stack`) |
| Honesty / seed / boolean-only / W1–W4 | GOVERNANCE | **LOCKED DENY** |

---

## Audit checklist (mission)

| # | Check | Evidence | QC |
|---|-------|----------|-----|
| 1 | Mount no whitescreen | JSON `mount.whitescreen=false` · bodyChars=1414 · Thư viện visible · Vite JobTemplates **200** | 🟢 |
| 2 | Chips Nháp / Hiệu lực / Ngừng | Filter labels VI · row chips · F5 | 🟢 |
| 3 | Draft → publish → retire | POST 201 draft · POST `/publish` 201 active · DELETE 200 retired | 🟢 |
| 4 | CODE-DUP 409 toast | POST job-templates **409** `HRM-JD-CODE-DUP` · toast VI | 🟢 |
| 5 | Network `/recruitment/job-templates` only | machine: **16** job-templates hits · **0** Nest `/rec` | 🟢 |
| 6 | R-REC-00-FE-COMMENT-ASTERISK CLOSED | FE-02 + QA-02 mount | 🟢 **CLOSED** |
| 7 | OBS YCTD picker non-blocking | L1 bindable active-only + EX-05 STATUS · picker OBS | 🟢 **ACCEPT OBS** |
| 8 | DENY Nest `/rec` · seed · honesty · module UAT · boolean-only | QA honesty footer + QC locks | 🟢 **RETAIN** |
| 9 | Evidence pack | QA PROCESS OBS · QC consolidates | 🟢 **8/8** |

### Evidence pack

| Check | Status |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-02.md` | exit **1** · **2/8** miss `command_table` + `residual_section` → **PROCESS OBS** |
| QC SoT pack this file | 🟢 **8/8** below |
| QC spot `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (node UV exit assert on Windows — health checks PASS) |

#### QC command table

| Command | Exit / result | Class |
|---------|---------------|-------|
| QA `qc:dev-stack` / L0 (cited) | hrm/portal **200** | ENV/L0 |
| QC spot `qc:dev-stack` | hrm/xbos/portal **200** | ENV/L0 |
| QA L1 list/publish/bindable/nest-rec | 200 / 404 route LIVE / active-only / Nest `/rec` 404 | PRODUCT |
| QA runner `_tmp-po-hrm-mvp-gd1-rec-00-cluster-qa-02` | overall **PASS** stamp `REC00QA2-MSL0EZS5` | PRODUCT |
| `verify:qc:evidence-pack` QA-02 | **2/8** PROCESS OBS | PROCESS |

### Pack consolidation (8/8 — QC SoT)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ |
| 2 | ack_status | ✅ `PASS_TO_PM` |
| 3 | command_table | ✅ above |
| 4 | portal_url | ✅ portal `127.0.0.1:5173` · `:28001` · tab=jd-library |
| 5 | journey_l25 | ✅ **J-HRM-REC-JD-00-01..04** 🟢 |
| 6 | crud_or_matrix | ✅ AC-REC-JD-00-01..05 · P03–P05 · EX-05 |
| 7 | residual_section | ✅ below · COMMENT-ASTERISK CLOSED · picker OBS P3 |
| 8 | timestamp | ✅ 2026-08-09 |

---

## J-* L2.5 (U19)

| J-ID | Verdict | Notes |
|------|---------|-------|
| **J-HRM-REC-JD-00-01** | **PASS** | Mount + chips + F5 · no whitescreen |
| **J-HRM-REC-JD-00-02** | **PASS** | Draft → publish Hiệu lực · physical `/publish` |
| **J-HRM-REC-JD-00-03** | **PASS** | L1 bindable + EX-05 · OBS picker UI |
| **J-HRM-REC-JD-00-04** | **PASS** | Soft Ngừng DELETE 200 |
| Module REC UAT J-* promote | **DENIED** | C-SLICE |
| **J-HRM-JD-YCTD-01** soft FK | **PASS_RETAIN** | not re-litigated |

### L2.5 journey matrix (pack)

| Journey | Result |
|---------|--------|
| J-HRM-REC-JD-00-01 | **PASS** |
| J-HRM-REC-JD-00-02 | **PASS** |
| J-HRM-REC-JD-00-03 | **PASS** (OBS picker) |
| J-HRM-REC-JD-00-04 | **PASS** |

### Screens (9)

`docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-00-cluster-qa-02/` — 01 library · 02 F5 · 03 Lưu nháp · 04 draft F5 · 05 publish · 06 CODE-DUP · 07 retire · 08 requisitions · 09 yctd-picker (OBS empty picker path).

---

## Conditions (GWC)

1. **Honesty:** keep `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **DENY** module REC UAT · Phase1 · `SERVICE_READINESS` · Nest `/rec` dual · boolean-only PASS · seed · reopen W1–W4.
2. **`R-REC-00-FE-COMMENT-ASTERISK`:** **CLOSED** this seat (FE-02 + QA-02) — no reopen as P0.
3. **Condition P3 OBS YCTD picker UI:** create dialog JD picker not opened this run — **ACCEPT** non-blocking · sealed by L1 bindable active-only + EX-05 `HRM-JD-YCTD-STATUS` · optional FE smoke later · **not** reopen J-01/02/04.
4. **RETAIN** SA Option A physical `job_description_templates` + `/recruitment/job-templates*` · status bridge · soft FK J-HRM-JD-YCTD-01.
5. **NOT** Phase 1 DONE · **NOT** module REC UAT · Wave-5 **SEALED GWC** ≠ program exit.

---

## Residual

| ID | Sev | Status | Owner |
|----|-----|--------|-------|
| **R-REC-00-FE-COMMENT-ASTERISK** | P0 was | **CLOSED** | — seal |
| **YCTD picker UI OBS** | P3 | OPEN / idle-ok | optional **dev-fe** / **qa** smoke when YCTD create dialog opened |
| Honesty / C-SLICE / `jd_dynamic_done` | — | RETAIN | **pm** — DENY flip |
| QA pack PROCESS | OBS | consolidated | — |

**No residual PRODUCT P0** from J-HRM-REC-JD-00-01..04 browser matrix.

---

## DENY

- Flip `recruitment_uat_ready` / `jd_dynamic_done` / claim module REC UAT / Phase1 DONE  
- Promote `SERVICE_READINESS`  
- Nest `/rec` dual SoT · second JD SoT · boolean-only MVP claim  
- Seed / reopen W1–W4 sealed UF  
- Treat GWC as module GO  

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **sa** (board #8 **UC-BP-REC-04** Option) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qc-01.md` |
| **completion_report** | GWC C-SLICE UC-BP-REC-00: J-HRM-REC-JD-00-01..04 PASS (mount/chips/draft→publish→retire/CODE-DUP) · R-REC-00-FE-COMMENT-ASTERISK CLOSED · Network physical job-templates only · Nest `/rec` DENY · U65. Conditions: honesty false · jd_dynamic_done false · YCTD picker OBS P3 idle-ok. DENY module REC UAT / Phase1 / seed / W1–W4 reopen / boolean-only. Next continuous: **UC-BP-REC-04** SA Option. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-REC-04
depends_on: QC-01 GWC PASS_TO_PM evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qc-01.md · stamp REC00QC1-MSL0JMUT · Wave-5 UC-BP-REC-00 SEALED
board: docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md — next after REC-00 (#7) = **UC-BP-REC-04** (#8 QUEUED) «Quét kho CV nội bộ trước kênh ngoài»
spec_ref: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-04 · BR-BP-CV-01

MISSION — SA Option seat (narrow):
1) Option A/B/C for internal CV scan-before-external vs AS-IS candidates pool / applications / YCTD spine
2) F.1 API map + must_keep REC-00/01/02/08/06a seals · DENY Nest /rec dual · DENY invent second CV SoT · DENY REC-03 Campaign reopen
3) Lock decision + unlock BA AC next — cấm code until Option CONFIRMED
cấm: honesty flip · recruitment_uat_ready · jd_dynamic_done · module REC UAT · seed · reopen sealed REC-00 J-HRM-REC-JD-00-01..04 without regression
exit: evidence docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-SA-01.md · PASS_TO_PM · next ba-process AC
```
