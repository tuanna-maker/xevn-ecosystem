# QC Close — HDSD BF-03 BH policy DTO (`QC-HDSD-BF-03-BH-POL-DTO-CLOSE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-BF-03-BH-POL-DTO-CLOSE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-INS-POL-CREATE-LABEL-01** + **R-INS-POL-SM-COMPANYID-01** · Cursor sole |
| **gate_type** | L3 QC — close master policy create/SM DTO after `QA-HDSD-BF-03-BH-POL-DTO-RET-01` |
| **prior_gates** | BH enroll GWC CLOSED (`qc-hdsd-bf-03-bh-close-01`) · SoftDel GWC CLOSED (`qc-hdsd-bf-03-softdel-close-01`) · FE DTO `d-hdsd-bf-03-bh-pol-dto-01` |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · browser-only · no seed · **must_keep** TC-049 · TC-025 · TC-041 · **no demote** · **cấm** claim Phase2 DONE · **cấm** Claude |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/insurance?portal=1&tenantId=xevn&companyId=main` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — **R-INS-POL-CREATE-LABEL-01** + **R-INS-POL-SM-COMPANYID-01 CLOSED**:

| TC / check | Matrix | Runtime / UI | QC |
|------------|--------|--------------|-----|
| **R-INS-POL-CREATE-LABEL-01** Master create | n/a (GWC residual) | POST policies **201** `HRM-INS-POL-201` · body **no** `insurer_label` · keys whitelist | ✅ **CLOSED** |
| **R-INS-POL-SM-COMPANYID-01** SM draft→active | n/a (GWC residual) | PATCH **200** `HRM-INS-POL-200` · body `{status}` only · `company_id=main` query | ✅ **CLOSED** |
| **TC-HRM-HDSD-049** Dialog BH | **🟢** | picker smoke visible · Lưu enabled · enroll full 201 **must_keep prior** (not re-mutated this wave) | ✅ must_keep · **not demoted** |
| **TC-HRM-HDSD-025** SoftDel | **🟢** | 0 POST `/archive` this wave | ✅ must_keep · SoftDel GWC **not demoted** |
| **TC-HRM-HDSD-041** Xóa HĐ | **🟢** | 0 contract DELETE | ✅ must_keep |
| Prior BH enroll GWC | CLOSED | R-MUTATE-BH-400-01 still CLOSED | ✅ preserved |

- **Matrix** — promote **none** (residuals are master-panel GWC, not new TC rows) · summary **324🟢 · 40🟡 · 0⬜** · body spot **049🟢 / 025🟢 / 041🟢**
- **Chain closed** — FE payload builders + MasterPanel + hrmApi query/`company_id` + QA browser create→SM

**NOT in this gate:** Phase 2 DONE · PROD · full mutate-defer bag re-open · SoftDel/enroll demote · Claude · seed.

---

## Evidence polled (QA + FE intake)

| Artifact | Pack / check | QC audit |
|----------|--------------|----------|
| `qa-hdsd-bf-03-bh-pol-dto-ret-01-20260801.md` | verify **8/8 PASS** | ✅ Product PASS — POST 201 no label · PATCH status-only · U65 · must_keep SoftDel |
| `d-hdsd-bf-03-bh-pol-dto-01-20260801.md` | — | ✅ FIX payload builders · vitest 6/6 · tsc 0 · READY_FOR_QA chain |
| `qc-hdsd-bf-03-bh-close-01-20260801.md` | BH enroll GWC | ✅ R-MUTATE-BH-400-01 CLOSED · residuals named OPEN → closed this WI |
| `qc-hdsd-bf-03-softdel-close-01-20260801.md` | SoftDel GWC | ✅ R-MUTATE-SOFTDEL-01 CLOSED · TC-025 must_keep |
| `_tmp-qa-hdsd-bf-03-bh-pol-dto-ret-01-runtime.json` | — | ✅ L0 200×3 · create `has_insurer_label=false` · PATCH `bodyKeys=["status"]` · `company_id_query=main` · archivePosts=0 · J-HRM-04 🟢 |
| `screens/hdsd-bf-03-bh-pol-dto-ret-01-20260801/` | — | ✅ **8 PNG** — mount · MD · master · created · SM active · enroll dialog · after-save · F5 |
| `HDSD_SRS_TESTCASE_MATRIX.md` | — | ✅ 049🟢 · 025🟢 · 041🟢 · **324🟢/40🟡** · no demote |

---

## Audit — POST / PATCH (mandatory exit)

| Check | Observed (runtime) | QC |
|-------|--------------------|-----|
| POST `/api/hrm/contracts-insurance/insurance-policies` | **201** `HRM-INS-POL-201` · id `71efb104-…` · code `QA-DTO-DTO8GFR4R` | ✅ |
| POST body keys | `company_id`, `policy_code`, `policy_name`, `insurer_key`, `insurance_type`, `effective_date` | ✅ whitelist |
| `insurer_label` in POST | **`has_insurer_label=false`** · absent from bodyPreview | ✅ |
| PATCH `…/insurance-policies/{id}?company_id=main` | **200** `HRM-INS-POL-200` · `statusField=active` | ✅ |
| PATCH body | `{ "status": "active" }` · `bodyKeys=["status"]` · `has_company_id_in_body=false` | ✅ status-only |
| SoftDel / HĐ DELETE | `archivePosts=0` · `contractDeletes=0` | ✅ |

---

## L2.5 journey (U19 — QC independent map)

| Journey | Slice mapping | Verdict | Evidence |
|---------|---------------|---------|----------|
| **J-HRM-04** (master create → SM → picker) | `/hr/insurance` → Tạo chính sách → → Đang hiệu lực → Thêm BH picker | **PASS** | runtime create+SM 🟢 · picker smoke · PNG 03/04/05 |
| **J-HRM-04** (enroll 201) | must_keep prior BH close | **PRESERVED** | prior QC POST participants 201 · this wave smoke only (`enroll201=false` intentional) |
| **J-HRM-02** (SoftDel) | must_keep prior SoftDel GWC | **PRESERVED** | 0 archive · TC-025 🟢 |

---

## must_keep regression

| Item | Check | QC |
|------|-------|-----|
| **TC-HRM-HDSD-049** | matrix 🟢 · picker visible · no demote · enroll path untouched | ✅ |
| **TC-HRM-HDSD-025** SoftDel | matrix 🟢 · 0 `/archive` | ✅ SoftDel GWC not demoted |
| **TC-HRM-HDSD-041** | matrix 🟢 · 0 HĐ DELETE | ✅ |
| Prior BH enroll GWC | R-MUTATE-BH-400-01 stays CLOSED | ✅ |
| **U65** | runtime `u65: zero-seed` · catalog via FE MD upsert | ✅ no seed |
| BE soft-resolve | no BE change this wave | ✅ preserved |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (slice)** | Master create 201 no `insurer_label` · SM PATCH status-only + `company_id` query 200 · J-HRM-04 create→SM · must_keep 049/025/041 |
| **PROCESS** | QA intake pack **8/8** PASS · this QC pack targets 8/8 |
| **CONDITION CLOSED** | ~~**R-INS-POL-CREATE-LABEL-01**~~ · ~~**R-INS-POL-SM-COMPANYID-01**~~ |
| **CONDITION OPEN (GWC)** | **C-HOLD-DEPLOY-DTO** — local `:5173` only; if VPS deploy was **enroll-only**, need allow-list follow-up for DTO files |
| **INFO** | TC-049 this wave = **picker smoke** (not re-run enroll POST 201) — enroll already CLOSED by `QC-HDSD-BF-03-BH-CLOSE-01` |
| **PROGRAM** | NOT Phase 2 DONE · NOT PROD · SoftDel + BH enroll GWC remain CLOSED |

---

## Residual (mandatory audit)

| ID | Item | Sev | Class | Owner | Blocks DTO close? | Trigger |
|----|------|-----|-------|-------|-------------------|---------|
| ~~**R-INS-POL-CREATE-LABEL-01**~~ | Master create `insurer_label` → 400 | P2 | product FE | — | — | ✅ **CLOSED** this gate |
| ~~**R-INS-POL-SM-COMPANYID-01**~~ | SM PATCH with `company_id` body → 400 | P2 | product FE | — | — | ✅ **CLOSED** this gate |
| **C-HOLD-DEPLOY-DTO** | VPS may still miss DTO slice if `DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01` pushed enroll-only | Info | env/deploy | **devops** / PM | No (local PASS) | Allow-list: `insurancePolicyPayload.ts(+test)` · `InsurancePolicyMasterPanel.tsx` · `hrmApi.ts` create/update |
| **C-PROGRAM** | NOT Phase 2 / PROD | P0 program | program | PM | No | program gate |

**QC ruling:** Both master-panel GWC residuals from BH enroll close are **CLOSED**. POST policies **201** without `insurer_label`; PATCH **200** status-only with `company_id` on query. TC-049 / 025 / 041 **🟢 preserved · no demote**. SoftDel GWC + BH enroll GWC **not demoted**. U65 zero-seed. NOT Phase2 DONE. Verdict **GO WITH CONDITIONS** (deploy allow-list only).

---

## Command table (QC audit)

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-bf-03-bh-pol-dto-ret-01-20260801.md` | **exit 0** PASS **8/8** |
| Read runtime JSON | **PASS** — POST **201** no label · PATCH **200** status-only · query `main` · archive=0 · J-HRM-04 🟢 · console 0 |
| Matrix spot 049/025/041 | **PASS** — 🟢/🟢/🟢 · summary **324🟢 · 40🟡** · no demote |
| Screenshots dir (8 PNG) | **PASS** — create · SM · enroll dialog |
| Cross-read FE DTO evidence | **PASS** — payload builders + MasterPanel + hrmApi · vitest 6/6 |
| Cross-read BH enroll + SoftDel QC | **PASS** — both GWC CLOSED must_keep; this WI closes master residuals |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-bf-03-bh-pol-dto-close-01-20260801.md` | **exit 0** (this file) |

---

## Conditions (GWC — this slice)

| ID | Item | Sev | Status | Owner |
|----|------|-----|--------|-------|
| ~~**R-INS-POL-CREATE-LABEL-01**~~ | POST policies omit `insurer_label` → 201 | P2 | **✅ CLOSED** | qc |
| ~~**R-INS-POL-SM-COMPANYID-01**~~ | PATCH status-only + `company_id` query → 200 | P2 | **✅ CLOSED** | qc |
| **C-HOLD-DEPLOY-DTO** | VPS allow-list DTO files if enroll-only already pushed | Info | ⏳ OPEN deploy | devops / pm |
| **C-PROGRAM** | Phase2 / PROD | — | **NOT claimed** | pm |

---

## Handoff

**completion_report:** QC closed **R-INS-POL-CREATE-LABEL-01** and **R-INS-POL-SM-COMPANYID-01** after independent audit of QA-POL-DTO-RET-01 + FE DTO fix. POST `/insurance-policies` **201** `HRM-INS-POL-201` without `insurer_label`; PATCH draft→active **200** status-only with `company_id` on query. J-HRM-04 create→SM PASS. must_keep TC-049 / TC-025 / TC-041 **🟢 no demote** — SoftDel GWC + BH enroll GWC **not demoted**. Matrix promote none (324🟢/40🟡). U65 zero-seed. NOT Phase2 DONE. Sole residual **C-HOLD-DEPLOY-DTO** (VPS allow-list). Verdict **GO WITH CONDITIONS**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: DO-HDSD-BF-03-BH-POL-DTO-DEPLOY-01
from_role: pm | to_role: devops
program: P-HDSD-ECOSYSTEM-03 · follow-up after QC-HDSD-BF-03-BH-POL-DTO-CLOSE-01 GWC
entry_criteria:
- QC-HDSD-BF-03-BH-POL-DTO-CLOSE-01 PASS_TO_PM · R-INS-POL-* CLOSED
- evidence docs/qa/evidence/qc-hdsd-bf-03-bh-pol-dto-close-01-20260801.md
- If DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01 already pushed enroll-only → extend allow-list
exit_criteria:
- Commit/push allow-list includes:
  - apps/web/hrm/src/lib/insurancePolicyPayload.ts
  - apps/web/hrm/src/lib/insurancePolicyPayload.test.ts
  - apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx
  - apps/web/hrm/src/integrations/hrmApi.ts (create/update insurance policy DTO signatures)
- VPS smoke optional: POST policies 201 no insurer_label · PATCH status-only 200
- cấm: seed · demote TC-049/025/041 · claim Phase2 DONE · Claude
- evidence docs/qa/evidence/do-hdsd-bf-03-bh-pol-dto-deploy-01-20260801.md
note: if DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01 still IN FLIGHT and can absorb DTO files in same push → fold into that WI; else open this follow-up
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-bf-03-bh-pol-dto-close-01-20260801.md`

**ack_status:** **PASS_TO_PM**
