# Evidence — PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01` |
| **lane** | governance · sa |
| **date** | 2026-08-09 |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-19 #21) |
| **uc_ids** | `UC-BP-CORE-05` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md` |
| **depends_on** | DATA-01 CONFIRMED · BA-01 O1–O12 · SA-01 Option A · R-CORE-05-HANDOVER-01 · R-CORE-05-CAT-SERIAL-01 · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok |

---

## Verdict

**CONFIRMED** — RETAIN cite **F-CORE-AST-01** physical `/api/hrm/employees/:id/assets*` + ADD residual **F-CORE-AST-BB-01** confirm PATCH + serial **409** wire · paper `/core` alias only · unlock **Dev-BE + Dev-FE**.

| Gate | Result |
|------|--------|
| F.1 Mục đích + Nghiệp vụ + SRS Diễn biến #1–#2 (AST-01 + BB-01) | **PASS** §4–§5 |
| DTO↔DB DATA-01 spine HOLD + soft confirm cols | **PASS** §4.5 · §5.5 |
| Serial 409 `HRM-EMP-ASSET-SERIAL-CONFLICT` · unique index HOLD | **PASS** §6 |
| Soft-delete prefer · F-CORE-AST-02 OUT invent DONE | **PASS** §7 |
| Display-ready confirm flags · U19 list=get=mutate | **PASS** §8 |
| Nest `/core` DENY · Asset ledger DENY · notes-only ≠ BB | **PASS** §10 |
| must_keep CORE-03..01 · OBS P2 idle-ok · honesty false | **PASS** §10 |
| Unlock Dev-BE + Dev-FE (was HOLD until API CONFIRMED) | **PASS** §12 · §14 |
| Docs-only (no apps/** this seat) | **PASS** |

---

## AS-IS cite (read-only)

| Fact | Cite |
|------|------|
| Assets Nest routes LIVE | `employees.controller.ts` `GET/POST …/assets` · `PATCH/DELETE …/assets/:assetId` · codes `HRM-EMP-PROFILE-200/201/202` |
| Table LIVE | `employee-profile.service.ts` `ensureSchema` `public.employee_assets` spine |
| `updateAsset` allowlist | spine fields only — **gap** confirm cols |
| BB confirm cols / handover | **ABSENT** — DATA gap PROVEN · ADD soft cols |
| Serial conflict gate | **ABSENT** — wire residual |
| Soft-delete | Hard `deleteProfileRow` LIVE — prefer status soft |
| CoreModule | DB export only — **no** `@Controller('core')` AST SoT |
| F-CORE-AST-02 / CORE-06 | **OUT invent DONE** · QUEUED depends_on |

---

## Honesty (LOCKED false)

- `recruitment_uat_ready=false`
- `jd_dynamic_done=false`
- `contracts_printable_ready=false`
- `hrm_personnel_uat_ready=false`
- **C-SLICE** · U65 · **DENY** claim CRUD = CORE-05/BB DONE · CORE-03 = personnel · CORE-06/07 / printable / closed-8 DONE

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 CONFIRMED: RETAIN F-CORE-AST-01 physical assets* + ADD F-CORE-AST-BB-01 confirm + serial 409 · soft prefer · AST-02 OUT · must_keep CORE-03..01 · DENY Nest dual / Asset ledger / false DONE · unlock Dev-BE+FE. |
| **next_owner** | **pm** → **dev-be** + **dev-fe** |
| **next_dispatch_prompt** | Spec §13 (BE-01 + FE-01 parallel) |
| **evidence_path** | this file + API-01 spec |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
