# QC Close — HDSD BF-03 profile depth (`QC-HDSD-BF-03-PROFILE-CLOSE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-BF-03-PROFILE-CLOSE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **C-BF03-PROFILE-01** · Cursor sole |
| **gate_type** | L3 QC — close residual after `QA-HDSD-BF-03-PROFILE-DEPTH-01` |
| **prior_gates** | `qc-hdsd-bf-03-full-gate-01-20260801.md` (C-BF03-PROFILE-01 OPEN P2) · `qc-hdsd-bf-03-gate-01-20260801.md` (mutate GWC) · `qc-hdsd-bf-salary-01-20260801.md` (Ch09) |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · browser-only · no seed · no re-mutate TC-06/07/08 · HOLD_DEPLOY |
| **portal_url** | `http://127.0.0.1:5173` · HRM embed `/hr/employees/:id` · `PORTAL_DEV_URL` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — **C-BF03-PROFILE-01 CLOSED**:

- **TC-HRM-HDSD-028..034** — **7/7 🟢** browser depth (header · core tabs · group popover · general blocks · salary sensitive CEO positive · status badge · bad-UUID 404 recovery)
- **J-HRM-02** list→profile — **🟢 PASS** (row-click · GET detail **200** · `employee-profile-page`)
- **Matrix** — **310→317🟢 · 54→47🟡 · 0⬜ · 0 regression** (promote JSON + matrix body/header)
- **must_keep** — Ch09 **096/097 🟢** preserved · mutate TC-06/07/08 **not re-mutated** (promote allow-list excludes them · applied = 028..034 only)
- **Sole GWC condition** — **R-PROFILE-DENY-01** P3 (non-CEO `view_salary` deny not run; CEO positive path satisfies HDSD AC)

**NOT in this gate:** Phase 1 DONE · PROD · `:8088` · mobile MOB-020..022/030 · soft-delete/BH mutate defer · false-promote remaining 47🟡.

---

## Evidence polled (QA intake)

| Artifact | Pack verify | QC audit |
|----------|-------------|----------|
| `qa-hdsd-bf-03-profile-depth-01-20260801.md` | **1/8 FAIL** (`portal_url` token) | ✅ Product PASS — 7/7 TC · J-HRM-02 · residual honest · U65 |
| `_tmp-qa-hdsd-bf-03-profile-depth-01-runtime.json` | — | ✅ 7× 🟢 · J-HRM-02 🟢 · L0 200 · `env.PORTAL` · u65 · GET 404 not-found |
| `_tmp-qa-hdsd-matrix-promote-bf-03-profile-depth-01-result.json` | — | ✅ applied 7 · regressions `[]` · must_keep 096/097 · after **317🟢 / 47🟡** |
| `screens/hdsd-bf-03-profile-depth-01-20260801/` | — | ✅ **9 PNG** (list→profile→tabs→salary→not-found→recovery) |
| `qc-hdsd-bf-03-full-gate-01-20260801.md` | prior | ✅ PROFILE was OPEN P2 — this WI closes it |
| `HDSD_SRS_TESTCASE_MATRIX.md` | — | ✅ TC-028..034 all 🟢 · 096/097 🟢 · summary **317🟢 · 47🟡 · 0⬜** |

---

## Profile depth audit (TC-028..034)

| TC | HDSD §5.4 | Runtime / matrix | QC |
|----|-----------|------------------|-----|
| **TC-HRM-HDSD-028** | Header | name+edit 🟢 | ✅ |
| **TC-HRM-HDSD-029** | Dải tab Cốt lõi | groups+general/work/contract/salary 🟢 | ✅ |
| **TC-HRM-HDSD-030** | Nhóm tab mở rộng | hr/career/personal + nested kpi 🟢 | ✅ |
| **TC-HRM-HDSD-031** | Tab Thông tin chung | personal/address/emergency/work/finance/status 🟢 | ✅ |
| **TC-HRM-HDSD-032** | Phân quyền nhạy cảm | CEO salary content · no blank · deny defer 🟢 | ✅ GWC deny P3 |
| **TC-HRM-HDSD-033** | Trạng thái hồ sơ | badge Đang làm việc 🟢 | ✅ |
| **TC-HRM-HDSD-034** | Lỗi thường gặp | GET **404** · msg+back · no 500 banner 🟢 | ✅ |

### L2.5 journey

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-02** | **PASS** | list row-click → `/hr/employees/{id}` · GET **200** · id `36e2b988-8188-426d-b111-eb799f697c5b` |

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **Ch09 TC-HRM-HDSD-096 / 097** | matrix 🟢 · promote `must_keep_untouched` | ✅ preserved |
| **Mutate TC-06 / 07 / 08** (Đ2 GWC) | not in promote `applied[]` · QA no re-mutate · prior `qc-hdsd-bf-03-gate-01` | ✅ not re-mutated |
| **Prior 🟢 rows** | promote `regressions: []` | ✅ **0** downgrade |
| **U65 zero-seed** | runtime `u65: zero-seed` · QA policy | ✅ no seed |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS** | C-BF03-PROFILE-01 CLOSED · 7/7 TC 🟢 · J-HRM-02 PASS · matrix +7🟢 · 0 false green |
| **PROCESS GWC** | QA intake pack **1/8** — missing `portal_url`/`PORTAL_DEV_URL` token near URL · **does not block** (URL in QA metadata + runtime `env.PORTAL=http://127.0.0.1:5173`) · this QC pack targets **8/8** |
| **CONDITION CLOSED** | ~~C-BF03-PROFILE-01~~ (was OPEN on full-gate) |
| **CONDITION OPEN (sole GWC)** | **R-PROFILE-DENY-01** P3 — non-CEO salary deny optional |
| **OUT OF SLICE (yellow hint)** | **C-BF03-MOB-DEPTH-01** · **C-BF03-MUTATE-DEFER-01** — next yellow residual |
| **PROGRAM** | NOT Phase 1 DONE · NOT PROD · **C-HOLD-DEPLOY** local `:5173` only |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks PROFILE close? | Trigger |
|----|------|-----|-------|-------|------------------------|---------|
| **R-PROFILE-DENY-01** | TC-032 deny-path role without `view_salary` not executed (CEO positive only) | P3 | rbac depth | qa optional | **No** — sole GWC | Optional persona wave |
| **C-BF03-MOB-DEPTH-01** | MOB-020..022/030 | P2 | mobile defer | qa-device | No — out of slice | `QA-HDSD-MOB-BF03-DEPTH-01` |
| **C-BF03-MUTATE-DEFER-01** | soft-delete/BH dialog | P2 | mutate defer | qa | No — out of slice | Dedicated U65 mutate sub-wave |
| **C-BF03-PACK-01** | QA profile MD pack 1/8 `portal_url` | P3 process | pack format | qa | No | Next QA handoff add `portal_url:` |
| **C-HOLD-DEPLOY** | Local `:5173` only | Info | env | devops | No | sponsor deploy |
| **C-PROGRAM** | NOT Phase 1 / PROD | P0 program | program | PM | No | program gate |

**QC ruling:** **C-BF03-PROFILE-01 CLOSED**. No product P0/P1. Sole bounded GWC = **R-PROFILE-DENY-01 P3**. No false-promote. No Dev dispatch. No Claude lane.

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-bf-03-profile-depth-01-20260801.md` | **1** | FAIL **1/8** — `portal_url` (process-only) |
| Read `_tmp-qa-hdsd-matrix-promote-bf-03-profile-depth-01-result.json` | — | **PASS** — 7 applied · regressions `[]` · 317🟢/47🟡 |
| Read `_tmp-qa-hdsd-bf-03-profile-depth-01-runtime.json` | — | **PASS** — 7 TC 🟢 · J-HRM-02 🟢 · L0 200 · GET 404 |
| Spot matrix TC-028..034 + 096/097 | — | **PASS** — all 🟢 |
| List screenshots dir (9 PNG) | — | **PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-bf-03-profile-close-01-20260801.md` | **0** | **PASS** 8/8 (this file) |

---

## Conditions (GWC — updated vs full-gate)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**C-BF03-PROFILE-01**~~ | Profile tab depth TC-028..034 | P2 | **✅ CLOSED** | qa |
| **R-PROFILE-DENY-01** | Non-CEO salary deny path | P3 | ⏳ OPEN (sole GWC) | qa optional |
| **C-BF03-MOB-DEPTH-01** | 4× mobile TC depth 🟡 | P2 | ⏳ OPEN | qa-device |
| **C-BF03-MUTATE-DEFER-01** | Soft-delete/BH dialog defer 🟡 | P2 | ⏳ OPEN | qa |
| **C-HOLD-DEPLOY** | Local only | Info | ⏳ OPEN | devops |
| **C-PROGRAM** | NOT Phase 1 DONE · NOT PROD | P0 program | ⏳ OPEN | PM |

---

## HDSD orchestration promotion

| WI | Status |
|----|--------|
| `QA-HDSD-BF-03-PROFILE-DEPTH-01` | ☑ 7/7 🟢 · 317🟢 |
| `QC-HDSD-BF-03-PROFILE-CLOSE-01` | ☑ **GWC · C-BF03-PROFILE-01 CLOSED** |

---

## Handoff

**completion_report:** L3 closeout after `QA-HDSD-BF-03-PROFILE-DEPTH-01`. Independent promote JSON + matrix + runtime + 9 screenshots confirm **TC-028..034 7/7 🟢 · J-HRM-02 PASS · 317🟢/47🟡 · 0 regression**. must_keep Ch09 096/097 + mutate TC-06/07/08 intact. **C-BF03-PROFILE-01 CLOSED.** Sole GWC: **R-PROFILE-DENY-01 P3**. Next yellow residuals: **C-BF03-MOB-DEPTH-01** (qa-device) · **C-BF03-MUTATE-DEFER-01** (qa). QA intake pack 1/8 process-only. NOT Phase1/PROD.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: PM-HDSD-BF-03-PROFILE-CLOSED-01
from_role: qc | to_role: pm
entry_criteria:
- QC-HDSD-BF-03-PROFILE-CLOSE-01 GWC — docs/qa/evidence/qc-hdsd-bf-03-profile-close-01-20260801.md
- C-BF03-PROFILE-01 CLOSED · matrix 317🟢 · 47🟡 · R-PROFILE-DENY-01 P3 only
exit_criteria:
- Mark QC-HDSD-BF-03-PROFILE-CLOSE-01 ☒ on HDSD_BUSINESS_FLOW_ORCHESTRATION.md
- Dispatch next yellow residual (priority):
  A) QA-HDSD-MOB-BF03-DEPTH-01 (qa-device) — C-BF03-MOB-DEPTH-01 MOB-020..022/030
  OR B) QA-HDSD-BF-03-MUTATE-DEFER-01 — C-BF03-MUTATE-DEFER-01 soft-delete/BH dialog U65
- Do NOT false-promote remaining 🟡 · must_keep mutate + Ch09
ack_status: PASS_TO_PM
residual_auto_fix: C-BF03-MOB-DEPTH-01 → qa-device · C-BF03-MUTATE-DEFER-01 → qa
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-bf-03-profile-close-01-20260801.md`

**ack_status:** **PASS_TO_PM**
