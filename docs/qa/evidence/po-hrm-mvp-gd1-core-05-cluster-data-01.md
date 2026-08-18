# Evidence — PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-19) |
| **uc_ids** | `UC-BP-CORE-05` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A · R-CORE-05-HANDOVER-01 · gap PROVEN · R-CORE-05-CAT-SERIAL-01 · `CORE03QC1-MSLFJH0K` · `CORE02BQC1-MSLEFQC1` · peer `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · `R-CORE-03-CC-EMBED-OBS` P2 idle-ok |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | **ADD** BB confirm soft cols on LIVE `employee_assets` · **HOLD** assignment spine · **HOLD/OUT** catalog/serial-index · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM ADD soft cols on `public.employee_assets` (prefer) — `handover_confirmed_at` · `handover_confirmed_by` · optional `handover_receiver_name` — OR light handover ALT; soft-delete doctrine; DENY Nest `/core` dual; DENY full e-sign / Asset ledger | **PASS** — DATA-01 §1/§4 · light table **ALT HOLD** |
| HOLD — no invent/change LIVE assignment CRUD spine cols | **PASS** §6 |
| HOLD/OUT — Asset master catalog / kho SKU; HOLD serial unique index (wire 409 first) | **PASS** §1/§6 |
| Cite display-ready confirm flags for Profile Tài sản list + «Đang sử dụng» gate | **PASS** §5 |
| RETAIN CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY · R-CORE-03-CC-EMBED-OBS P2 idle-ok | **PASS** §10 must_keep |
| DENY wipe CORE-03/02b · invent CORE-06/07 DONE · claim CORE-03=personnel · claim printable/closed-8 · honesty flip · reopen J-03/02B/09D..01 · seed · apps/** | **PASS** §10 |
| Unlock sa API-01 RETAIN cite F-CORE-AST-01 + residual F-CORE-AST-BB-01 + serial 409 · CORE-06 QUEUED depends_on | **PASS** §12/§13 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1 path · O2 SoT · O3 status · O4 HANDOVER REQUIRED · O5 catalog OUT · O6 serial 409 · O7 soft · O8 CORE-06 OUT · O9 CORE-03 · O10 honesty · O11 display · O12 J-* |
| SA-01 | Option A LOCKED · RETAIN assignment · residual BB · paper `/core` alias |
| Paper DB | §3.8 `hrm_asset_assignment` + `hrm_asset_handover` · F-CORE-AST-01 `handover_doc_id` |
| AS-IS Nest (read-only) | `employee-profile.service.ts` ensureSchema LIVE spine · `apps/` **0** `handover_confirmed` / `hrm_asset_handover` / `handover_doc` |
| Peer seals | `CORE03QC1-MSLFJH0K` · EMP DOC/TOK · `CORE02BQC1-MSLEFQC1` · `CORE09DQC1-MSLDR8I3`..`CORE01QC1-MSL6WMS7` · OBS P2 idle-ok |

---

## 3. Physical decisions (summary)

1. **BB:** **ADD** soft cols on LIVE `employee_assets` (prefer) · paper `handover_doc_id` = assignment `id` when confirmed · light `hrm_asset_handover` **ALT HOLD**.
2. **Assignment spine:** **HOLD RETAIN** — no invent/change CRUD cols.
3. **Catalog/serial index:** **OUT invent** master/kho · **HOLD** unique index · wire **409** first.
4. **Path:** physical `/employees/:id/assets*` · `/core` alias only · **DENY** Nest `/core` dual.
5. **Display-ready:** spine + confirm flags + `statusLabelVi` · «Đang sử dụng» = `assigned` (+ CFG BB gate).
6. **CORE-06:** same SoT · **OUT invent DONE** · board remains QUEUED.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| CORE / personnel / CTR UAT | **false** |
| C-SLICE | GWC later ≠ module UAT |
| CRUD alone = CORE-05 DONE | **DENIED** |
| CORE-03 = personnel UAT | **DENIED** |
| CORE-06/07 / printable / closed-8 DONE | **DENIED** |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 — single GĐ continuous)
uc_ids: UC-BP-CORE-05
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA Option A · R-CORE-05-HANDOVER-01 · R-CORE-05-CAT-SERIAL-01 · CORE03QC1-MSLFJH0K · CORE02BQC1-MSLEFQC1 · peer CORE09DQC1-MSLDR8I3..CORE01QC1-MSL6WMS7 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB · R-CORE-03-CC-EMBED-OBS P2 idle-ok must_keep
spec_ref: F-CORE-AST-01 physical /employees/:id/assets* · residual F-CORE-AST-BB-01 · paper /core alias only · DATA soft cols handover_confirmed_* · serial 409 wire · CORE-06 F-CORE-AST-02 OUT invent DONE QUEUED depends_on

MISSION — API F.1 lock (docs-only · REQUIRED after DATA):
1) RETAIN cite F-CORE-AST-01 — GET/POST/PATCH/DELETE /api/hrm/employees/:id/assets* · DTO↔LIVE employee_assets spine · paper /core alias only · DENY Nest @Controller('core') AST SoT
2) ADD/UNLOCK residual F-CORE-AST-BB-01 — prefer PATCH …/assets/:assetId confirm flags (handover_confirmed_at/by · optional receiver_name) · map paper handover_doc_id = id when confirmed · «Đang sử dụng» gate CFG default on · DENY notes-only = BB DONE · DENY full e-sign invent
3) Serial residual — POST/PATCH non-empty serial already assigned in scope → 409 HRM-EMP-ASSET-SERIAL-CONFLICT (or synonym) · HOLD unique index
4) Soft-delete — prefer status returned/lost/maintenance · DENY hard DELETE issued without waiver · CORE-06 same SoT depends_on · DENY invent F-CORE-AST-02 DONE
5) Display-ready confirm flags for Profile Tài sản list · U19 list=get=mutate scope_parity
6) RETAIN must_keep CORE-03 DOC/ET/CHK · CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest /core DENY · R-CORE-03-CC-EMBED-OBS P2 idle-ok
7) DENY wipe CORE-03/02b · invent CORE-06/07 DONE · claim CORE-03=personnel · claim printable/closed-8 · honesty flip · reopen J-HRM-CORE-03-01..05 / 02B / 09D/09C/09B/09A/08/02/01 · seed · apps/**

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until API CONFIRMED
```

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED**: ADD soft BB confirm cols on LIVE `employee_assets` (prefer) · spine HOLD · catalog/serial-index HOLD/OUT · display-ready + gate cited · unlock sa API residual BB+serial · CORE-06 remains QUEUED · honesty false · docs-only. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-DATA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-data-01.md` |
