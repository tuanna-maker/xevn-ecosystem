# QA-HDSD-BF-03-BH-RET-01 — TC-049 BH dialog retest (soft-resolve)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-03-BH-RET-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-BH-400-01** |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · run wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` |
| **URL** | `/hr/insurance?portal=1&tenantId=xevn&companyId=main` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no Claude** |
| **prior** | `D-HDSD-BF-03-BH-400-01` READY_FOR_QA · `docs/qa/evidence/d-hdsd-bf-03-bh-400-01-20260801.md` |
| **harness** | `scripts/qa/qa-hdsd-bf-03-bh-ret-01-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-ret-01-runtime.json` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-03-bh-ret-01-20260801/` |
| **ack_status** | **FAIL_TO_PM** |

## Executive verdict

**TC-HRM-HDSD-049 🟡 honest — BE soft-resolve verified; UAT has 0 active policies → POST 400 `HRM-INS-POL-404` · no false 🟢 · matrix not promoted.**

| Check | Result |
|-------|--------|
| L0 hrm/xbos/portal | **200** |
| `qc:fe-be-health` (pre) | **8/8 PASS** |
| Preflight policies active | **0** (`HRM-INS-POL-200` total=0) |
| Insurance list GET | **200** `HRM-CON-200` (must_keep) |
| Dialog «Thêm bảo hiểm» | **open** |
| POST `/api/hrm/insurance-policy-participants` | **400** `HRM-INS-POL-404` |
| Message | `policy_id is required for participant enroll (no active policy in scope)` |
| Dialog close on success | **no** (stayed open — expected on 400) |
| F5 Sync ERROR | **none** |
| Matrix TC-049 | remains **🟡** (cấm promote) |

**BE fix acceptance (partial):** Soft-resolve path ran (0 candidates → stable `HRM-INS-POL-404` + scope message). Not the pre-fix opaque 400-without-body class. **Product AC for TC-049 (201 + dialog close + F5 persist) not met** because env has **no active `hrm_insurance_policies`** — residual **FE policy picker / create-policy CTA** (per Dev contract).

---

## Click path (U65)

1. Login session `ceo@xe.vn` → `/hr/insurance`.
2. **Thêm bảo hiểm** → dialog open (shot `02-insurance-dialog`).
3. Employee typeahead + catalog/combobox picks → **Lưu**.
4. Network: **POST** `/api/hrm/insurance-policy-participants` → **400** `HRM-INS-POL-404`.
5. Dialog remains open · Escape · **F5** — no `HRM API Sync ERROR`.

---

## Spec says / code does

| Layer | Spec / DoD | Observed |
|-------|------------|----------|
| BE soft-resolve | omit `policy_id` + 0 active → 400 `HRM-INS-POL-404` | **PASS** |
| BE soft-resolve | omit + exactly 1 → 201 `HRM-INS-P-201` | **N/A** (0 policies) |
| BE soft-resolve | omit + >1 → 400 `HRM-INS-POL-AMBIG` | **N/A** |
| TC-049 AC | Lưu → 201 · dialog close · F5 persist | **FAIL** (blocked by 0 policies) |
| FE residual | policy picker when 0/AMBIG | **OPEN** — dialog still omits `policy_id`; no picker / «Tạo chính sách BH» CTA before Lưu |

---

## must_keep

| Item | Status |
|------|--------|
| Insurance GET 200 | **PASS** (`contracts-insurance/insurance` + participants list) |
| TC-041 HĐ delete | **not exercised** this wave |
| SoftDel menu path | **not touched** (no `/employees/.../archive`) |
| U65 zero-seed | **PASS** — no `pnpm seed:*` |
| Matrix false 🟢 | **none** — TC-049 stays 🟡 |

---

## Residual

| ID | Item | Sev | Owner | Note |
|----|------|-----|-------|------|
| **R-MUTATE-BH-400-01** | TC-049 cannot reach 201 while `active` policies = 0; FE must pick/create `policy_id` | P2 | **dev-fe** | `AddInsuranceDialog` + `buildInsuranceParticipantApiPayload` — add policy picker or CTA «Tạo chính sách BH» (`InsurancePolicyMasterPanel` / POST policies) before Lưu |
| BE soft-resolve | Verified 0→404 | — | closed for this env branch | Retest TC-049 after FE ships picker **or** after FE creates ≥1 active policy in scope (U65 FE-only) |

**J-HRM-04:** 🟡 — mutate path blocked honest (no 201).

---

## Matrix promote

| Action | Result |
|--------|--------|
| Promote TC-049 → 🟢 | **SKIPPED** (POST ≠ 201; honest 🟡) |
| Matrix row | `TC-HRM-HDSD-049` **🟡** unchanged |

---

## Handoff

**completion_report:** Retested TC-049 after D-HDSD-BF-03-BH-400-01. L0+fe-be PASS. Preflight **0 active insurance policies**. FE Thêm BH → Lưu → POST participants **400 `HRM-INS-POL-404`** (soft-resolve no-policy branch — BE contract OK). Dialog stayed open · F5 no Sync ERROR · insurance GET 200. **No matrix promote**. Residual **FE policy picker** (honest 🟡). must_keep SoftDel/TC-041 not touched.

**next_owner:** `pm` → dispatch **dev-fe**

**next_dispatch_prompt:**

```text
work_item_id: D-HDSD-BF-03-BH-FE-PICKER-01
from_role: pm | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · R-MUTATE-BH-400-01
entry_criteria:
- QA-HDSD-BF-03-BH-RET-01 FAIL_TO_PM
- evidence docs/qa/evidence/qa-hdsd-bf-03-bh-ret-01-20260801.md
- BE soft-resolve LIVE: 0→HRM-INS-POL-404 · >1→AMBIG · 1→201
- UAT companyId=main has 0 active hrm_insurance_policies
exit_criteria:
- AddInsuranceDialog: policy picker OR CTA «Tạo chính sách BH» before Lưu when policies 0/AMBIG
- buildInsuranceParticipantApiPayload includes policy_id when selected
- Empty policies: do not POST orphan; guide user to create policy (InsurancePolicyMasterPanel)
- After ≥1 unambiguous active policy (via FE create): Thêm BH → Lưu → POST participants 201 HRM-INS-P-201
- READY_FOR_QA → QA-HDSD-BF-03-BH-RET-02
allowed_paths:
- apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx
- apps/web/hrm/src/lib/insuranceParticipantLink.ts
- apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx (CTA link only if needed)
must_keep: BE soft-resolve · insurance GET · SoftDel · TC-041 · U65 no seed
cấm: seed · fake 🟢 · orphan policy_id NULL
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-bf-03-bh-ret-01-20260801.md`

**ack_status:** **FAIL_TO_PM**
