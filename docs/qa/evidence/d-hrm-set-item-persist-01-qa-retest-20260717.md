# D-HRM-SET-ITEM-PERSIST-01-QA (+ D-P1-HRM-PAY-STATUS-BADGE-01) — U65 browser retest

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HRM-SET-ITEM-PERSIST-01-QA` (+ `D-P1-HRM-PAY-STATUS-BADGE-01`) |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` · VPS HEAD `63915ed` (per deploy evidence) |
| **persona** | `ceo@xe.vn` · Group CEO · `companyId=main` |
| **entry** | Deploy READY_FOR_QA — `docs/qa/evidence/d-p1-hrm-pay-status-badge-deploy-20260717.md`; BE — `docs/qa/evidence/d-hrm-set-item-persist-01-20260717.md` |
| **U65** | zero-seed · sequential FE dedicated tab · no `pnpm seed:*` |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS** — Both folded defects closed on live `:8088`.

| Gate | Result |
|------|--------|
| **UF-HRM-10 / HRM-SC-03** create → POST 201 → FE row → F5 | **PASS** |
| Edit label → F5 + overview `hrmExtensionItems` / `effectiveItems` | **PASS** |
| **D-P1-HRM-PAY-STATUS-BADGE-01** payroll StatusBadge VI | **PASS** (`Đã xử lý`, not raw `processed`) |
| Header «Trạng thái» | **PASS** |
| Employee directory StatusBadge «Đang làm việc» | **PASS** |
| Optional AC-PROC processes honest read-only | **PASS** |
| Seed used | **No** |

---

## 1) UF-HRM-10 / HRM-SC-03 — Settings catalog item persist

### Click path (U65)

1. Session `ceo@xe.vn` already on portal `:8088` (JWT `sub=ceo@xe.vn`).
2. Portal → embed deep-link iframe `/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`.
3. Overview loaded: XBOS catalogs + prior DevOps smoke `DEVOPS1784258701` (`HRM +: 1 mục` on ACM).
4. FE form: Mã=`QAFE58861178` · Nhãn=`QA FE Persist QAFE58861178` · category `activity_capability_map` → **Thêm / cập nhật mục**.
5. Network: `POST /api/hrm/settings-catalogs/items` → **201** `HRM-SET-201` `upserted:1`.
6. FE after 2xx: row `QAFE58861178` · Nguồn **HRM** · `HRM +: 2 mục`.
7. **F5** iframe reload → row still present.
8. Edit same key → Nhãn=`QA FE EDIT LABEL 888038` → POST **201** → FE shows new label.
9. **F5** → label still `QA FE EDIT LABEL 888038`.
10. Bearer/`fetch` overview `GET /api/hrm/settings-catalogs?company_id=main` → **200** `HRM-SET-200`; ACM `hrmExtensionItems` + `effectiveItems` include `QAFE58861178` with edited label.

### Network excerpts (no secrets)

```text
POST /api/hrm/settings-catalogs/items
  body: {company_id:main, category_key:activity_capability_map,
         item_key:QAFE58861178, item_name:"QA FE Persist QAFE58861178"}
  → 201 HRM-SET-201 {upserted:1, item_key:QAFE58861178}

GET  /api/hrm/settings-catalogs?company_id=main  (after create + F5)
  → 200 HRM-SET-200
  activity_capability_map.hrmExtensionItems includes:
    DEVOPS1784258701, QAFE58861178
  effectiveItems includes QAFE58861178 origin=hrm

POST …/items (edit label)
  body: {… item_key:QAFE58861178, item_name:"QA FE EDIT LABEL 888038"}
  → 201 HRM-SET-201
GET overview after F5 → ext+eff label = "QA FE EDIT LABEL 888038"
```

### UC matrix

| UC | Action | Verdict |
|----|--------|---------|
| HRM-SC-01 | Overview GET + FE tables | **PASS** |
| HRM-SC-03 | Create + edit + F5 persist in overview/FE | **PASS** (closes prior FAIL) |

**Defect `D-HRM-SET-ITEM-PERSIST-01`:** **CLOSED** on browser U65.

---

## 2) D-P1-HRM-PAY-STATUS-BADGE-01 — Payroll StatusBadge

### Click path

1. `/command-center/hrm/payroll` → iframe `/hr/payroll?…companyId=main`.
2. List «Danh sách bảng lương» — 1834 records; column **Trạng thái**.
3. StatusBadge cells: class `status-badge` text **Đã xử lý** (many rows).
4. **No** raw English `processed` in visible cells.
5. Spot-check `/command-center/hrm/employees` → StatusBadge **Đang làm việc** / **Đã nghỉ việc** (not raw `active`).

| Check | Result |
|-------|--------|
| Payroll badge VI «Đã xử lý» | **PASS** |
| Header «Trạng thái» | **PASS** |
| Raw `processed` absent | **PASS** |
| Employees «Đang làm việc» | **PASS** |

**Defect `D-P1-HRM-PAY-STATUS-BADGE-01`:** **CLOSED** on browser U65.

---

## 3) Optional AC-PROC — Processes read-only

### Click path

1. `/command-center/hrm/processes` → iframe `/hr/processes?…`.
2. Copy: «chỉ xem — cấu hình mã quy trình trên XBOS».
3. Empty: «Chưa có quy trình nào» + «Thêm/sửa/xóa quy trình chưa hỗ trợ trên HRM…».
4. Buttons: only scope + tab **Quy trình** / **Quy định** — **no** Thêm/Sửa/Xóa; **no** fake success toast path exercised.

| Check | Result |
|-------|--------|
| No fake CRUD toast / mutate buttons | **PASS** |
| Honest empty / chưa hỗ trợ | **PASS** |

---

## Residual / not promoted

| Item | Notes |
|------|-------|
| Orphan pre-fix rows under `company_id=main` | Still may exist from prior FAIL wave; new writes persist under holding — not blocking UF-HRM-10 |
| Payroll other statuses (Nháp / Đã thanh toán) | Not present in current list sample (all «Đã xử lý»); VI mapping verified for `processed` |
| Full-menu wave DONE | Other UF 🔴 (e.g. UF-HRM-12) unchanged — out of this wave |

---

## Matrix update

`docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` **UF-HRM-10** → **🟢** (this evidence).

---

## Handoff

- **completion_report:** U65 browser retest on `:8088` HEAD `63915ed`. UF-HRM-10 create+edit+F5+overview PASS; payroll StatusBadge «Đã xử lý» PASS; employees «Đang làm việc» PASS; processes honest read-only PASS. No seed. Both defects CLOSED.
- **next_owner:** `pm` (optional `qc` if full-menu gate needs re-open after UF-HRM-10 🟢)
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/d-hrm-set-item-persist-01-qa-retest-20260717.md`

### next_dispatch_prompt

```text
work_item_id: D-HRM-SET-ITEM-PERSIST-01-QA + D-P1-HRM-PAY-STATUS-BADGE-01
to_role: pm
entry: QA PASS_TO_PM — docs/qa/evidence/d-hrm-set-item-persist-01-qa-retest-20260717.md; UF-HRM-10 matrix 🟢; pay badge + processes optional PASS.
action: Intake PASS; close D-HRM-SET-ITEM-PERSIST-01 + D-P1-HRM-PAY-STATUS-BADGE-01; if full-menu QC still GWC on settings P0 → re-dispatch qc to clear that condition; continue residual UF-HRM-12 / other 🔴 per backlog.
cấm: seed
```
