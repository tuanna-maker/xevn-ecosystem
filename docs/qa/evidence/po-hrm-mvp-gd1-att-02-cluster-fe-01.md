# Evidence — PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-25 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` · `J-HRM-ATT-02-01..06` DRAFT |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · BE residual **REQUIRED** (mode/bands/scope/off ABSENT) · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE |
| **ack_status** | **PASS_TO_PM** — peers READY for partial QA · mode envelope **ABSENT** → residual **R-ATT-02-MODE-FE** await BE then FE-02 |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · `hrm_personnel_uat_ready=false` · **C-SLICE** · CFG alone ≠ ATT-02 DONE · late_early ≠ mode SoT · ≠ ATT module UAT · ≠ PLT/CORE DONE · PAY OUT · Nest `/core` DENY · no seed |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-02 Diễn biến #1–#5 · Thành công · BR-BP-SHF-02
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
  F-ATT-RULE-01 GET/PATCH /attendance/rules* · peers sites/shifts/late_early/punch
  residual MODE/SCOPE/OFF ABSENT → BE REQUIRED · Nest /core DENY · paper alias only
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md O1–O12 · AC-ATT-02-* · J-HRM-ATT-02-01..06 DRAFT
- data: DATA-01 HOLD · attendance_rules RETAIN · residual ADD stamped closable
- must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · FE RETAIN peers parallel · mode AC wait BE
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind RETAIN peers → physical `/api/hrm/attendance/*` (rules · work-sites · work-shifts · late-early-requests · punch cite) | **RETAIN** (source lock) |
| UI shell mode XOR / bands / scope / latePenaltyEnabled | **ADD** `AttLatePenaltyModePanel` — stub-safe when ABSENT |
| Bind LIVE envelope when BE wires `mode`/`bands`/`latePenaltyEnabled` | **Prepared** — `parseAtt02LatePenaltyEnvelope` · save gated on `envelopePresent` |
| Nest `/core` ATT SoT = 0 (source lock) | **PASS** |
| Honesty footers ≠ CFG DONE · ≠ LER mode · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN | **ADD** `att-02-honesty` + `att-02-ler-honesty` |
| DENY fake XOR persist · Nest `/core` invent · seed · claim ATT UAT | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **2 files · 10 PASS** (see §3) |

### Files touched

- `apps/web/hrm/src/lib/attRuleRing.ts` (+ test) — path/XOR/envelope/honesty
- `apps/web/hrm/src/lib/poHrmMvpGd1Att02ClusterFe01.source.test.ts` — Nest `/core` 0 · peers · honesty
- `apps/web/hrm/src/components/attendance/AttLatePenaltyModePanel.tsx` — mode shell stub-safe
- `apps/web/hrm/src/pages/Attendance.tsx` — mount panel under Rules→Chung
- `apps/web/hrm/src/components/attendance/LateEarlyRequestTab.tsx` — LER ≠ mode honesty
- `apps/web/hrm/src/hooks/useAttendanceRules.ts` — CODE-MEMORY APPEND RETAIN
- `apps/web/hrm/src/integrations/hrmApi.ts` — CODE-MEMORY APPEND F-ATT-RULE-01

### Network assert path (QA — peers + residual)

```text
1) Chấm công → Cài đặt → Quy tắc → Chung
   → GET /api/hrm/attendance/rules  (no Nest /core)
   → Panel att-02-late-penalty: residual banner R-ATT-02-MODE-FE HOLD if mode ABSENT
   → Save mode DISABLED until envelopePresent
2) Chung Lưu round/notify_late → PATCH /attendance/rules 2xx · F5 · ≠ ATT-02 DONE alone
3) App GPS → work-sites CRUD → /attendance/work-sites* · Nest 0
4) Ca làm việc → /attendance/work-shifts* · Nest 0 · ≠ mode SoT
5) Đơn từ → Đi muộn/về sớm → /attendance/late-early-requests* · footer LER ≠ mode SoT
6) Footer att-02-honesty: CFG≠DONE · LER≠mode · ≠ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · soft≠06
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attRuleRing.test.ts \
  src/lib/poHrmMvpGd1Att02ClusterFe01.source.test.ts
# → exit 0 · 2 files · 10 tests PASS
```

**Mode envelope:** BE `mode` / `bands` / `latePenaltyEnabled` **ABSENT PROVEN** (API-01 + FE parse) → **no READY_FOR_QA** on mode XOR journeys · residual **R-ATT-02-MODE-FE**.

---

## 4. U65 browser plan (partial peers now · mode after BE)

| J-ID | Click path | Pass when | Gate |
|------|------------|-----------|------|
| **J-HRM-ATT-02-01** | Login → Quy tắc → Chung → mode XOR + bands → Lưu → F5 · Nest `/core` **0** · ≠ CFG DONE | AC-ATT-02-LOAD/MODE/PATH | **BLOCKED** until BE envelope |
| **J-HRM-ATT-02-02** | Lẫn mode → từ chối · F5 clean | AC-ATT-02-XOR | **BLOCKED** until BE |
| **J-HRM-ATT-02-03** | Punch valid + evaluate cite · funnel · ≠ ATT-10/PAY | AC-ATT-02-SRC/EVAL/SCOPE | Peer punch/sites **partial** · EVAL wait BE |
| **J-HRM-ATT-02-04** | Invalid source → reject / 0 công | AC-ATT-02-SRC-NEG | Peer GEO **partial** |
| **J-HRM-ATT-02-05** | Off → penalty 0 · notify_late ≠ off | AC-ATT-02-OFF | **BLOCKED** until BE `latePenaltyEnabled` |
| **J-HRM-ATT-02-06** | F5 + honesty seals · ≠DONE · PAY OUT · PLT/CORE RETAIN | AC-ATT-02-F5/≠-*/H/MK-* | **Partial** — honesty footers LIVE now |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Cài đặt → Quy tắc  
**Cấm:** `pnpm seed:*` · Nest `/core` ATT SoT · claim CFG/round/đơn = ATT-02 DONE · claim ATT module UAT · invent PAY/printable/Word DONE · fake XOR persist · honesty flip · reopen sealed J-PLT/CORE-*

**Partial QA (peers only — optional same wave):** Rules Chung save · work-sites · work-shifts list · late-early list/approve smoke · assert Nest `/core` 0 · honesty footers visible — **do not** 🟢 mode XOR AC.

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-ATT-02-MODE-FE** | Mode/bands/scope/off ABSENT — panel HOLD · await BE wire then FE-02 bind verify | **dev-be** → **dev-fe** FE-02 |
| **R-ATT-02-MODE/SCOPE/OFF/EVAL** | BE residual REQUIRED (API-01) | **dev-be** |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ PLT/CORE DONE · PAY OUT | QC |
| Peers | PLT/CORE seals must_keep · ≠ claim DONE from this seat | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → ensure **dev-be** BE-01 residual · then FE-02 / QA peers-optional |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
role: dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-25)
entry_criteria: API-01 F.1 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md · FE-01 PASS_TO_PM peers+stub shell @ docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-01.md · DATA-01 HOLD · BA O1–O12 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · PAY OUT · U65 zero-seed
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-01.md
exit_criteria:
  - Wire residual ADD on physical GET/PATCH /api/hrm/attendance/rules* : mode XOR minute|block|tier · bands[] · scope · latePenaltyEnabled · display-ready mode·modeLabelVi·bands·scope·sourceFlags·latePenaltyEnabled
  - Reject mixed modes / bands overlap → HRM-VAL-400 · notifyLate ≠ off · U19 parity
  - DENY Nest @Controller('core') · DENY wipe LIVE spines · DENY invent PAY/printable/Word DONE · ≠ claim CFG=ATT-02 DONE · ≠ ATT module UAT
  - tests + CODE-MEMORY · READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md
  - next: FE-02 bind verify envelope LIVE + QA J-HRM-ATT-02-01..06 U65 (peers may partial-QA now)
cấm: Nest /core dual · seed · claim ATT UAT · claim CFG=ATT-02 DONE · honesty flip · wipe PLT/CORE seals
```

### Optional parallel (peers-only QA)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-QA-PEERS-01
role: qa
entry_criteria: FE-01 evidence · L0 stack · U65 zero-seed · browser-only
mission: Partial smoke peers only — Rules Chung PATCH · work-sites · work-shifts · late-early list · Nest /core 0 · honesty footers · DENY 🟢 mode XOR / claim ATT-02 DONE
exit: evidence partial · residual R-ATT-02-MODE-FE listed · PASS_TO_PM
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-02 DONE** · CFG/round/notify_late/đơn ≠ FR-02 DONE · ≠ ATT module UAT · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · **R-ATT-02-MODE-FE** await BE

*End FE-01 · PASS_TO_PM · 2026-08-09*
