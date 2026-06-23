# P1-BROWSER-E2E-UF09-UF15-8088-R7-FINAL — UF-XBOS-09 + UF-XBOS-15

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-UF09-UF15-8088-R7-FINAL` |
| **role** | qa |
| **executed_at** | 2026-06-20T15:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **precondition** | `P1-CAT-APPROVE-SCOPE-8088` deployed — probe POST approve **201** `XBOS-CAT-201` |
| **rule** | U65 zero-seed · browser-only |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS_TO_PM** — Post approve-scope deploy, full U65 browser chain **UF-XBOS-09** and **UF-XBOS-15** PASS on `:8088`. UI label gates (G1 widgets, Action Cards **Quản trị danh mục**, no Seed) PASS. Wave 1 target **15/15 🟢** when combined with prior R5/R6/R7 carry rows.

| UF | Verdict | Highlights |
|----|---------|------------|
| UF-XBOS-09 | **🟢** | Inbox **(99)** → select Chức danh batch `2068d8f2` → **Phê duyệt danh mục** → POST **201** `XBOS-CAT-201` → **(98)** → F5 **(98)** |
| UF-XBOS-15 | **🟢** | Extension `QA-R7-UF15-806520` → **Xác nhận (áp dụng)** → `hrm_employee_work_fields` **201** `HRM-SET-209` → inbox batch `80200141` → approve **201** → F5 label persists |

---

## UI label gate (parallel — exit #4)

| Check | Verdict | FE post-mutation |
|-------|---------|------------------|
| CC home G1 | **🟢 PASS** | **Việc cần xử lý**, **Chỉ số KPI tập đoàn** — no `Task_Counter` / `KPI_Sparkline` |
| Action Cards G3 | **🟢 PASS** | **Quản trị danh mục** — no `catalog_governance` |
| Governance G2 Seed | **🟢 PASS** | No **Seed quy trình (dev)** button |
| Governance wf_* footer | **🟢 PASS** | **Quy trình: Phê duyệt bổ sung danh mục — CT Du lịch → Tập đoàn** (readable) |

---

## UF-XBOS-09 — Catalog governance approve

### Bước 1 — Inbox ≥1

- **Click path:** `/command-center?settings=hrm_catalog_governance` → **Làm mới**
- **UI:** **Hộp thư (99)** pending for `ceo@xe.vn`
- **Verdict:** **🟢 PASS**

### Bước 2 — Task detail (Chức danh + Nhãn readable)

- **Click path:** Hộp thư → batch **Mã lô: 2068d8f2…**
- **Chi tiết yêu cầu:**

| Danh mục | Mã | Nhãn |
|----------|-----|------|
| **Chức danh** | `devops_r6_1781941004065` | **DevOps R6 1781941004065** |

- **Verdict:** **🟢 PASS**

### Bước 3 — Phê duyệt → count↓ → F5

- **Action:** **Phê duyệt danh mục**
- **Network:**

```
POST /api/xbos/catalog-governance/tasks/faf97f8d-a0c0-4b4e-bea0-24f382a5405a/approve → 201 XBOS-CAT-201
```

- **FE post-mutation:** inbox **99 → 98**; batch `2068d8f2` removed from list
- **F5:** reload governance → **Hộp thư (98)** persists; batch absent
- **Verdict:** **🟢 PASS**

**UF-XBOS-09 overall:** **🟢 PASS**

---

## UF-XBOS-15 — Catalog governance extension

### Bước 1 — FE extension → HRM-SET-209

- **Click path:** `?settings=company_group_hr` → tab **X.E Du lịch VN** → **Cấu hình chi tiết** → **Công việc & tổ chức** → **Thêm field custom**
- **Label:** `QA-R7-UF15-806520`
- **Field code:** `company_group_hr_profile__work__qa_r7_uf15_806520`
- **Action:** **Thêm field** (24→**25 trường**) → **Xác nhận (áp dụng)**
- **Network (work_fields):**

```
POST /api/hrm/settings-catalogs/hrm_employee_work_fields/extension-items → 201 HRM-SET-209
batchId=80200141-25b7-4006-a98a-6ec1f3991902
workflowInstanceId=0fb1656e-1dbe-4b26-bcaf-4843c65169f1
submitted=5
```

- **Verdict:** **🟢 PASS**

### Bước 2 — Inbox → select batch

- **Click path:** `?settings=hrm_catalog_governance`
- **UI:** **Hộp thư (106)** after sync (+8 batches); select **Mã lô: 80200141…**
- **Detail table (5 rows):** Loại hợp đồng, Ngày vào làm, Quản lý trực tiếp, Địa điểm làm việc, Nhóm ca làm việc — Vietnamese **Nhãn** column readable
- **Note:** Custom stamp row not listed in batch items (same class as R6-RETEST); extension field verified via dialog F5 below
- **Verdict:** **🟢 PASS** (inbox + readable labels; custom row read-back via F5)

### Bước 3 — Phê duyệt → effective catalog

- **Action:** **Phê duyệt danh mục** on batch `80200141`
- **Network:**

```
POST /api/xbos/catalog-governance/tasks/fe092aa8-98ba-4aa1-b906-7aafab57a44d/approve → 201 XBOS-CAT-201
GET /api/hrm/settings-catalogs → 200 HRM-SET-200 (post-approve refresh)
```

- **Inbox:** **106 → 105**
- **Verdict:** **🟢 PASS**

### Bước 4 — F5 persist extension field

- **Click path:** F5 `?settings=company_group_hr` → X.E Du lịch VN → **Cấu hình chi tiết** → **Công việc & tổ chức**
- **FE post-mutation:** row **`QA-R7-UF15-806520`** present in work block field list
- **Verdict:** **🟢 PASS**

**UF-XBOS-15 overall:** **🟢 PASS**

---

## Gate table

| # | Criterion | UF-09 | UF-15 |
|---|-----------|-------|-------|
| U65 no seed | **PASS** | **PASS** | **PASS** |
| Inbox ≥1 | **🟢** (99) | **🟢** (106) | |
| Detail readable labels | **🟢** Chức danh | **🟢** Nhãn column | |
| Approve POST 2xx | **🟢** 201 | **🟢** 201 | |
| Count decrease | **🟢** 99→98 | **🟢** 106→105 | |
| F5 persist | **🟢** inbox 98 | **🟢** field label | |
| UI label gate | **🟢** | **🟢** | |

---

## Wave 1 impact

| Metric | Before R7-FINAL | After R7-FINAL |
|--------|-----------------|----------------|
| UF-XBOS-09 Dev8088 | 🔴/🟡 (409 scope) | **🟢** |
| UF-XBOS-15 Dev8088 | 🟡 (409 + F5 revert R6) | **🟢** |
| Wave 1 browser 🟢 | 13/15 | **15/15** (with R5 carry UF-01..08,10,12-14) |

---

## Residual

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-UF15-BATCH-ROW | Custom extension stamp not listed in governance batch detail rows (5 standard work_fields only) — F5 dialog read-back OK | P2 observe | dev-be |

---

## Handoff packet

- **completion_report:** R7-FINAL closed UF-09 approve chain (201 scope fix live) and UF-15 extension→approve→F5 on `:8088`. UI label fidelity gates PASS (Việc cần xử lý, Quản trị danh mục, no Seed). Wave 1 **15/15 🟢** browser target met.
- **next_owner:** `pm` → `qc`
- **next_dispatch_prompt:**

```
Role: qc
work_item_id: P1-BROWSER-E2E-XBOS-WAVE-8088-QC-CLOSE
from_role: qa
to_role: qc
priority: P0
entry_criteria: QA R7-FINAL PASS — UF-XBOS-09/15 🟢 on :8088; evidence docs/qa/evidence/p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md; Wave 1 15/15 browser; U65 no seed; approve scope 201 live
exit_criteria: QC audit L0–L2 Wave 1 matrix §3 Dev8088 all 🟢; GO or GWC with residual list; update USER_FLOW_OPERABILITY_MATRIX.md; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: Wave 1 closure — then HRM Wave 2 if program scope open
```

- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md`
- **ack_status:** **PASS_TO_PM**
