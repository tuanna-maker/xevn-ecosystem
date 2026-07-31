# QA-HDSD-BF-03-BH-RET-02 — TC-049 after FE policy picker

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-03-BH-RET-02` |
| **program** | `P-HDSD-ECOSYSTEM-03` · residual **R-MUTATE-BH-400-01** |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · run wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` |
| **URL** | `/hr/insurance?portal=1&tenantId=xevn&companyId=main` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no Claude** |
| **prior** | `D-HDSD-BF-03-BH-FE-PICKER-01` READY_FOR_QA · `qa-hdsd-bf-03-bh-ret-01` FAIL |
| **harness** | `scripts/qa/qa-hdsd-bf-03-bh-ret-02-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-ret-02-runtime.json` |
| **promote** | `docs/qa/evidence/_tmp-qa-hdsd-matrix-promote-bf-03-bh-ret-02-result.json` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-03-bh-ret-02-20260801/` |
| **ack_status** | **PASS_TO_PM** |

## Executive verdict

**TC-HRM-HDSD-049 🟢 — AddInsuranceDialog picker CLOSED.** Empty-policy CTA + Lưu disabled (no orphan POST) verified; with ≥1 active policy, Thêm BH → Lưu → POST participants **201 `HRM-INS-P-201`** with **`policy_id`** · dialog close · F5 no Sync ERROR. Matrix **+1🟢** (323→324). SoftDel TC-025 / TC-041 **must_keep untouched**.

| Check | Result |
|-------|--------|
| L0 hrm/xbos/portal | **200** |
| `qc:fe-be-health` | **8/8 PASS** |
| **0 active** → CTA «Tạo chính sách BH» + Lưu disabled + 0 orphan POST | **🟢** (earlier run in same WI when `active=0`) |
| **≥1 active** → policy picker visible · Lưu enabled | **🟢** |
| POST `/api/hrm/insurance-policy-participants` | **201** `HRM-INS-P-201` |
| Request `policy_id` | `8cdd7567-194a-4a77-a01b-d53d5aeab995` |
| Dialog close · F5 Sync ERROR | **close** · **none** |
| Insurance GET | **200** `HRM-CON-200` / policies `HRM-INS-POL-200` |
| Matrix TC-049 | **🟡→🟢** |
| SoftDel TC-025 / TC-041 | **🟢 preserved** (promote never_touch) |

---

## Click path (U65)

### A — Empty policies (active=0)

1. Login `ceo@xe.vn` → `/hr/insurance`.
2. **Thêm bảo hiểm** → dialog.
3. Banner + CTA **«Tạo chính sách BH»** (`data-testid=ins-create-policy-cta`) · **Lưu disabled**.
4. Force-click Lưu → **0** POST participants (no orphan).

### B — Enroll with active policy (active=1)

1. `/hr/insurance` → **Thêm bảo hiểm**.
2. Policy picker visible (`ins-participant-policy-picker`) · auto/select policy.
3. NV + catalog → **Lưu**.
4. Network: **POST** `/api/hrm/insurance-policy-participants` → **201** `HRM-INS-P-201` · body/`policy_id` set.
5. Dialog closes · **F5** · no `HRM API Sync ERROR`.

---

## Spec says / code does

| Layer | Spec / DoD | Observed |
|-------|------------|----------|
| FE picker (D-HDSD-BF-03-BH-FE-PICKER-01) | 0 active → CTA + block Lưu | **PASS** |
| FE picker | ≥1 → Select + `policy_id` in payload | **PASS** |
| TC-049 AC | Lưu → 201 · dialog close · F5 | **PASS** (when active ≥1) |
| BE soft-resolve | must_keep | **preserved** (FE now sends explicit `policy_id`) |
| SoftDel TC-025 | must_keep 🟢 | **PASS** — no archive mutate |
| TC-041 | must_keep 🟢 | **PASS** — no contract DELETE |

---

## Residual (honest — master panel, not dialog picker)

| ID | Item | Sev | Owner | Note |
|----|------|-----|-------|------|
| ~~**R-MUTATE-BH-400-01**~~ | Dialog BH POST 400 / no policy_id | P2 | — | **CLOSED** — picker + enroll 201 |
| **R-INS-POL-CREATE-LABEL-01** | FE `Tạo chính sách` POST includes `insurer_label` → **400 `HRM-VAL-001`** `property insurer_label should not exist` | P2 | **dev-fe** | `InsurancePolicyMasterPanel` saveMutation |
| **R-INS-POL-SM-COMPANYID-01** | FE SM PATCH `{ company_id, status }` → **400**; PATCH `{ status }` alone → **200** | P2 | **dev-fe** | statusMutation strips `company_id` from body |
| **C-QA-ENV-NOTE** | Active policy used for enroll wave was activated via diagnostic PATCH `{status}` during root-cause of SM 400 (not FE SM) | Info | qa | Documented; enroll itself was browser FE |

**J-HRM-04:** 🟢 enroll mutate path with `policy_id`.

---

## must_keep

| Item | Status |
|------|--------|
| SoftDel TC-025 🟢 | **PASS** — promote never_touch · no `/archive` POST |
| TC-041 🟢 | **PASS** — no contract DELETE |
| Insurance GET 200 | **PASS** |
| U65 zero-seed | **PASS** — no `pnpm seed:*` · Settings MD upsert FE for catalog · no Claude |
| Matrix false 🟢 | **none** — only TC-049 promoted |

---

## Matrix promote

| Action | Result |
|--------|--------|
| Promote TC-049 → 🟢 | **APPLIED** 🟡→🟢 |
| Counts | **323→324🟢 · 41→40🟡** |
| Regressions | **[]** |
| must_keep_untouched | 025 · 041 · 096/097 · TC-HDSD-06/07/08 |

---

## Command table

| Command / check | Exit / result |
|-----------------|---------------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** |
| `pnpm run qc:fe-be-health` | **8/8 PASS** |
| `node scripts/qa/qa-hdsd-bf-03-bh-ret-02-browser.mjs` | exit 0 · TC-049 🟢 · POST 201 |
| `node scripts/qa/qa-hdsd-matrix-promote-bf-03-bh-ret-02.mjs` | exit 0 · applied=[049] · regressions=[] |
| SoftDel / archive network | **0** POST archive |
| Screenshots | `screens/hdsd-bf-03-bh-ret-02-20260801/` |

---

## Handoff

**completion_report:** Retested TC-049 after D-HDSD-BF-03-BH-FE-PICKER-01. Empty CTA + Lưu disabled + no orphan POST **PASS**. With active policy, Thêm BH → Lưu → POST participants **201 `HRM-INS-P-201`** with `policy_id` · dialog close · F5 clean. Matrix TC-049 **🟢** (+1). SoftDel/TC-041 untouched. **R-MUTATE-BH-400-01 CLOSED**. Open residuals on **policy master** create (`insurer_label` → HRM-VAL-001) and SM PATCH (`company_id` forbidden) — dispatch Dev-FE, not demote TC-049.

**next_owner:** `pm` → optional **qc** close BH lane · **dev-fe** for master-panel residuals

**next_dispatch_prompt:**

```text
work_item_id: D-HDSD-BF-03-BH-POL-DTO-01
from_role: pm | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · residual R-INS-POL-CREATE-LABEL-01 + R-INS-POL-SM-COMPANYID-01
entry_criteria:
- QA-HDSD-BF-03-BH-RET-02 PASS_TO_PM · R-MUTATE-BH-400-01 CLOSED · TC-049 🟢
- evidence docs/qa/evidence/qa-hdsd-bf-03-bh-ret-02-20260801.md
exit_criteria:
- InsurancePolicyMasterPanel create: omit insurer_label (or BE allow-list) → POST policies 201 FE-only
- statusMutation PATCH body: status only (no company_id) → draft→active 200 FE-only
- must_keep: TC-049 🟢 · TC-025 · TC-041 · AddInsuranceDialog picker · U65 no seed
- READY_FOR_QA smoke create→SM→enroll (optional regression)
cấm: seed · demote TC-049/025 · Claude
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-bf-03-bh-ret-02-20260801.md`

**ack_status:** **PASS_TO_PM**
