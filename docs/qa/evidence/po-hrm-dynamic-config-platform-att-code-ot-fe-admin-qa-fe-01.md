# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 browser-only · zero-seed |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01` **READY_FOR_QA** |
| **Date** | 2026-08-09 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | `ATTADMINQAFE-MSKOO3JR` |
| **stamp_l1 RETAIN** | **`ATTCODEQA-MSK4T1A5`** · **`ATTOTQA-MSK8VETU`** · **`ATTCOMPQA-MSKARXQU`** |
| **U65** | zero-seed · browser FE click path · **no** `pnpm seed:*` · **no** API-only PASS |
| **Honesty** | `attendance_uat_ready=false` · `attendance_e2e_linkage_ready=false` · **LOCKED** · **`C-SLICE-≠-MODULE`** · **DENY** module ATT UAT claim |
| **condition** | **`R-PLT-ATT-FE-ADMIN-01` CLOSABLE** (Settings + ATT CFG Nest admin twin LIVE) |
| **must_keep** | L1 RETAIN · consumer EFF CLOSED (ATTCODEQAFE / ATTOTQAFE / ATTCOMPQAFE) · LVRULE HOLD · DENY dual-write |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** — 3/3 catalogs CRUD+F5 🟢 · CFG sidebar 🟢 · DENY dual-write/LVRULE 🟢 · honesty 🟢 |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| L0 `qc:fe-be-health` | **ALL PASS** (portal login · employees · catalog-sync · proxy) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01/` |
| FE parent | [`po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md`](po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md) §4 |

**Seed:** none · **API mutate for PASS:** none (all mutate via FE click) · LVRULE invent: **DENIED** · Settings MD dual-write: **DENIED**.

---

## 2. Click path (U65 · HDSD)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Settings** → tab **Mã chấm công ATT** | `settings-tab-att-attendance-codes` · panel `settings-att-attendance-codes` |
| 2 | Create → Edit → Retire → F5 | see UF-ATT-CODE-* below |
| 3 | **Settings** → tab **Loại OT ATT** | `settings-tab-att-ot-types` |
| 4 | Create → Edit → Retire → F5 | see UF-OT-TYPE-* |
| 5 | **Settings** → tab **Chi trả OT ATT** | `settings-tab-att-ot-comp-types` |
| 6 | Create → Edit → Retire → F5 | see UF-OT-COMP-* |
| 7 | **Chấm công** → **Thiết lập** → sidebar 3 mục | `att-cfg-*-precision` + nested panels PRESENT |

**HDSD inventory (U76):**

- Settings: `settings-tab-att-attendance-codes` · `att-ot-types` · `att-ot-comp-types`
- Panels: `settings-att-attendance-codes` · `settings-att-ot-types` · `settings-att-ot-comp-types`
- Fields: `hdsd-att-attendance-code-key|name|symbol|save|retire-{code}` · `hdsd-att-ot-type-key|name|coeff|save|retire-{code}` · `hdsd-att-ot-comp-type-key|name|save|retire-{code}`
- ATT CFG: `att-settings-shell-precision` · `att-cfg-attendance-codes-precision` · `att-cfg-ot-types-precision` · `att-cfg-ot-comp-types-precision`

---

## 3. UF browser blocks (per catalog)

### UF-ATT-CODE — Mã chấm công (`wfh_half_qa_mskoo3jr`)

| | |
|--|--|
| **Trước mutate** | row ABSENT |
| **Create** | fill key + nhãn + ký hiệu `W½` → **Tạo mã** |
| **Network create** | **PUT** `/api/hrm/attendance/attendance-codes` → **200** |
| **FE sau create** | row `settings-att-attendance-code-row-wfh_half_qa_mskoo3jr` **PRESENT** |
| **F5 sau create** | row còn |
| **Edit** | click row → đổi nhãn → **Cập nhật** |
| **Network edit** | **PUT** `/api/hrm/attendance/attendance-codes` → **200** |
| **FE sau edit** | nhãn EDIT hiện trên row |
| **Retire** | **Ngừng** → confirm |
| **Network retire** | **POST** `…/attendance-codes/{id}/retire?company_id=main` → **201** |
| **FE sau retire** | row ẩn khỏi list active |
| **F5 sau retire** | row vẫn ẩn |
| **Nest seal** | sealed path only · **PASS** |
| **Verdict** | 🟢 |

### UF-OT-TYPE — Loại OT (`ot_night_qa_mskoo3jr`)

| | |
|--|--|
| **Trước mutate** | row ABSENT |
| **Create** | key + nhãn + coeff `1.5` → **Tạo** |
| **Network create** | **PUT** `/api/hrm/attendance/ot-types` → **200** |
| **FE + F5 create** | row PRESENT · F5 còn |
| **Edit** | **PUT** `/ot-types` → **200** · FE nhãn EDIT |
| **Retire** | **POST** `…/ot-types/{id}/retire?company_id=main` → **201** · row ẩn · F5 ẩn |
| **Nest seal** | sealed path only · **PASS** |
| **Verdict** | 🟢 |

### UF-OT-COMP — Loại chi trả OT (`banked_hours_qa_mskoo3jr`)

| | |
|--|--|
| **Trước mutate** | row ABSENT |
| **Create** | key + nhãn → **Tạo** |
| **Network create** | **PUT** `/api/hrm/attendance/ot-comp-types` → **200** |
| **FE + F5 create** | row PRESENT · F5 còn |
| **Edit** | **PUT** `/ot-comp-types` → **200** · FE nhãn EDIT |
| **Retire** | **POST** `…/ot-comp-types/{id}/retire?company_id=main` → **201** · row ẩn · F5 ẩn |
| **Nest seal** | sealed path only · **PASS** |
| **Verdict** | 🟢 |

### UF-CFG-SIDEBAR — Attendance Thiết lập

| | |
|--|--|
| **Path** | `/hr/attendance` → tab **Thiết lập** (`role-exact`) |
| **Shell** | `att-settings-shell-precision` **PRESENT** |
| **Mã chấm công** | `att-cfg-attendance-codes-precision` + `settings-att-attendance-codes` |
| **Loại tăng ca** | `att-cfg-ot-types-precision` + `settings-att-ot-types` |
| **Loại chi trả OT** | `att-cfg-ot-comp-types-precision` + `settings-att-ot-comp-types` |
| **Verdict** | 🟢 |

---

## 4. Key network stamps

```text
PUT  /api/hrm/attendance/attendance-codes                         → 200  (create + edit)
POST /api/hrm/attendance/attendance-codes/{id}/retire?company_id=main → 201
PUT  /api/hrm/attendance/ot-types                                 → 200  (create + edit)
POST /api/hrm/attendance/ot-types/{id}/retire?company_id=main     → 201
PUT  /api/hrm/attendance/ot-comp-types                            → 200  (create + edit)
POST /api/hrm/attendance/ot-comp-types/{id}/retire?company_id=main → 201
```

**DENY observed:** `settings/catalogs` mutate count = **0** · leave-rule mutate count = **0**.

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`attendance_e2e_linkage_ready`** | **`false`** — **DENIED** flip |
| L1 ATT CODE / OT / COMP | **RETAIN** (`ATTCODEQA-MSK4T1A5` · `ATTOTQA-MSK8VETU` · `ATTCOMPQA-MSKARXQU`) |
| Consumer EFF FE CLOSED | **RETAIN** (no reopen ATTCODEQAFE / ATTOTQAFE / ATTCOMPQAFE) |
| LVRULE HOLD | **RETAIN** — **DENIED** invent |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |
| Dual-write Settings MD | **DENIED** |

---

## 6. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No residual P0/P1 this stamp | — |

**OBS:** First runner pass failed CFG only because tab label is **Thiết lập** (not «Cài đặt»); fixed in same session; final stamp **PASS**.

---

## 7. completion_report

**Closed:** U65 browser QA for ATT FE-ADMIN ABSENT twin — three Nest admin catalogs (attendance-codes · ot-types · ot-comp-types) create → edit → soft-retire → F5 persist on Settings tabs; ATT CFG sidebar mounts all three panels; Network 2xx on sealed Nest KEY paths only; dual-write / LVRULE DENY; honesty false · C-SLICE · L1 RETAIN · consumer EFF CLOSED. Stamp `ATTADMINQAFE-MSKOO3JR`. Condition `R-PLT-ATT-FE-ADMIN-01` **CLOSABLE**.

**Residual:** none P0/P1. Module ATT UAT **not** claimed.

**Forbidden claims:** module ATT UAT · Phase1 DONE · flip ready · invent LVRULE · dual-write · reopen consumer EFF CLOSED · reopen L1 stamps.

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01-browser.json` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QC-FE-01
from_role: pm
to_role: qc
lane: governance · narrow GWC
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-QA-FE-01 PASS_TO_PM stamp ATTADMINQAFE-MSKOO3JR
entry_criteria: QA evidence browser 3/3 catalogs CRUD+F5 PASS · CFG sidebar PASS · L1 ATTCODEQA-MSK4T1A5 · ATTOTQA-MSK8VETU · ATTCOMPQA-MSKARXQU RETAIN · U65 zero-seed
scope: audit UF create/edit/retire/F5 + Network 2xx Nest KEY only; seal R-PLT-ATT-FE-ADMIN-01 CLOSABLE; honesty false LOCKED; C-SLICE-≠-MODULE; DENY LVRULE / dual-write; DENY module ATT UAT claim
must_keep: L1 stamps · consumer EFF CLOSED · LVRULE HOLD
cấm: seed · flip ready · claim module ATT UAT
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qc-fe-01.md
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-qa-fe-01.md
```
