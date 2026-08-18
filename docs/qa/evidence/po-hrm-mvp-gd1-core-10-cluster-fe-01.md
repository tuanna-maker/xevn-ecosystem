# Evidence — PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-23 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-10` · `J-HRM-CORE-10-01..06` DRAFT |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` GATE/ACT · soft≠CORE-06 DONE |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · `hrm_personnel_uat_ready=false` · **C-SLICE** · catalog≠DONE · enrollment CRUD≠DONE · LIVE≠module DONE without J-* · BH≠CORE-07 · PAY AC-SI-TL-06 OUT · **DENY** invent PAY/ATT/printable/Word DONE · **DENY** claim CORE-09/07/06 DONE |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-10 Luồng #0a–#0f · Diễn biến #1–#5 · AC-SI-TL-01..06 · AC-SI-CAT/INR · BR-BP-SI-01
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md
  F-CORE-SI-01 enrollment · F-CORE-SI-02 periods[] · F-CORE-SI-03 POST …/actions
  close|stop|suspend|change_rate|resume · R-CORE-10-DISP FE-derive · Nest /core DENY
- ba: docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md O1–O12 · AC-CORE-10-* · J-HRM-CORE-10-01..06 DRAFT
- data: DATA-01 HOLD · employee_insurances + hrm_insurance_rate_period RETAIN · no schema invent
- must_keep: CORE09QC1 printable false · CORE07QC1 GATE 409 · ACT-400 · Nest DENY · soft≠CORE-06 DONE · CORE-05/03/02b/09d..01
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · prefer FE+QA · Dev-BE only if DISP cannot derive
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind Profile BH → `GET/POST/PATCH /employee-insurances*` + `POST …/:id/actions` | **RETAIN + UPGRADE** fidelity |
| FE-derive `statusLabelVi` enrollment + periods (R-CORE-10-DISP) | **ADD** — no BE invent |
| Dates `dd/MM/yyyy` + amounts vi-VN | **RETAIN** dates · **UPGRADE** period amount labels |
| Vocab BH «Hoạt động» = enrollment `active` · ≠ CORE-07 activate | **ADD** lock + honesty |
| Nest `/core` SI SoT = 0 (source lock) | **PASS** |
| Honesty footer catalog/CRUD/LIVE≠DONE · printable false · PAY-06 OUT · CORE-09/07 RETAIN | **ADD** `si-core10-honesty` |
| Suspend thiếu căn cứ → surface `HRM-SI-ACTION-400` / `ACTION-400` · no silent success | **UPGRADE** toast + apiError |
| DENY invent PAY/ATT/Word/printable DONE · soft=CORE-06 DONE · seed | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **5 files · 22 PASS** (see §3) |

### Files touched

- `apps/web/hrm/src/lib/empCoreSiRing.ts` (+ test) — path/DISP/honesty/ACTION-400 helpers
- `apps/web/hrm/src/lib/poHrmMvpGd1Core10ClusterFe01.source.test.ts` — Nest `/core` 0 · honesty locks
- `apps/web/hrm/src/lib/insuranceTimelineActions.ts` (+ test) — period `statusLabelVi` + amounts + suspend_reason
- `apps/web/hrm/src/hooks/useEmployeeInsurance.ts` (+ test) — enrollment `statusLabelVi`
- `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` — badge bind + honesty footer
- `apps/web/hrm/src/components/employee/InsuranceTimelineActionsPanel.tsx` — VI period labels · ACTION-400 toast
- `apps/web/hrm/src/lib/apiError.ts` (+ `apiError.core-10.test.ts`) — ACTION-400 / HRM-SI-ACTION-400 copy
- `apps/web/hrm/src/integrations/hrmApi.ts` — optional `statusLabelVi` on DTO · CODE-MEMORY APPEND

### Network assert path (QA)

```text
1) Profile → tab BH → GET /api/hrm/employee-insurances* (+ GET /:id periods[])  (no Nest /core)
2) Đóng / Ngừng / Tạm hoãn / Đổi mức / Resume → POST …/employee-insurances/:id/actions
3) Tạm hoãn thiếu căn cứ → client block OR Network 400 HRM-SI-ACTION-400 · toast surfaces code · no silent 2xx
4) After action → F5 → periods[] prior + new · statusLabelVi VI · dates dd/MM/yyyy · amounts vi-VN
5) Footer si-core10-honesty: catalog≠DONE · enrollment CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · printable false · PAY-06 OUT · CORE-09/07 RETAIN · soft≠CORE-06 DONE
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreSiRing.test.ts \
  src/lib/poHrmMvpGd1Core10ClusterFe01.source.test.ts \
  src/lib/insuranceTimelineActions.test.ts \
  src/hooks/useEmployeeInsurance.test.ts \
  src/lib/apiError.core-10.test.ts
# → exit 0 · 5 files · 22 tests PASS
```

**R-CORE-10-DISP:** FE derives `active→Hoạt động` · `suspended→Tạm hoãn` · period `applying→Đang áp dụng` when BE omits `statusLabelVi`. **No Dev-BE dispatch required** for this residual.

---

## 4. U65 browser plan (QA-01 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-10-01** | Login → Profile BH → timeline load | GET `…/employee-insurances*` · periods[] · `statusLabelVi` VI · Nest `/core` **0** · honesty footer |
| **J-HRM-CORE-10-02** | Action **Đóng** + ngày hiệu lực → Lưu → F5 | POST `…/actions` `close` **2xx** · status Đóng · period row · Nest 0 |
| **J-HRM-CORE-10-03** | Action **Ngừng** → Lưu → F5 | POST `stop` 2xx · ≠ DELETE-only · Nest 0 |
| **J-HRM-CORE-10-04** | **Tạm hoãn** thiếu căn cứ → (Neg) · đủ căn cứ → (Pos) | Neg: toast/`400` `HRM-SI-ACTION-400` · no silent success · Pos: 2xx + F5 |
| **J-HRM-CORE-10-05** | **Đổi mức** → Lưu → F5 | POST `change_rate` append period · prior kept · **DENY** silent PATCH contrib as history |
| **J-HRM-CORE-10-06** | **Resume** + F5 + seals | POST `resume` · F5 prior+new · Nest 0 · footer catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · printable false · PAY-06 OUT · CORE-09/07 RETAIN · soft≠CORE-06 DONE · no reopen sealed J-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Profile → tab Bảo hiểm  
**Cấm:** `pnpm seed:*` · Nest `/core` SI SoT · claim catalog/CRUD/LIVE = CORE-10 DONE · invent PAY/ATT/printable/Word DONE · conflate BH Hoạt động ↔ CORE-07 activate · wipe CORE-09/07 · claim soft=CORE-06 DONE · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-CORE-10-DISP** | FE-derive OK — **no BE invent** unless QA wants BE envelope prefer-only | optional thin BE later |
| **R-FE-CORE-10-BE-LIVE** | Actions browser 🟢 needs LIVE Nest employee-insurances + actions | QA / BE if FAIL |
| Honesty | printable=false · C-SLICE · catalog/CRUD/LIVE≠DONE · CORE-09/07≠DONE · soft≠CORE-06 DONE · PAY-06 OUT | QC |
| Peers | CORE-09/07/06..01 seals must_keep · ≠ claim DONE from this seat | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-10-CLUSTER-QA-01
role: qa
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-fe-01.md · API-01 CONFIRMED RETAIN · U65 zero-seed · L0 stack up
exit_criteria: J-HRM-CORE-10-01..06 browser evidence · Network /employee-insurances* + /actions only · Nest /core SI = 0 · suspend thiếu căn cứ → 400 HRM-SI-ACTION-400 (no silent 2xx) · F5 history prior+new · statusLabelVi VI · dates dd/MM/yyyy · amounts vi-VN · honesty footers catalog≠DONE · enrollment CRUD≠DONE · LIVE≠module DONE · BH≠CORE-07 · printable false · PAY AC-SI-TL-06 OUT · CORE-09/07 RETAIN · soft≠CORE-06 DONE · no seed · PASS_TO_PM or FAIL with residual
must_keep: CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE
cấm: seed · Nest /core SI SoT · claim catalog/CRUD/LIVE = CORE-10 DONE · invent PAY/ATT/printable/Word DONE · conflate BH↔CORE-07 · honesty flip · reopen sealed J-*
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-qa-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-core-10-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md
```

---

## Footer — honesty

> **honesty:** `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · SI/CORE/CTR/personnel module UAT **false** · **C-SLICE**  
> catalog ≠ CORE-10 DONE · enrollment CRUD ≠ DONE · LIVE actions ≠ module DONE without J-* · BH Hoạt động ≠ CORE-07 · PAY AC-SI-TL-06 OUT invent DONE · must_keep CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed
