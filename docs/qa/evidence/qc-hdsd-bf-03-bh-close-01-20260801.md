# QC Close — HDSD BF-03 BH mutate (`QC-HDSD-BF-03-BH-CLOSE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-BF-03-BH-CLOSE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-BH-400-01** · Cursor sole |
| **gate_type** | L3 QC — close BH dialog enroll after `QA-HDSD-BF-03-BH-RET-02` |
| **prior_gates** | SoftDel GWC CLOSED (`qc-hdsd-bf-03-softdel-close-01`) · BE soft-resolve `d-hdsd-bf-03-bh-400-01` · FE picker `d-hdsd-bf-03-bh-fe-picker-01` |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · browser-only · no seed · **must_keep** TC-025 · TC-041 · **no false green** · **cấm** claim Phase2 DONE · **cấm** demote SoftDel |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/insurance?portal=1&tenantId=xevn&companyId=main` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — **R-MUTATE-BH-400-01 CLOSED**:

| TC / check | Matrix | Runtime / UI | QC |
|------------|--------|--------------|-----|
| **TC-HRM-HDSD-049** Dialog BH enroll | **🟢** | picker visible · POST participants **201** `HRM-INS-P-201` · `policy_id` set · dialog close · F5 no Sync ERROR | ✅ **CLOSED** |
| Empty / 0-active CTA path | cited QA | earlier WI run when `active=0` · this run `active=1` → picker (not CTA) · `orphanPost=false` | ✅ honest · not demote |
| **TC-HRM-HDSD-025** SoftDel | **🟢** | promote NEVER_TOUCH · 0 POST `/archive` this wave | ✅ must_keep · SoftDel GWC **not demoted** |
| **TC-HRM-HDSD-041** Xóa HĐ | **🟢** | promote NEVER_TOUCH · no HĐ DELETE | ✅ must_keep |
| Master panel create / SM | out of enroll AC | `insurer_label` 400 · SM `company_id` 400 | ⏳ **OPEN** GWC · **does not block** enroll close |

- **Matrix** — promote **323→324🟢 · 41→40🟡** · applied **only TC-049** · `regressions: []` · `must_keep_untouched` includes 025 · 041 · 096/097 · TC-HDSD-06/07/08
- **Matrix body spot** — TC-049 **🟢** · TC-025 **🟢** · TC-041 **🟢** · summary **324🟢 · 40🟡 · 0⬜**
- **Chain closed** — BE soft-resolve (0→404 / 1→201 / >1→AMBIG) + FE picker/`policy_id` + QA browser POST **201**

**NOT in this gate:** Phase 2 DONE · PROD · master-panel create/SM green · full mutate-defer all-green · Claude · seed · SoftDel demote.

---

## Evidence polled (QA + FE + BE intake)

| Artifact | Pack / check | QC audit |
|----------|--------------|----------|
| `qa-hdsd-bf-03-bh-ret-02-20260801.md` | verify **8/8 PASS** | ✅ Product PASS — enroll 201 · U65 · residuals master named · must_keep SoftDel |
| `d-hdsd-bf-03-bh-fe-picker-01-20260801.md` | — | ✅ ADD picker/CTA · vitest 7/7 · READY_FOR_QA chain |
| `d-hdsd-bf-03-bh-400-01-20260801.md` | — | ✅ BE soft-resolve · jest 18/18 · no orphan widen |
| `qc-hdsd-bf-03-softdel-close-01-20260801.md` | SoftDel GWC | ✅ R-MUTATE-SOFTDEL-01 CLOSED · TC-025 must_keep this gate |
| `_tmp-qa-hdsd-bf-03-bh-ret-02-runtime.json` | — | ✅ L0 200×3 · POST participants **201** · `policy_id` match · J-HRM-04 🟢 · console 0 · 0 archive |
| `_tmp-qa-hdsd-matrix-promote-bf-03-bh-ret-02-result.json` | — | ✅ applied=[049] · 323→324🟢 · regressions=[] · must_keep 025/041 |
| `screens/hdsd-bf-03-bh-ret-02-20260801/` | — | ✅ **6 PNG** — mount · dialog · force-save · enroll · after-save · F5 |
| `HDSD_SRS_TESTCASE_MATRIX.md` | — | ✅ 049🟢 · 025🟢 · 041🟢 · **324🟢/40🟡** · no false green |

---

## L2.5 journey (U19 — QC independent map)

| Journey | Slice mapping | Verdict | Evidence |
|---------|---------------|---------|----------|
| **J-HRM-04** (BH enroll) | `/hr/insurance` → Thêm BH → picker → Lưu → POST 201 → F5 | **PASS** | runtime TC-049 🟢 · `HRM-INS-P-201` · `policy_id=8cdd7567-…` · PNG 06/07/08 |
| **J-HRM-02** (SoftDel) | must_keep prior GWC | **PRESERVED** | promote never_touch 025 · 0 archive POST this wave |

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **TC-HRM-HDSD-025** SoftDel | matrix 🟢 · promote untouched · no `/archive` | ✅ |
| **TC-HRM-HDSD-041** | matrix 🟢 · promote untouched · no contract DELETE | ✅ |
| **TC-HDSD-06/07/08** | in `must_keep_untouched` | ✅ |
| **Ch09 096/097** | in `must_keep_untouched` | ✅ |
| **Prior SoftDel GWC** | not demoted · sibling BH close only | ✅ |
| **U65** | runtime `u65: zero-seed` · no `pnpm seed:*` | ✅ |
| **BE soft-resolve anti-orphan** | FE sends explicit `policy_id` · 0-active still 404 | ✅ preserved |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (slice)** | TC-049 🟢 CLOSED · POST participants 201 + `policy_id` · dialog close · F5 · J-HRM-04 · SoftDel/041 intact |
| **PROCESS** | QA intake pack **8/8** PASS · this QC pack targets 8/8 |
| **CONDITION CLOSED** | ~~**R-MUTATE-BH-400-01**~~ · FE picker + BE soft-resolve + QA enroll 201 |
| **CONDITION OPEN (GWC)** | **R-INS-POL-CREATE-LABEL-01** · **R-INS-POL-SM-COMPANYID-01** — master panel · **do not block** enroll AC |
| **INFO** | **C-QA-ENV-NOTE** — policy activated via diagnostic PATCH `{status}` during SM RCA (not FE SM); enroll mutate itself was browser FE |
| **PROGRAM** | NOT Phase 2 DONE · NOT PROD · **C-HOLD-DEPLOY** local `:5173` only |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks BH enroll close? | Trigger |
|----|------|-----|-------|-------|-------------------------|---------|
| ~~**R-MUTATE-BH-400-01**~~ | Dialog BH POST 400 / no `policy_id` | P2 | product FE+BE | — | — | ✅ **CLOSED** this gate |
| **R-INS-POL-CREATE-LABEL-01** | Master create POST includes `insurer_label` → **400** `HRM-VAL-001` | P2 | product FE | **dev-fe** | **No** (enroll AC) | Omit `insurer_label` or BE allow-list · FE create 201 |
| **R-INS-POL-SM-COMPANYID-01** | SM PATCH `{ company_id, status }` → **400**; `{ status }` alone → **200** | P2 | product FE | **dev-fe** | **No** (enroll AC) | Strip `company_id` from statusMutation body |
| **C-QA-ENV-NOTE** | Active policy via diagnostic PATCH (not FE SM) | Info | process | qa | No | Documented; optional FE SM smoke after DTO fix |
| **C-HOLD-DEPLOY** | Local `:5173` only | Info | env | devops | No | sponsor deploy |
| **C-PROGRAM** | NOT Phase 2 / PROD | P0 program | program | PM | No | program gate |

**QC ruling:** **R-MUTATE-BH-400-01 CLOSED**. TC-HRM-HDSD-049 **🟢** with POST **201** + explicit `policy_id`. SoftDel TC-025 + TC-041 **must_keep**. Master-panel residuals **OPEN** as GWC conditions — **không** demote enroll. No seed. No Phase2 DONE. SoftDel GWC **not demoted**.

---

## Command table (QC audit)

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-bf-03-bh-ret-02-20260801.md` | **exit 0** PASS **8/8** |
| Read promote JSON | **PASS** — applied=[049] · 323→324🟢 · regressions [] · must_keep 025/041/06/07/08 |
| Read runtime JSON | **PASS** — L0 200 · POST participants **201** `HRM-INS-P-201` · `policy_id` · dialogClosed · f5NoSyncError · console 0 · 0 archive |
| Matrix spot 049/025/041 | **PASS** — 🟢/🟢/🟢 · summary **324🟢 · 40🟡** |
| Screenshots dir (6 PNG) | **PASS** — mount · dialog · enroll · F5 |
| Cross-read FE picker + BE soft-resolve | **PASS** — chain complete |
| Cross-read SoftDel QC | **PASS** — SoftDel CLOSED must_keep; this WI closes BH sibling |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-bf-03-bh-close-01-20260801.md` | **exit 0** (this file) |

---

## Conditions (GWC — this slice)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**R-MUTATE-BH-400-01**~~ | TC-049 Thêm BH → Lưu → POST 201 + `policy_id` → F5 | P2 | **✅ CLOSED** | qc |
| **R-INS-POL-CREATE-LABEL-01** | Master create `insurer_label` → HRM-VAL-001 | P2 | ⏳ **OPEN** | dev-fe |
| **R-INS-POL-SM-COMPANYID-01** | SM PATCH strips `company_id` | P2 | ⏳ **OPEN** | dev-fe |
| **C-PROGRAM** | Phase2 / PROD | — | **NOT claimed** | pm |

---

## Handoff

**completion_report:** QC closed **R-MUTATE-BH-400-01** after independent audit of QA-BH-RET-02 + FE picker + BE soft-resolve. TC-HRM-HDSD-049 **🟢** with POST `/insurance-policy-participants` **201** `HRM-INS-P-201` and explicit `policy_id`, dialog close, F5 clean, J-HRM-04 PASS. Promote applied=[049] only (**324🟢 · 40🟡**). must_keep SoftDel TC-025 🟢 and TC-041 🟢 untouched — SoftDel GWC **not demoted**. Master residuals **R-INS-POL-CREATE-LABEL-01** / **R-INS-POL-SM-COMPANYID-01** remain **OPEN** (GWC; do not block enroll). U65 zero-seed. NOT Phase2 DONE. Verdict **GO WITH CONDITIONS**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: D-HDSD-BF-03-BH-POL-DTO-01
from_role: pm | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · residual R-INS-POL-CREATE-LABEL-01 + R-INS-POL-SM-COMPANYID-01 · Cursor sole
entry_criteria:
- QC-HDSD-BF-03-BH-CLOSE-01 PASS_TO_PM · R-MUTATE-BH-400-01 CLOSED · TC-049 🟢
- evidence docs/qa/evidence/qc-hdsd-bf-03-bh-close-01-20260801.md
- SoftDel TC-025 🟢 must_keep · TC-041 🟢
exit_criteria:
- InsurancePolicyMasterPanel create: omit insurer_label (or BE allow-list) → POST policies 201 FE-only
- statusMutation PATCH body: status only (no company_id) → draft→active 200 FE-only
- must_keep: TC-049 🟢 · TC-025 · TC-041 · AddInsuranceDialog picker · U65 no seed
- evidence docs/qa/evidence/d-hdsd-bf-03-bh-pol-dto-01-20260801.md
- READY_FOR_QA smoke create→SM→enroll (optional regression)
cấm: seed · demote TC-049/025/041 · claim Phase2 DONE · Claude
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-bf-03-bh-close-01-20260801.md`

**ack_status:** **PASS_TO_PM**
