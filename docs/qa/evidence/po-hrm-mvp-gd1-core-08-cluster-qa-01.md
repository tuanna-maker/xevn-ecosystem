# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-08) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE08QA-MSL980WO` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P1 FE period filter) |
| **uc_ids** | `UC-BP-CORE-08` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **CORE-02 ≠ pillar DONE** · **note-CRUD ≠ FR-08 DONE** |
| **depends_on** | BE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-be-01.md` · FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-fe-01.md` |
| **env** | HRM FE `:8080` (portal `:5173` flaky/down → fallback) · hrm-api `:28001` **rebuild+restart** (stale dist missing RD service + `payroll_period_id`) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-08-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-08-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-08-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no CORE / personnel UAT DONE** · **CORE-02 ≠ pillar DONE** · **note-CRUD ≠ FR-08 DONE** |
| **L0** | hrm/xbos **200** · FE surface `:8080` **200** (portal 5173 unreachable at run) |
| **L1 seal** | rewards/discipline GET **200** · VAL-400 `HRM-CORE-RD-VAL-400` · enforce route mapped `HRM-CORE-RD-404` · Nest `/core` **Cannot GET** · CB-403 must_keep |
| **L2.5 J-*** | **J-HRM-CORE-08-01..04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | `/employees/:id/rewards*` (+ enforce/cancel-enforce) only · **0** `/decisions` |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · fold `/decisions` · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · reopen J-CORE-02/01 · FE invent payslip Net |

**Ops note (intake):** LIVE dist at entry **pre-BE-01** (no `employee-reward-discipline.service` · CREATE 500 missing `payroll_period_id`) → QA **rebuild** `pnpm --filter hrm-api run build` + restart `dist/main` → seal LIVE before browser. Portal `:5173` unstable → browser on HRM Vite `:8080` (same FE package).

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS | **200** |
| FE surface | `:8080` **200** (fallback) |
| `GET …/employees/{id}/rewards` | **200** `HRM-EMP-PROFILE-200` |
| `GET …/employees/{id}/discipline` | **200** |
| `GET /api/hrm/payroll/periods?company_id=main` | **200** · unlocked draft `4d2111d7-…` `QA-SRC-BE02-NV002-ONLY` |
| amount>0 no period POST | **400** `HRM-CORE-RD-VAL-400` |
| enforce unknown id | **404** `HRM-CORE-RD-404` (mapped — not Cannot POST) |
| `GET /api/hrm/core/reward-discipline` | **404** Cannot GET — DENY dual |
| `PATCH` public CF salary | **403** `HRM-CORE-CB-403` — must_keep CORE-02/01 |

---

## Browser U65 — journeys

Persona: auth inject · URL `http://127.0.0.1:8080/employees/{id}?tab=rewards` · **zero-seed**.

**hdsd_align:** Hồ sơ NV → tab KT/KL → Thêm khen thưởng (title-first) → amount vi-VN + kỳ draft → Thêm mới → F5 → Thi hành → F5 → Hủy thi hành → note-only (no period picker).

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-08-01** | Tab KT/KL → Thêm → title → date `09/08/2026` → amount `1.250.000` → kỳ **draft** → Lưu → F5 | POST `/api/hrm/employees/{id}/rewards` **201** · F5 status **Chờ** · link **Chờ kỳ lương** · period `QA-SRC-BE02-NV002-ONLY` · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-08-02** | Row money → **Thi hành** → F5 | POST `…/rewards/{id}/enforce` **201** · F5 **Đang thi hành** · **Đã gắn kỳ** · period label còn | **PASS** |
| **J-HRM-CORE-08-03** | **Hủy thi hành** · note-only create (amount 0) | POST `…/cancel-enforce` **201** · note F5 link **Không gắn kỳ** · period picker **hidden** · no payslip Net invent | **PASS** |
| **J-HRM-CORE-08-04** | Network + seals | Nest `/core` **0** · decisions **0** · physical rewards hits · L1 VAL-400 + CB-403 + nest deny · DONE claims DENY | **PASS** |

Mutated samples:
- Employee: `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` (UV UAT REC soft-hire — **≠** CORE/personnel UAT DONE)
- Browser reward: `QA CORE08 browser KT CORE08QA-MSL980WO` · id `8610828c-41b7-412f-84a6-e2fc5522a343`
- Period: `QA-SRC-BE02-NV002-ONLY` (`draft`)
- Note-only: `QA CORE08 note-only CORE08QA-MSL980WO` · link `none` / **Không gắn kỳ**

Screens: `01-rd-tab-open` · `02-reward-form-filled` · `03-after-create` · `04-f5-after-create` · `05-after-enforce` · `06-f5-after-enforce` · `07-after-cancel` · `08-note-only-created` · `09-f5-note-cancel` · `10-j04-done`.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-08-FE-PERIOD-FILTER** | **P1 OBS** | **dev-fe** | `isRdPeriodSelectable` includes `processed` (empCoreRdRing) while BE treats processed as locked → picker can offer locked kỳ; QA picked `(draft)` only. Earlier probe: processed → toast LOCKED + POST **409**. Fix: align selectable to `draft\|open\|adjust` only. **Does not block** J-* PASS. |

**What worked (must not regress):** physical `/employees/:id/rewards*` create/enforce/cancel-enforce · title-first · amount>0 period gate · note-only `none` · display-ready VI labels F5 · Nest `/core` 0 · CB-403 must_keep · C-SLICE honesty false.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Fold RD into `/decisions` | **DENY** — decisions hits **0** |
| FE invent payslip Net | **DENY** — not observed |
| `pnpm seed:*` / API fake for UF pass | **not used** (L1 probes seal only; browser mutate FE) |
| Flip honesty / recruitment_uat_ready / jd_dynamic_done | **false** retained |
| Claim CORE-02 packages = pillar DONE | **DENY** |
| Claim note-CRUD = FR-08 DONE | **DENY** |
| Reopen sealed J-CORE-02 / J-CORE-01 | **DENY** |
| Module CORE / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qa-01.md` |
| **completion_report** | U65 QA PASS — L0 OK; rebuild+restart seal BE-01 LIVE; J-01 create title-first+draft period POST 201 Chờ F5 PASS; J-02 enforce 201 Đang thi hành + Đã gắn kỳ F5 PASS; J-03 cancel-enforce 201 + note-only link none PASS; J-04 Nest `/core` 0 + CB-403 + VAL-400 PASS. Honesty false · C-SLICE · no seed · CORE-02 ≠ pillar DONE · note ≠ FR-08 DONE. P1 OBS FE period filter includes processed. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: QA-01 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qa-01.md · stamp CORE08QA-MSL980WO
entry_criteria: QA J-HRM-CORE-08-01..04 PASS; honesty false; C-SLICE; Nest /core 0; physical rewards/discipline; CORE-02/01 must_keep; no seed in evidence
MISSION: QC GWC slice CORE-08 — audit browser evidence U65; confirm C-SLICE ≠ module CORE/personnel UAT; confirm CORE-02 ≠ pillar DONE · note-CRUD ≠ FR-08 DONE; DENY honesty flip · Nest /core dual · fold /decisions · reopen J-CORE-02/01 · seed; note P1 OBS FE isRdPeriodSelectable includes processed (optional FE follow-up — not GO blocker if C-SLICE).
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qc-01.md · GO WITH CONDITIONS (C-SLICE) or NO-GO
cấm: honesty flip · claim module CORE UAT · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE
```
