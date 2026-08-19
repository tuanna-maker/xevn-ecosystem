# HRM Master Data · Picker Gap Program

**Program ID:** `P-HRM-MD-PICKER-01`  
**Sponsor intake:** 2026-07-28 — screenshot «Thêm quá trình công tác» → **Vị trí** = free-text Input (không Select catalog)  
**Leads:** CURSOR-PM (chủ trì) + CLAUDE-PM (phó) — U74  
**Status:** `G0 ACTIVE` — sponsor 2026-07-28: **huy động tối đa sub-agent hai bên**; tổng hợp knowledge sau G0. **Cấm Dev `apps/**`** đến SYNTH + sponsor chốt E1.

---

## 1. Triệu chứng (sponsor)

- Form **Quá trình công tác** (`EmployeeWorkHistory`): **Phòng ban** = Select; **Vị trí** = Input free-text.
- Mong muốn: vị trí / chức danh khai báo ở **Cài đặt** (bộ gốc tập đoàn + extension từng công ty) → form consumer **chỉ Select/combo search**.
- Mở rộng: mọi field master-data tương tự phải Settings → Select (không free-text SoT).
- Sau HRM: đối chiếu **XBOS** có đủ control phân hệ chưa → gap report → nếu lệch thì pipeline SRS → TechSpec → DB_DESIGN → API_DESIGN → Dev → QA → QC.

---

## 2. Spec says / Code does (Cursor spot-check)

| | Spec | Code (as-of 2026-07-28) |
|--|------|-------------------------|
| Master data rule | `docs/hrm/SRS.md` §16.0 **BR-HRM-MD-01** + **AC-HRM-PICKER-01** — chức danh/vị trí = Settings CRUD; consumer = combo; **cấm free-text SoT** | `EmployeeWorkHistory.tsx` ~L990–994: `<Input value={formData.position} />` |
| Catalog SoT | `FR-HRM-SC-POS-01` · `DB_DESIGN_HRM_SETTINGS_CATALOG.md` (`job_titles` / `positions`) · XBOS publish → HRM pull + extension | Settings + `seed:hrm:tenant-position-catalog` tồn tại; **không bind** vào form work history |
| Group → company | `DANH_MUC_XBOS_CHO_HRM.md` STT 7–10 · XBOS-DM-HRM-07 copy thư viện chức danh | Pattern đúng spec; cần audit FE picker coverage |

**Verdict Cursor (preliminary):** Đây **không** phải thiếu ý tưởng nghiệp vụ — SRS đã khóa. Đây là **gap implement / orphan picker** (Settings có, consumer form lệch).

---

## 3. Phạm vi nghiên cứu (đề xuất)

### Wave G0 — Dual PM inventory (docs only · sau sponsor chốt)

| WI | Owner lead | Outcome |
|----|------------|---------|
| `BA-HRM-MD-PICKER-INVENTORY-01` | CURSOR ba-process | Inventory mọi FE field nên = Select (work history, JD, leave type, decision type, pay component, …) vs Input free-text |
| `BA-HRM-MD-CATALOG-TRACE-01` | CURSOR ba-data | Trace Settings keys ↔ DB ↔ API ↔ consumer bind; gap FK/key |
| `SA-XBOS-HRM-CONTROL-GAP-01` | CURSOR sa | XBOS catalog publish đủ chưa để control HRM (DANH_MUC + OpenAPI) |
| `PEER-HRM-MD-CLAUDE-AUDIT-01` | CLAUDE-PM | Phản biện 30yr + inventory độc lập + gap XBOS control (docs only) |
| `SYNTH-HRM-MD-PICKER-01` | CURSOR-PM | Gộp Cursor+Claude → báo cáo sponsor |

### Wave G1 — Spec delta (nếu inventory lệch SRS)

| WI | Outcome |
|----|---------|
| `BA-HRM-MD-SRS-DELTA-01` | ADD AC/Diễn biến nếu thiếu; không wipe |
| `SA-HRM-MD-TECHSPEC-01` | TechSpec `ref_srs` + picker contract |
| `BA-HRM-MD-DB-API-01` | DB_DESIGN + API_DESIGN (U71) trước mọi Dev |

### Wave E1 — Execution (sau G1 confirm)

| WI | Role |
|----|------|
| `D-FE-HRM-WH-POSITION-PICKER-01` | dev-fe — Work History Vị trí → Select từ `job_titles`/`positions` |
| `D-BE-HRM-WH-POSITION-KEY-01` | dev-be — lưu `position_key` / validate catalog (nếu schema còn free-text only) |
| `QA-HRM-MD-PICKER-01` | qa — UF browser: Settings có mã → form Select → Lưu → F5 |
| `QC-HRM-MD-PICKER-01` | qc — GO/GWC |

---

## 4. XBOS control checklist (preliminary)

| Capability | Spec pointer | Cursor note |
|------------|--------------|-------------|
| Group job-title library | DANH_MUC STT 7 | XBOS SoT |
| Copy to member company | XBOS-DM-HRM-07 | Cần confirm UI+API live |
| Per-company position overlay | STT 10 · HRM extension | Pattern OK |
| Publish → HRM pull | catalog-sync / settings-catalogs | Matrix có |
| Consumer picker bind | AC-HRM-PICKER-01 | **FAIL** work history Vị trí |

---

## 5. Locks

- U65 zero-seed · U71 DB+API trước Dev · U72 display label · U74 peer chốt · HOLD_DEPLOY  
- Cấm claim Phase1/PROD từ program này  
- Cấm Dev `apps/**` trước sponsor chốt plan

---

## 6. Evidence index (sẽ điền)

| Artifact | Path |
|----------|------|
| Program | this file |
| Peer propose | `docs/program/PEER_PM_COLLAB.md` §5 `PEER-HRM-MD-PICKER-01` |
| Synthesis (sau Claude) | `docs/program/HRM_MD_PICKER_PEER_SYNTHESIS.md` (TBD) |
