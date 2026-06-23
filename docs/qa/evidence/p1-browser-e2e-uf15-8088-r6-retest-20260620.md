# P1-BROWSER-E2E-UF15-8088-R6-RETEST — QA evidence (UF-XBOS-15)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-UF15-8088-R6-RETEST` |
| **role** | qa |
| **executed_at** | 2026-06-20 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **entry** | [assignee hotfix](../../ops/evidence/p1-deploy-cat-inbox-assignee-8088-20260620.md) — inbox 93→100 unblocked |
| **rule** | U65 zero-seed · browser-only |
| **ack_status** | **FAIL_TO_PM** |

---

## Executive summary

**FAIL_TO_PM (UF-XBOS-15 partial R6-RETEST)** — Assignee hotfix **closed inbox gate**; approve chain **still blocked** by scope 409 + F5 + route 404.

| Criterion | Result | Notes |
|-----------|--------|-------|
| 1. FE extension → HRM-SET-209 | **🟢 PASS** | Label `Phụ cấp chức danh QA-R6-RETEST-75520` → POST `hrm_employee_work_fields/extension-items` **201** `HRM-SET-209`; `workflowInstanceId=ba6c83ba-ce74-4bc1-825f-e17ab90ccc93`; `batchId=6a717e35-f072-480d-ad4d-f8ef012f5104` |
| 2. Inbox ≥1 → select task | **🟢 PASS** | `?settings=hrm_catalog_governance` **Hộp thư (100)**; batch `6a717e35…` visible; assignee `ceo@xe.vn` |
| 3. Group Duyệt → HRM DM read-back | **🔴 FAIL** | **Phê duyệt danh mục** → POST `/api/xbos/catalog-governance/tasks/…/approve` **409** `SCOPE_CONTEXT_MISMATCH` (`token=main`, `request=holding`); no `XBOS-CAT-201`; batch detail shows **Nhãn** column (e.g. «Nhóm ca làm việc») but **retest field not in batch items** |
| 4. F5 persist extension field | **🔴 FAIL** | Pre-sync dialog **25 trường** (work block) → after reload **24 trường**; `Phụ cấp chức danh QA-R6-RETEST-75520` **absent** |
| 5. «Danh mục» dropdown by name | **🔴 FAIL** | `/hr/settings-catalogs` → **404 Trang không tồn tại** |
| 6. Matrix UF-15 → 🟢 | **N/A** | Full chain not PASS — matrix stays **🟡** |

**R6-RETEST delta vs R6:** Inbox **(0)→(100)** ✅ after assignee SQL hotfix. New blocker: **approve 409 scope** (inbox was empty in R6, approve untested).

---

## UF-XBOS-15 — Click path

### Bước 1 — Extension from FE

- **URL:** `?settings=company_group_hr`
- **Tab:** **X.E Du lịch VN** (`QA-BRW-UF03-20260620-WAVE`)
- **Action:** **Cấu hình chi tiết** → **Công việc & tổ chức** → **Thêm field custom**
- **Label:** `Phụ cấp chức danh QA-R6-RETEST-75520`
- **Field code:** `company_group_hr_profile__work__phu_cap_chuc_danh_qa_r6_retest_75520`
- **Confirm:** **Xác nhận (áp dụng)** → **Đang đồng bộ…**

### Network (fetch hook — extension-items)

| Catalog key | HTTP | Code | workflowInstanceId |
|-------------|------|------|-------------------|
| `hrm_employee_basic_fields` | 400 | HRM-VAL-001 | — |
| `hrm_employee_contact_fields` | **201** | HRM-SET-209 | `ba64d2ba-bb37-45f9-aafa-7438b00673b9` |
| `hrm_employee_insurance_fields` | **201** | HRM-SET-209 | `1b2d87ad-e2b9-4d7a-8c09-5dd25883a3a1` |
| `hrm_employee_emergency_fields` | **201** | HRM-SET-209 | `254062ae-4e97-4e05-a3b9-fb1fd88395f5` |
| `hrm_employee_address_fields` | **201** | HRM-SET-209 | `b87066b0-39f3-4f12-8a52-5fb94a4d8656` |
| **`hrm_employee_work_fields`** | **201** | **HRM-SET-209** | **`ba6c83ba-ce74-4bc1-825f-e17ab90ccc93`** |
| `hrm_employee_personal_fields` | **201** | HRM-SET-209 | `fd8a46d0-9585-404d-9257-37e3853335b7` |
| `hrm_employee_finance_fields` | **201** | HRM-SET-209 | `03d3ccbe-2ae0-4352-96b1-7bf53913e19d` |

- **FE post-mutation:** work block **25 trường**; row label readable in dialog

### Bước 2 — Catalog governance inbox

- **URL:** `?settings=hrm_catalog_governance`
- **UI:** **Hộp thư (100)** — assignee hotfix verified (`ceo@xe.vn`)
- **Selected batch:** `6a717e35-f072-480d-ad4d-f8ef012f5104` (work_fields sync from this session)
- **Detail table:** columns **Danh mục / Mã / Nhãn** — labels Vietnamese (e.g. «Nhóm ca làm việc», «Địa điểm làm việc»), not raw key only

### Bước 3 — Group Duyệt (FAIL)

- **Action:** **Phê duyệt danh mục**
- **Network:**

```json
POST /api/xbos/catalog-governance/tasks/93031d7e-bfe3-4270-a395-5c2e169e8ef8/approve
→ 409 SCOPE_CONTEXT_MISMATCH
{ "token": "main", "request": "holding", "field": "companyId" }
```

- **Batch items (5):** `employment_type`, `join_date`, `manager`, `work_location`, `xbos_work_shift_group` — **retest custom field not listed**
- **HRM effective catalog read-back:** blocked — approve did not complete

### F5 persist (FAIL)

- Reload `?settings=company_group_hr` → re-open dialog on **X.E Du lịch VN**
- **Công việc & tổ chức:** **24 trường** (was 25 pre-reload)
- **`Phụ cấp chức danh QA-R6-RETEST-75520` absent**

### «Danh mục» consumer route (FAIL)

- **URL:** `/hr/settings-catalogs` → **404 Trang không tồn tại**

---

## Gate table (UF-15 R6-RETEST)

| Gate | Result |
|------|--------|
| U65 no seed | **PASS** |
| HRM-SET-209 + workflowInstanceId | **PASS** |
| Inbox ≥1 (assignee hotfix) | **PASS** |
| Duyệt XBOS-CAT-201 / approve 2xx | **FAIL** (409 scope) |
| HRM effective catalog read-back | **FAIL** |
| «Danh mục» consumer route | **FAIL** (404) |
| F5 field persist | **FAIL** |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-W1-15-APPROVE-SCOPE | Approve POST **409** `token=main` vs `request=holding` on catalog-governance task | dev-be |
| R-W1-15-EXT-IN-BATCH | Custom extension label posted in dialog but **not** in approval batch items / not persisted F5 | dev-be / dev-fe |
| R-W1-15-F5-CONFIG | Custom field visible pre-sync, **24 vs 25** after reload | dev-fe / dev-be |
| R-W1-15-HRM-SC-ROUTE | `/hr/settings-catalogs` **404** on :8088 | dev-fe / devops |

---

## Handoff packet

- **completion_report:** R6-RETEST closed **inbox assignee hotfix** (100 tasks, batch selectable). **FAIL** full UF-15 chain: approve **409 scope**, custom field not in batch / F5 revert, HRM settings route 404.
- **next_owner:** `pm` → `dev-be` (approve scope parity) → `qa` retest UF-15
- **next_dispatch_prompt:** Task dev-be — work_item_id P1-CAT-GOV-APPROVE-SCOPE-8088: entry_criteria UF-15 R6-RETEST QA FAIL — inbox PASS but POST `/api/xbos/catalog-governance/tasks/{id}/approve` returns 409 SCOPE_CONTEXT_MISMATCH token=main request=holding for ceo@xe.vn on :8088; evidence docs/qa/evidence/p1-browser-e2e-uf15-8088-r6-retest-20260620.md. exit_criteria: approve uses same company scope as JWT (main/holding parity per ADR-GROUP-CEO-MAIN-HOLDING-SCOPE); POST approve 2xx XBOS-CAT-201; extension item in batch + F5 persist; ack_status READY_FOR_QA.
- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-uf15-8088-r6-retest-20260620.md`
- **ack_status:** **FAIL_TO_PM**
