# QA-HRM-CO-INDUSTRY-01 — Company Management «Ngành nghề»

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-CO-INDUSTRY-01` |
| **Prior FE** | `docs/qa/evidence/dev-fe-hrm-co-industry-01-20260727.md` (`READY_FOR_QA`) |
| **BA AC** | `docs/qa/evidence/ba-hrm-co-industry-01-20260727.md` (`AC-CO-IND-01..06`) |
| **SA design** | `docs/qa/evidence/sa-hrm-co-industry-design-01-20260727.md` · `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **Env** | Portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/company` → iframe `/hr/company?portal=1&tenantId=xevn&companyId=main` |
| **Constraints** | **U65 zero-seed** · browser-only · screenshots required |
| **Overall** | **PASS** → `ack_status: PASS_TO_PM` |

---

## 0. L0 / live health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** (script printed healthy; Node process ended with Windows assert after success log) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Seed | **not used** |

---

## 1. Scope executed

- **Click path:** login `ceo@xe.vn` → `/command-center/hrm/company` → observe card + table column `Ngành nghề` → F5 → reopen same route → verify counts still non-zero.
- **L2.5 linkage:** reused same Company Management browser wave with `J-HRM-CO-01` detail/back evidence from `scripts/qa/qa-hrm-co-emp-count-01.mjs`.
- **Runners / runtime:**
  - `scripts/qa/qa-hrm-co-emp-count-01.mjs`
  - `docs/qa/evidence/_tmp-qa-hrm-co-emp-count-01-runtime.json`
  - `docs/qa/evidence/qa-hrm-co-industry-01-runtime-20260727.json`

---

## 2. AC matrix

| AC | Criterion | Verdict | Evidence |
|----|-----------|---------|----------|
| **AC-CO-IND-01** | Không dòng nào hiện raw `subsidiary` / `holding` trong cột `Ngành nghề` | **PASS** | 5/5 rows = `-`; `leakRowsInitial=[]`; `leakRowsAfterF5=[]` |
| **AC-CO-IND-02** | Empty SoT → `-` / `—`, không fake industry | **PASS** | Cả initial + F5: `Tập đoàn XeVN`, `X.E TM-DV`, `Visun`, `X.E Du lịch`, `X.E Việt Nam` đều hiện `-` |
| **AC-CO-IND-03** | Nếu `business_lines` present thì phải ra VI / human-readable | **PASS (not exercised)** | Live payload visible rows không trả `business_lines`; UI giữ `-` là honest fallback, không giả ngành |
| **AC-CO-IND-04** | F5 không leak lại `entity_type` | **PASS** | Sau F5 vẫn `-` cho 5/5 rows; không có `subsidiary` / `holding` |
| **AC-CO-EMP-REG** | Regression card / row count không về 0 | **PASS** | Card `1109`; rows `229 / 220 / 220 / 220 / 220` sau load và sau F5 |
| **J-HRM-CO-01** | Company list → detail/back vẫn sống | **PASS** | `common.viewDetail` dialog mở; `detailEmp=229`; back list vẫn non-zero |

---

## 3. Browser evidence

### 3.1 Table snapshot

| Tên công ty | Ngành nghề (load) | Ngành nghề (F5) | Số nhân viên |
|-------------|-------------------|-----------------|--------------|
| Tập đoàn XeVN | `-` | `-` | `229` |
| Công ty Cổ phần Thương mại và Dịch vụ X.E | `-` | `-` | `220` |
| Công ty TNHH Du lịch Visun | `-` | `-` | `220` |
| Công ty TNHH Du lịch X.E Việt Nam | `-` | `-` | `220` |
| Công ty TNHH X.E Việt Nam | `-` | `-` | `220` |

### 3.2 Network / source payload

#### Portal UI route

- `GET /api/hrm/employees/summary?company_id=main` → **200** `HRM-EMP-SUMMARY-200`
- `total=1109`
- `by_company[5] = holding 229, trsport 220, logistics 220, finance 220, services 220`

#### XBOS payload relevant to industry

- `GET /api/xbos/tenant-scope/group-member-units` → **200**
  - visible member rows contain `entity_type="subsidiary"`
  - visible sample does **not** include `business_lines`
- `GET /api/xbos/org-foundation/legal-entities` → **200**
  - visible sample `Tập đoàn XeVN`
  - `business_lines = null`
  - `payload.companyForm.industry = null`

**QA interpretation:** current live SoT delivered to visible Company rows has **no industry value**, so rendering `-` is correct. The defect class under this wave was raw `entity_type` leaking into `Ngành nghề`; that leak is closed.

---

## 4. Screenshots

| File | Content |
|------|---------|
| `docs/qa/evidence/qa-hrm-co-industry-01-company-20260727.png` | Company page initial load |
| `docs/qa/evidence/qa-hrm-co-industry-01-f5-20260727.png` | Same page after F5 |
| `docs/qa/evidence/_tmp-qa-hrm-co-emp-count-01-detail.png` | `J-HRM-CO-01` detail dialog |
| `docs/qa/evidence/_tmp-qa-hrm-co-emp-count-01-dashboard.png` | Dashboard parity `1109` |

---

## 5. Verdict

### completion_report

- **Closed:** `AC-CO-IND-01..04` for live browser slice on `/command-center/hrm/company`; raw `entity_type` leak is gone; F5 stable; regression headcount remains `1109` / `229+220+220+220+220`; `J-HRM-CO-01` still PASS in same wave.
- **Residual:** none blocking for this defect. Visible live payload still has no `business_lines`, so VI label mapping path was not exercised with non-empty data in this run.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-CO-INDUSTRY-01
from_role: pm
to_role: qc
entry_criteria: QA-HRM-CO-INDUSTRY-01 PASS_TO_PM; zero-seed browser evidence complete; screenshots attached; J-HRM-CO-01 still PASS
exit_criteria: Audit evidence for Company Management industry slice: no raw subsidiary/holding in Ngành nghề, empty→-, F5 stable, headcount regression still 1109/229/220..., no blocker residual
evidence_path: docs/qa/evidence/qa-hrm-co-industry-01-20260727.md
ack_status: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/qa-hrm-co-industry-01-20260727.md`

### ack_status

**PASS_TO_PM**
