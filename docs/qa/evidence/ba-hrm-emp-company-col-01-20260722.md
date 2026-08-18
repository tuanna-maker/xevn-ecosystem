# BA-HRM-EMP-COMPANY-COL-01 — Cột «Thông tin công ty» (employees list)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-EMP-COMPANY-COL-01` |
| **date** | 2026-07-22 (ICT) |
| **from_role** | ba-process |
| **to_role** | pm → **dev-be** + **dev-fe** (parallel) → qa |
| **lane** | governance (RESEARCH / AC only — no `apps/**` edit) |
| **ack_status** | **PASS_TO_PM** |
| **environment** | Sponsor screenshot `:8088` · `/command-center/hrm/employees` |
| **HOLD_DEPLOY** | **CẤM deploy** brand/FE lên pilot cho đến khi sponsor cho phép rõ |

---

## 1. Symptom (sponsor)

| Item | Observation |
|------|-------------|
| URL | `/command-center/hrm/employees` |
| Cột | **Thông tin công ty** (`i18n` `company.title`) |
| Giá trị hiện | «Tập đoàn XeVN», «Khối Tài chính X.E», «Khối Logistics X.E», «Khối Dịch vụ X.E» (và tương tự «Khối Vận tải X.E») |
| Kỳ vọng sponsor | Khớp **danh sách công ty trong DB / ĐVTV** (pháp nhân thành viên), không phải nhãn «Khối … X.E» |

---

## 2. Spec says vs code does

### 2.1 Spec says (SoT đọc)

| Artifact | Assertion |
|----------|-----------|
| `docs/hrm/SRS.md` **UC-HRM-21** | Danh sách NV theo scope; map `employee_code`, `full_name`, `status`. **Không** định nghĩa rõ SoT nhãn cột công ty → **spec_gap** (bổ sung AC dưới). |
| `docs/hrm/SRS.md` **§15 / BR-INT-05** | Số **ĐVTV vận hành** trên XBOS (`group-member-units` + legal entities) **phải map 1:1** với slug `employees.company_id` trên master. |
| `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` §2 | SoT tổ chức cấp 1: **Công ty / pháp nhân thành viên** (không phải «khối» UI fiction). |
| `docs/program/governance/p1-prod-int-ba-d-01-20260607.md` | **Hai plane:** Plane **A** = legal entity / ĐVTV (`xbos_legal_entity.name`); Plane **B** = operating slug (`holding`…`services`). |
| BA-D-01 **§5** (interim chart) | Plane B từng lock nhãn **«Khối … X.E»** cho chart G-INT-02 — **không** đồng nghĩa cột UI mang tiêu đề «Thông tin công ty» được phép lệch ĐVTV. |
| BA-D-01 **VAL-INT-02-03** | Company **picker** = Plane A names; chart slug = Plane B map — củng cố: UI «công ty» = pháp nhân, không hardcode Khối. |
| `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` **BR-DQ-01a** | Group-by `employees.company_id` → label từ `company_slug_map.display_name` **sau khi SoT đúng**; **cấm** dùng `group-member-units.name` nhầm khi chưa bridge — nhưng **cũng cấm** nhãn fiction nếu đã có LE trong DB. |

**Kết luận nghiệp vụ (sponsor lock 2026-07-22):**  
Cột **«Thông tin công ty»** trên UC-HRM-21 / P-CC-03 / **J-HRM-02** = **tên công ty / pháp nhân (Plane A / ĐVTV / `legal_entities`)**, **không** phải nhãn operating-unit «Khối …» hardcode.

### 2.2 Code does (evidence grep + read)

| Layer | Behavior |
|-------|----------|
| FE `Employees.tsx` | Cột `key: 'company'`, header `t('company.title')` → `getCompanyName(emp.company_id)` |
| FE resolve | `resolveOperatingUnitDisplayName(companyId, operatingUnitLabelMap)` **trước** membership `company.name` |
| FE map | `operatingUnitLabelMap` từ `GET /api/hrm/operating-units` |
| BE `operating-units.service.ts` | Đọc `company_slug_map.display_name`; empty → fallback registry |
| BE `hrm-operating-unit-registry.ts` | **Hardcode** `Khối Vận tải/Logistics/Tài chính/Dịch vụ X.E` + seed vào `company_slug_map` qua `ensureSlugMapDisplayNames` |
| XBOS SoT ĐVTV | `org-seed-member-companies.json` / legal entities: «Công ty Cổ phần Thương mại và Dịch vụ X.E», «Công ty TNHH Du lịch Visun», «Công ty TNHH Du lịch X.E Việt Nam», «Công ty TNHH X.E Việt Nam», holding «Tập đoàn XeVN» |

**Mismatch:** UI cột công ty bind Plane B Khối registry; danh sách công ty sponsor nhìn trên CC/ĐVTV = Plane A legal names.

```text
spec:  cột «Thông tin công ty» = tên pháp nhân / ĐVTV (DB)
code:  cột = operating-unit display_name (Khối* hoặc seed Khối vào company_slug_map)
```

---

## 3. Dual-plane residual (không che bằng hardcode)

| Plane | Keys (pilot) | Display SoT đúng cho cột công ty |
|-------|--------------|----------------------------------|
| **A** ĐVTV / LE | `xe-tmdv`, `visun`, `xe-du-lich`, `xe-vietnam` + holding | `xbos_legal_entity.name` / `group-member-units.members[].name` |
| **B** workforce slug | `holding`, `trsport`, `logistics`, `finance`, `services` | Chỉ hợp lệ **sau** bridge slug→LE **và** `company_slug_map.display_name` = tên LE (không «Khối») |

**BR-INT-05 gap:** 4 ĐVTV ≠ 5 slug — Dev-BE phải có **bridge** (hoặc quyết định SA map 1:1) trước khi claim cột PASS toàn bộ. Không được giữ «Khối» làm nhãn cột công ty trong lúc chờ bridge.

---

## 4. Acceptance criteria (measurable)

### AC-EMP-COL-01 — SoT nhãn cột

| ID | Condition | Pass | Fail |
|----|-----------|------|------|
| **AC-EMP-COL-01** | Group CEO · `/command-center/hrm/employees` · cột «Thông tin công ty» | Mọi cell ∈ tập tên công ty/pháp nhân từ SoT ĐVTV / `legal_entities` (hoặc `company_slug_map.display_name` **đã sync** từ LE) | Cell chứa chuỗi `Khối … X.E` khi LE tương ứng đã có trong DB |
| **AC-EMP-COL-02** | Holding partition | «Tập đoàn XeVN» (khớp LE holding) | Nhãn khác / slug thô `holding` |
| **AC-EMP-COL-03** | API / FE resolve path | Tên resolve từ DB SoT (LE / slug_map synced); **cấm** dùng `HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES` làm nguồn hiển thị cột này | Hardcode registry là nhãn cuối cùng trên UI |
| **AC-EMP-COL-04** | Seed/upsert `company_slug_map` | Không ghi đè `display_name` đã đúng bằng «Khối …» | `ensureSlugMapDisplayNames` re-seed Khối lên tên LE |
| **AC-EMP-COL-05** | J-HRM-02 cross-nav | Click row → detail; scope parity `company_id=main` giữ | Regression 404/409 scope |
| **AC-EMP-COL-06** | F5 / navigate lại | Cùng tập nhãn LE; không flicker về Khối | F5 lại hiện Khối |
| **AC-EMP-COL-07** | Filter «operating unit» (nếu giữ) | Nếu UI vẫn gọi «khối/đơn vị vận hành» — **đổi copy** hoặc dùng **cùng** SoT tên công ty; **không** để cột «Thông tin công ty» và filter mâu thuẫn | Cột = LE, filter = Khối (lệch semantic) |

### Business rules (delta)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-EMP-COL-01** | Cột header = «Thông tin công ty» | Resolve Plane A / LE SoT | User thấy đúng ĐVTV |
| **BR-EMP-COL-02** | Thiếu bridge slug→LE | BE trả `company_display_name` null/`—` + telemetry; **không** fallback Khối hardcode | Fail-closed honest |
| **BR-EMP-COL-03** | Chart G-INT-02 vẫn group theo slug | Dùng **cùng** SoT tên công ty sau sync (không hai bộ nhãn) | VAL-INT-02-01 vẫn PASS |
| **BR-EMP-COL-04** | HOLD_DEPLOY | Không deploy FE/brand pilot cho đến sponsor OK | Evidence QA ghi lock |

### Out of scope (this AC)

- Remaster theme/brand FE toàn portal.
- Đổi partition model `employees.company_id` (slug → UUID) — chỉ nếu SA ticket riêng.
- Seed UAT để «có data» (U65).

---

## 5. Recommended fix package (handoff Dev)

### Option evaluation (BA)

| Option | Summary | Risk | Recommend |
|--------|---------|------|-----------|
| **A** | BE: bridge slug→`legal_entity.name`; sync `company_slug_map.display_name`; stop Khối defaults for display; FE: keep resolve via operating-units API **sau khi** DB đúng | Cần bridge 4↔5 | **YES** (default) |
| **B** | FE only: join `group-member-units` trực tiếp trên list | Mis-join nếu không bridge (lịch sử `Khác`) | No — vi phạm G-INT-02 |
| **C** | Đổi header → «Khối vận hành» giữ Khối | Mâu thuẫn sponsor + DANH_MUC | **REJECT** |

**Recommended: A** — SoT DB; FE/API không hardcode Khối cho cột công ty.

### Dev-BE (`D-HRM-EMP-COMPANY-COL-BE-01`)

1. Ngừng dùng `HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES` «Khối*» làm display SoT cho cột công ty / `company_slug_map` khi LE có sẵn.
2. Populate / sync `display_name` từ legal entity / ĐVTV bridge (SA xác nhận map slug↔tenant nếu chưa có).
3. Optional: enrich `GET /employees` với `company_display_name` từ SoT (ổn định FE).
4. Jest: registry fallback không được xuất hiện khi map đã có LE name; không re-seed Khối đè LE.
5. Evidence: `docs/qa/evidence/be-hrm-emp-company-col-01-20260722.md`

### Dev-FE (`D-HRM-EMP-COMPANY-COL-FE-01`)

1. Cột «Thông tin công ty»: bind `company_display_name` (nếu BE) hoặc label map **đã LE** — không fallback copy Khối local.
2. Filter banner: align copy/SoT với AC-EMP-COL-07.
3. Vitest resolve: FAIL nếu resolve ra `Khối Logistics X.E` khi map LE cung cấp.
4. **HOLD_DEPLOY** — không push pilot.
5. Evidence: `docs/qa/evidence/fe-hrm-emp-company-col-01-20260722.md`

### QA (`QA-HRM-EMP-COMPANY-COL-01`)

- U65 browser-only · `ceo@xe.vn` · `:8088` (hoặc local tương đương khi sponsor chưa mở deploy).
- UF: login → HRM → Nhân sự → assert cột vs ĐVTV list / Network LE.
- J-HRM-02 regression + F5.
- Evidence: `docs/qa/evidence/qa-hrm-emp-company-col-01-YYYYMMDD.md`

---

## 6. Journey / matrix pointers

| ID | Note |
|----|------|
| **J-HRM-02** | List→detail; bổ sung assert cột công ty = LE SoT |
| **P-CC-03** | `/command-center/hrm/employees` |
| **UC-HRM-21** | AC delta cột công ty (file này) |
| **UF** | Matrix employees list — Dev8088 🟡 until AC-EMP-COL-* PASS |

`docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` — append pointer row (same day).

---

## 7. Handoff contract

```yaml
work_item_id: BA-HRM-EMP-COMPANY-COL-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md
completion_report: |
  Closed: RESEARCH + AC for employee list company column mismatch (Khối vs ĐVTV/LE).
  Spec says company/legal-entity SoT; code does operating-unit Khối registry + seed.
  Residual: BR-INT-05 4 ĐVTV ≠ 5 slug bridge; HOLD_DEPLOY pilot FE/brand.
next_owner: pm
HOLD_DEPLOY: true  # cấm deploy brand/FE pilot đến khi sponsor cho phép
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-EMP-COMPANY-COL-BE-01 + D-HRM-EMP-COMPANY-COL-FE-01 (parallel U69)
parent: BA-HRM-EMP-COMPANY-COL-01
spec_ref: docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md · docs/hrm/SRS.md UC-HRM-21 · §15 BR-INT-05 · BA-D-01 Plane A/B · DANH_MUC_XBOS_CHO_HRM §2
entry_criteria: BA PASS_TO_PM; HOLD_DEPLOY=true (cấm deploy pilot FE/brand)
exit_criteria:
  - Cột «Thông tin công ty» trên /command-center/hrm/employees = tên pháp nhân/ĐVTV từ DB SoT
  - 0 hardcode «Khối … X.E» làm nhãn cuối cho cột này
  - AC-EMP-COL-01..07; jest BE+FE; J-HRM-02 không regression
  - evidence be-hrm-emp-company-col-01-* + fe-hrm-emp-company-col-01-*
cấm: seed U65; deploy pilot; Option C đổi header để giữ Khối
after READY_FOR_QA: Task qa QA-HRM-EMP-COMPANY-COL-01 (U65 browser, assert cột vs ĐVTV)
```

---

## 8. Open risks

| Risk | Owner | Mitigation |
|------|-------|------------|
| 4 LE ≠ 5 slug — không map được 1 slug | SA + BE | Bridge table + sponsor confirm segment↔công ty; null/`—` fail-closed |
| Chart + filter vẫn Khối sau fix cột | FE | AC-EMP-COL-07 cùng wave |
| Re-seed `ensureSlugMapDisplayNames` đè LE | BE | COALESCE chỉ khi empty **và** default không còn Khối; hoặc sync từ XBOS only |
