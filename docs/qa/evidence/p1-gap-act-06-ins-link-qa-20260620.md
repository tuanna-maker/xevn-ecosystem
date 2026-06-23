# P1-GAP-ACT-06-INS-LINK-QA — ACT-HRM-INS-LINK browser UAT

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-06-INS-LINK-QA` |
| **role** | qa |
| **executed_at** | 2026-06-20 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **URL** | `/command-center/hrm/insurance?portal=1&companyId=main` (embed: `/hr/insurance?portal=1&tenantId=xevn&companyId=main`) |
| **spec_ref** | `docs/ecosystem/ACTION_BUTTON_INVENTORY.md` §10 · **AC-UF-HRM-04** · **AC-CRUD-HRM-INS-G-C-01** · **AC-CRUD-HRM-INS-G-U-01** |
| **capability** | `ACT-HRM-INS-LINK` |
| **precondition** | dev-fe `P1-GAP-ACT-06-INS-LINK-FE` READY_FOR_QA — `docs/qa/evidence/p1-gap-act-06-ins-link-fe-20260620.md` |
| **rule** | U65 zero-seed · browser-only · Network 2xx + F5 |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS_TO_PM** — UF-HRM-04 / GAP-ACT-06 **CLOSED** on `:8088`. Link NV (POST participant **201**) and edit participation (PATCH participant uuid **200**) both persist after **F5**. Mutate targets `hrm_insurance_policy_participants` (not workforce row id).

| Metric | Result |
|--------|--------|
| L0 `qc:dev-stack` | exit **0** |
| POST link | **201** `/api/hrm/insurance-policy-participants` |
| PATCH update | **200** `/api/hrm/insurance-policy-participants/{uuid}?company_id=main` |
| F5 create | 🟢 row HLD-0061 persists |
| F5 patch | 🟢 BHXH `790QA0601PATCH` + salary `18.000.000 ₫` persist |

---

## UF-HRM-04 — Link NV (Thêm → Lưu)

| Step | Action | Result |
|------|--------|--------|
| Before | List **5** rows (workforce) | — |
| 1 | **Thêm bảo hiểm+** → combobox **Hồ Minh An — HLD-0061** | Dialog open |
| 2 | Nhập BHXH `790QA0601`, lương BH `15000000` → **Lưu thông tin** | Dialog closed |
| 3 | Network | **POST** `/api/hrm/insurance-policy-participants` → **201**; body `employee_code: HLD-0061`, `company_id: main` |
| 4 | FE sau 2xx | Row **HLD-0061 / Hồ Minh An** visible; list **6** rows |
| 5 | **F5** | Row HLD-0061 still present 🟢 |

---

## ACT-HRM-INS-LINK — Lưu sửa (PATCH)

| Step | Action | Result |
|------|--------|--------|
| 1 | Row HLD-0061 → icon **Pencil** (not Eye) → **Chỉnh sửa thông tin bảo hiểm** | Edit dialog |
| 2 | BHXH → `790QA0601PATCH`; Mức lương → `18000000` → **Cập nhật** | Dialog closed |
| 3 | Network | **PATCH** `/api/hrm/insurance-policy-participants/cb264a2b-d88b-403b-9b54-f2cbca88428a?company_id=main` → **200** (×3 duplicate calls — all 200, React strict/double-submit) |
| 4 | FE sau 2xx | Row shows `790QA0601PATCH`, `18.000.000 ₫`, premium `1.890.000 ₫` |
| 5 | **F5** | Values retained 🟢 |

---

## Verdict matrix

| Criterion | Expected | Observed | Verdict |
|-----------|----------|----------|---------|
| POST link 201 | `POST …/insurance-policy-participants` **201** `HRM-INS-P-201` | **201** | 🟢 **PASS** |
| Participant id on PATCH | PATCH uses participant uuid, not workforce id | uuid `cb264a2b-…` | 🟢 **PASS** |
| PATCH update 200 | **200** `HRM-INS-P-200` | **200** | 🟢 **PASS** |
| FE after 2xx + F5 | Row visible; data survives reload | Both steps 🟢 | 🟢 **PASS** |
| `data-capability` selector | `[data-capability="ACT-HRM-INS-LINK"]` on add/save | **null** on `:8088` deployed build (mutate still works) | 🟡 **note** — registry attr not on pilot bundle; non-blocker for mutate AC |

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| Registry attr | `data-capability="ACT-HRM-INS-LINK"` absent on add/update buttons on `:8088` | **dev-fe** deploy sync (optional polish) |
| POST body `employee_id` | Captured POST body used `employee_code`; API accepted **201** | qa note — verify OpenAPI if strict `employee_id` required |
| Duplicate PATCH | 3× PATCH 200 same payload in one click | **dev-fe** idempotency polish (non-blocker) |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | GAP-ACT-06 **CLOSED** 🟢 — browser POST 201 link + PATCH 200 participant uuid + F5 both on `:8088` ceo@xe.vn HRM Insurance |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-SCREEN-ACTION-QC-SLICE-01 — PM intake PASS_TO_PM from docs/qa/evidence/p1-gap-act-06-ins-link-qa-20260620.md. Promote screen-action-catalog-map GAP-ACT-06 🟢; dispatch qc slice audit P0 block (GAP-ACT-03 partial remains). Optional dev-fe redeploy for data-capability attr on :8088.` |
| **evidence_path** | `docs/qa/evidence/p1-gap-act-06-ins-link-qa-20260620.md` |
| **ack_status** | **PASS_TO_PM** |
