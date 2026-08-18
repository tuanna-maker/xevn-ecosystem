# Evidence — PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-25 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` · `J-HRM-ATT-02-01..06` |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 peers+shell · API-01 CONFIRMED · BA O1–O12 · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · CFG alone ≠ ATT-02 DONE · **R-ATT-02-MODE-FE CLOSED** · printable false RETAIN · ≠ ATT module UAT · ≠ PLT/CORE DONE · PAY OUT · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-02 Diễn biến #1/#5 · BR-BP-SHF-02
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
  F-ATT-RULE-01 GET/PATCH /attendance/rules* · display-ready mode·modeLabelVi·bands·scope·sourceFlags·latePenaltyEnabled·latePenaltyHours
- be: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md READY_FOR_QA
- fe-01: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-01.md · residual R-ATT-02-MODE-FE → CLOSED this seat
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md J-HRM-ATT-02-01..06
- must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
- sponsor_confirm: API-01 CONFIRMED · BE-01 wired · FE-02 LIVE bind
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind CFG «Phạt muộn/về sớm» → GET/PATCH `/api/hrm/attendance/rules*` display-ready | **PASS** |
| XOR UI — exactly one of minute\|block\|tier · client reject mixed + HRM-VAL-400 | **PASS** |
| off / `latePenaltyEnabled=false` ≠ `notifyLate` off conflation | **PASS** |
| Network path contains `/attendance/` · Nest `/core` = 0 | **PASS** (source lock) |
| Close residual **R-ATT-02-MODE-FE** | **CLOSED** |
| Honesty ≠ CFG alone DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN | **PASS** |
| No seed · no invent PAY/printable | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **3 files · 15 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attRuleRing.ts` (+ test) — LIVE helpers · VAL-400 · residual CLOSED
- `apps/web/hrm/src/lib/poHrmMvpGd1Att02ClusterFe02.source.test.ts` — Nest `/core` 0 · LIVE stamps
- `apps/web/hrm/src/components/attendance/AttLatePenaltyModePanel.tsx` — LIVE bind · sourceFlags · XOR
- `apps/web/hrm/src/integrations/hrmApi.ts` — display-ready types · optional `…/rules/late-penalty`
- `apps/web/hrm/src/lib/apiError.ts` — friendly `HRM-VAL-400`
- `apps/web/hrm/src/hooks/useAttendanceRules.ts` · `pages/Attendance.tsx` — CODE-MEMORY APPEND

### Network assert path (QA)

```text
1) Chấm công → Cài đặt → Quy tắc → Chung
   → GET /api/hrm/attendance/rules  (contains /attendance/ · Nest /core = 0)
   → Panel att-02-late-penalty: badge R-ATT-02-MODE-FE CLOSED · LIVE banner
   → modeLabelVi · sourceFlags · latePenaltyEnabled · bands · scope visible
2) Chọn đúng 1 mode (radio XOR) · bands (nếu cần) · Lưu
   → PATCH /api/hrm/attendance/rules 2xx · F5 còn mode/bands
3) Client lẫn mode / bands overlap → HRM-VAL-400 toast (không PATCH)
4) Tắt latePenaltyEnabled → Lưu · notify_late peer vẫn độc lập (≠ off conflation)
5) Footer att-02-honesty: CFG≠DONE · LER≠mode · ≠ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · residual CLOSED
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attRuleRing.test.ts \
  src/lib/poHrmMvpGd1Att02ClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Att02ClusterFe02.source.test.ts
# → exit 0 · 3 files · 15 tests PASS
```

---

## 4. U65 browser plan (QA-01 — J-HRM-ATT-02-01..06)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-02-01** | Login → Quy tắc → Chung → mode XOR + bands → Lưu → F5 · Nest `/core` **0** · ≠ CFG DONE | AC-ATT-02-LOAD/MODE/PATH |
| **J-HRM-ATT-02-02** | Lẫn mode / bands overlap → từ chối HRM-VAL-400 · F5 clean | AC-ATT-02-XOR |
| **J-HRM-ATT-02-03** | Punch valid + evaluate cite · funnel · ≠ ATT-10/PAY | AC-ATT-02-SRC/EVAL/SCOPE |
| **J-HRM-ATT-02-04** | Invalid source → reject / 0 công | AC-ATT-02-SRC-NEG |
| **J-HRM-ATT-02-05** | Off (`latePenaltyEnabled=false`) → penalty 0 · notify_late ≠ off | AC-ATT-02-OFF |
| **J-HRM-ATT-02-06** | F5 + honesty seals · ≠DONE · PAY OUT · PLT/CORE RETAIN · R-ATT-02-MODE-FE CLOSED | AC-ATT-02-F5/≠-*/H/MK-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Cài đặt → Quy tắc → Chung  
**Cấm:** `pnpm seed:*` · Nest `/core` ATT SoT · claim CFG = ATT-02 DONE · claim ATT module UAT · invent PAY/printable · honesty flip · reopen sealed J-PLT/CORE-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-ATT-02-MODE-FE** | **CLOSED** this seat (BE-01 + FE-02 LIVE) | — |
| EVAL punch-vs-shift late minutes | Partial BE — funnel cite · ≠ ATT-10/PAY DONE | QA observe · BE deepen if FAIL |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ PLT/CORE DONE · PAY OUT | QC |
| Peers | PLT/CORE seals must_keep | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-QA-01
role: qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-25)
entry_criteria: FE-02 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md · BE-01 READY @ docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md · L0 stack · U65 zero-seed · browser-only
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md §4 U65 plan
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md J-HRM-ATT-02-01..06
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md F-ATT-RULE-01
mission: Browser U65 J-HRM-ATT-02-01..06 — login ceo@xe.vn → Chấm công → Cài đặt → Quy tắc → Chung
  · GET/PATCH Network contains /attendance/ · Nest /core = 0
  · XOR one mode · HRM-VAL-400 on mixed/bands overlap
  · latePenaltyEnabled=false ≠ notifyLate off
  · F5 retain · honesty CFG≠DONE · R-ATT-02-MODE-FE CLOSED · printable false · PAY OUT · PLT/CORE RETAIN
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qa-01.md · matrix J-* verdicts · PASS_TO_PM (or FAIL with residual owner)
cấm: pnpm seed:* · Nest /core · claim CFG=ATT-02 DONE · claim ATT module UAT · invent PAY/printable · honesty flip
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-02 DONE** · CFG alone ≠ FR-02 DONE · **R-ATT-02-MODE-FE CLOSED** · ≠ ATT module UAT · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT · must_keep PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed

*End FE-02 · READY_FOR_QA · 2026-08-09*
