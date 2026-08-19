# PO — Ma trận quy trình × công ty × catalog (XeVN logistics)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-WF-CAT-COMPANY-MATRIX-01` |
| **Doc ID** | `PO-WF-CAT-COMPANY-MATRIX` |
| **Date** | 2026-08-03 |
| **Owner** | ba-data (governance) |
| **Program SoT** | `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §4–§5 |
| **Locks** | U65 (zero-seed UAT) · U84 · cấm invent UUID |
| **ack_status** | **PASS_TO_PM** (evidence companion) |

---

## 0. Mục đích

Ma trận **normative** cho QA/BA/Dev: gán **process_id** × **co_key** × **catalog_key**, scope publish/apply/pull, và trace API — không thay SRS/TechSpec, không claim UAT DONE.

**Dual-plane (must_keep):**

| Plane | `company_id` semantics | Nguồn |
|-------|------------------------|--------|
| **A — Org / XBOS legal** | `holding`, subsidiary `companyId` (`xe-tmdv`, `visun`, …) | `org-seed-member-companies.json` · publish @ `holding` |
| **B — HRM operating slug** | `holding`, `trsport`, `logistics`, `finance`, `services` | `scripts/lib/hrm-company-slug-map.mjs` · `employees.company_id` |
| **Portal JWT (group CEO embed)** | `tenantId=xevn`, `companyId=main` | `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` §3–§4 |

Group CEO catalog **publish/apply** dùng Plane A (`holding`); HRM **pull/list** map `main` → partition `holding` (J-XBOS-02). Member CEO dùng **tenant subsidiary** + `companyId=main`.

---

## 1. `co_key` ↔ tenant · slug · UUID · persona

| `co_key` | Tên (VI) | Org `companyId` (Plane A) | Member `tenantId` (JWT) | HRM op slug (Plane B) | `company_uuid` (attendance / scope map) | Persona pilot (web) | Ghi chú |
|----------|----------|---------------------------|-------------------------|----------------------|----------------------------------------|---------------------|---------|
| **CO-HOLD** | Tập đoàn XeVN | `holding` | `xevn` | `holding` | `10000000-0000-4000-8000-000000000001` | `ceo@xe.vn` / `Xevn@2026` | Publish SoT · CC embed `main`≠`holding` (scope matrix) |
| **CO-TMDV** | CP TM-DV X.E | `xe-tmdv` | `xe-tmdv` *(member tenant)* | `trsport` | `10000000-0000-4000-8000-000000000002` | *(group CEO apply target)* · spot member CEO TBD | Program op `trsport` — **không** dùng `xe-tmdv` làm HRM row slug |
| **CO-VISUN** | Du lịch Visun | `visun` | `visun` | `logistics` | `10000000-0000-4000-8000-000000000003` | — | HDV / điều hành tour |
| **CO-DL** | Du lịch X.E VN | `xe-du-lich` | `xe-du-lich` | `finance` | `10000000-0000-4000-8000-000000000004` | `du-lich.ceo@xe.vn` / `Xevn@2026` | Plane B slug `finance` = tên LE «Du lịch X.E Việt Nam» (BR-INT-05 bridge) |
| **CO-VN** | X.E Việt Nam | `xe-vietnam` | `xe-vietnam` | `services` | `10000000-0000-4000-8000-000000000005` | — | Văn phòng · HĐ/thử việc/điều chuyển |

**Refine vs program §4:** Giữ `co_key` và org `companyId` đúng program; bổ sung cột **HRM op slug** và **UUID** từ `hrm-company-slug-map.mjs` (không đổi ô Primary/Spot §5).

**Apply-to-members target shape (normative):**

```json
{ "tenantId": "<member tenantId>", "companyId": "main" }
```

Ví dụ CO-DL: `{ "tenantId": "xe-du-lich", "companyId": "main" }`. Nguồn: `ApplyCatalogMemberTargetDto` · `apply-catalog-to-members.dto.ts`.

---

## 2. `process_id` × `co_key` (Primary / Spot / —)

Legend (assignment): **Primary** = TC instance/approve ưu tiên matrix · **Spot** = coverage phụ · **Template** = định nghĩa @ CO-HOLD · **—** = không gán TC depth wave này.

Legend (`code_status` — SoT `PO_WF_CANDIDATE_CODE_LOCK.md` §3 · QA rules §6):

| `code_status` | Ý nghĩa | QA / TC |
|---------------|---------|---------|
| **AS-IS** | `workflowCode` đã có trong `workflow-catalog.constants.ts` | Create-def + instance + approve theo product code |
| **GOVERNANCE_LOCK** | Tên khóa governance (`LOCK_CODE`) — **chưa** trong constants | Create-def TC ghi `GOVERNANCE_LOCK`; **cấm** assert spawn như product |
| **SPEC_GAP** | Chưa khóa tên / OUT GĐ1 / P2 — **không** dùng draft name | TC **PLANNED/BLOCKED** + gap id |
| **AS-IS** + note behavior | Identity giữ AS-IS; hành vi graph/config còn gap | P-LEAVE: ladder L2/`T_L1` = SPEC_GAP_BEHAVIOR (không mã mới) |

| `process_id` | `code_status` | WF identity (normative) | CO-HOLD | CO-TMDV | CO-VISUN | CO-DL | CO-VN | Ghi chú |
|--------------|---------------|-------------------------|---------|---------|----------|-------|-------|---------|
| **P-REC-PLAN** | **AS-IS** | `hrm_recruitment_plan_approval` / `hrm_recruitment_plan` | Template publish | **Primary** | Secondary | — | Spot | Logistics hiring plan |
| **P-REC-REQ** | **AS-IS** | `hrm_requisition_approval` / `hrm_requisition` | Template | **Primary** (tài xế) | **Primary** (HDV) | Spot | Spot | 2 persona tuyển |
| **P-REC-PIPE** | **AS-IS** | `hrm_candidate_pipeline` / `hrm_candidate` | — | **Primary** | Spot | — | — | Offer/hire link |
| **P-LEAVE** | **AS-IS** *(+ SPEC_GAP_BEHAVIOR)* | `hrm_leave_approval` / `hrm_leave` *(keep — no new code)* | Template L1/L2 | Spot | Spot | **Primary L1→L2** | Spot | Ladder L2/`T_L1` HOLD · GAP-LEAVE-LADDER-01 |
| **P-ATT-ADJ** | **GOVERNANCE_LOCK** | `hrm_attendance_adjustment_approval` / `hrm_attendance_adjustment` | Template | **Primary** | Spot | Spot | — | HRM-only AS-IS; XBOS bridge chưa có — inbox XBOS = BLOCKED |
| **P-OT** | **SPEC_GAP** | — *(not locked; draft taxonomy only)* | Template | **Primary** | — | — | Spot | Sponsor/PM · expiry 2026-09-03 / CR GĐ1 · G-P2-OT-FULL |
| **P-CONTRACT** | **GOVERNANCE_LOCK** | `hrm_contract_approval` / `hrm_contract` | Template | Spot | — | — | **Primary** | P1 · HĐ văn phòng |
| **P-PROBATION** | **GOVERNANCE_LOCK** | `hrm_probation_approval` / `hrm_probation` | Template | Spot | Spot | — | **Primary** | P1 |
| **P-TRANSFER** | **GOVERNANCE_LOCK** | `hrm_transfer_approval` / `hrm_transfer` | Template | Spot | — | Spot | **Primary** | P1 · scope_parity multi-co khi bridge |
| **P-TRAIN** | **SPEC_GAP** | — *(draft `hrm_training_cert_approval` not locked)* | Template | **Primary** (GPLX) | Spot | — | — | L&D OUT GĐ1 · G-P2-LND · BR-PO-TRAIN-LGX-* giữ |
| **P-EXIT** | **GOVERNANCE_LOCK** | `hrm_exit_approval` / `hrm_exit` | Template | Spot | Spot | Spot | **Primary** | P1 · checklist IT = behavior riêng |
| **P-PAY-EX** | **SPEC_GAP** | — | Template | Spot | — | — | Spot | P2 · target ~2026-10-01 |
| **P-DISCIPLINE** | **SPEC_GAP** | — | Template | Spot | Spot | — | Spot | P2 · target ~2026-10-01 |
| **P-CAT-EXT** | **AS-IS** | `wf_hrm_catalog_extension_*` / `hrm_catalog_extension` | Approve gov | Apply pull | Apply pull | **Extension FE** | Apply pull | UF-15 · pattern `wf_hrm_catalog_extension_{member}` |

**Đếm `code_status` (align lock §3):** AS-IS = **5** (REC-PLAN/REQ/PIPE · LEAVE identity · CAT-EXT) · GOVERNANCE_LOCK = **5** (ATT-ADJ · CONTRACT · PROBATION · TRANSFER · EXIT) · SPEC_GAP = **4** (OT · TRAIN · DISCIPLINE · PAY-EX) · P-LEAVE behavior gap giữ nguyên.

**DOC-DELTA** (`PO-WF-CAT-COMPANY-MATRIX-LOCK-REFRESH-01` · 2026-08-03 · ba-data): ADD cột `code_status` + WF identity từ `PO_WF_CANDIDATE_CODE_LOCK.md`; **không** đổi Primary/Spot/`co_key`; **không** claim GOVERNANCE_LOCK đã có trong constants; supersede ghi chú pre-lock «CANDIDATE GAP / confirm code».

**QA enforce (từ lock §6):** Create-def chỉ **AS-IS** + **GOVERNANCE_LOCK**; **SPEC_GAP** → PLANNED/BLOCKED — cấm invent / assert spawn bằng draft name.

---

## 3. `catalog_key` × `co_key` — publish · apply · pull (field-level AC)

### 3.1 Key inventory (SoT)

| Tier | `catalog_key` (path param) | Storage / alias (`hrm-settings-master-keys`) | SRS / control |
|------|---------------------------|-----------------------------------------------|---------------|
| **P0 matrix** | `job_titles` | family `pos_titles`; alias `positions`, `employee_positions` | Program §5 · SRS §16.7 P0 |
| **P0** | `departments` | `departments` | SRS §16.7 · J-XBOS-CTRL-01 |
| **P0** | `leave_types` | `leave_types` | J-XBOS-CTRL-02 |
| **P0** | `recruitment_channels` | aliases `candidate_sources`, `channels` | SRS §16.7 P0 |
| **P0** | `job_grades` | aliases `grades` | SRS §16.7 P0 |
| **P0 (program)** | `contract_types` | `contract_types` | Program §5 · SRS **P1** (apply sau P0 gate) |
| **P0 (program label)** | `positions` | **Alias only** → pull as `job_titles` | Không publish riêng nếu trùng family |
| **P1** | `employment_types`, `pay_types`, `shifts`, `hr_decision_types` | per `CATALOG_FAMILIES` | SRS §16.7 P1 · DEC write key `hr_decision_types` |

### 3.2 Ma trận hành vi (rút gọn — full AC §3.3)

| `catalog_key` | CO-HOLD | CO-TMDV | CO-VISUN | CO-DL | CO-VN |
|---------------|---------|---------|----------|-------|-------|
| `job_titles` | **Publish** @ `xevn`/`holding` | **Apply** → pull @ `xe-tmdv`/`main` | Apply → pull | Apply → pull | Apply → pull |
| `departments` | Publish | Apply → pull | Apply → pull | Apply → pull | Apply → pull |
| `leave_types` | Publish | Apply → pull | Apply → pull | **Primary** pull (ladder TC) | Apply → pull |
| `contract_types` | Publish (P1) | Apply → pull | — | Spot | **Primary** consumer (HĐ) |
| `recruitment_channels` | Publish | **Primary** consumer | **Primary** consumer | Spot | Spot |
| `job_grades` | Publish | Apply → pull | Apply → pull | Apply → pull | Apply → pull |
| `positions` | — (use `job_titles`) | Pull alias only | Pull alias only | Pull alias only | Pull alias only |

**U65 AC (mọi ô Apply/Pull có instance):** HOLDING publish từ FE → apply ≥1 member → HRM Settings/sync → **F5** thấy item; **cấm** seed inbox/catalog để PASS.

### 3.3 Field-level acceptance (publish / apply / pull)

| Step | API | Body / query fields (required) | Success code | FE sau 2xx (SRS) |
|------|-----|----------------------------------|--------------|------------------|
| **Publish @ CO-HOLD** | `POST /api/xbos/config-sync/catalog/:catalogKey/publish` | `tenantId`, `companyId` (= `holding` or JWT `main`→holding), `name`, `domain`, `assignedTo[]` **includes `hrm`**, `items[]`: `{ code, label, status∈active\|draft }` | `XBOS-CFG-203` | CC/gov: version tăng; item hiển thị |
| **Publish alias (gov UI)** | `POST /api/xbos/catalog-governance/publish?catalogKey=` | Same `PublishCatalogDto` | `XBOS-CFG-203` | UF-XBOS-09 |
| **Apply to members** | `POST /api/xbos/config-sync/catalog/:catalogKey/apply-to-members` | Source `tenantId=xevn`, `companyId=holding`; `targets[]` **or** `memberCompanyIds[]` | `XBOS-CFG-204` | Member partition có bản copy; `appliedCount≥1` |
| **Apply negative** | same | Key **outside** phase allow-list | `XBOS-CFG-005` / **400** | Member L0 unchanged (J-XBOS-CTRL-03) |
| **HRM pull** | `POST /api/hrm/catalog-sync/pull/:catalogKey` | Headers/query: `tenantId`, `companyId` **match JWT**; group CEO `main` → catalog partition `holding` | `HRM-SYNC-200` | `synced_catalogs` snapshot updated |
| **HRM read snapshot** | `GET /api/hrm/catalog-sync/:catalogKey` | scope as pull | `HRM-SYNC-201` | Items[] non-empty after successful pull |
| **Settings consumer** | `GET /api/hrm/settings-catalogs/:catalogKey/items` | `company_id` aligned scope | 200 | Picker/list shows `label` not raw `code` (U72) |
| **Extension (P-CAT-EXT @ CO-DL)** | `POST /api/hrm/settings-catalogs/:catalogKey/extension-items` | member scope `xe-du-lich`/`main` | `HRM-SET-209` | UF-15 · gov batch/inbox FE-created |

**Item validation (publish):** `code` `^[A-Za-z0-9_:-]{2,64}$`; `label` non-empty; at least one `assignedTo=hrm`.

---

## 4. Trace — API paths (config-sync · catalog-sync · apply)

Prefix gateway: **`/api/xbos`** · **`/api/hrm`**.

| # | Method | Path | Role | Maps to matrix step |
|---|--------|------|------|---------------------|
| 1 | POST | `/api/xbos/config-sync/catalog/:catalogKey/publish` | XBOS internal / portal proxy | CO-HOLD publish |
| 2 | POST | `/api/xbos/config-sync/catalog/:catalogKey/apply-to-members` | XBOS | Fan-out → CO-TMDV…CO-VN |
| 3 | GET | `/api/xbos/config-sync/catalog/:catalogKey?target=hrm&tenantId&companyId` | XBOS / HRM consumer | Pre-pull read SoT |
| 4 | GET | `/api/xbos/config-sync/catalogs?target=hrm&tenantId&companyId` | QA L1 | Catalog inventory |
| 5 | POST | `/api/xbos/catalog-governance/publish?catalogKey=` | Portal catalog gov | UF-XBOS-09 alias → (1) |
| 6 | GET/POST | `/api/xbos/catalog-governance/inbox` · `tasks/:id/approve` | WF gov | P-CAT-EXT approve |
| 7 | POST | `/api/hrm/catalog-sync/pull/:catalogKey` | HRM | Member/group pull |
| 8 | GET | `/api/hrm/catalog-sync/status` | HRM | Sync health |
| 9 | GET | `/api/hrm/catalog-sync/:catalogKey` | HRM | Snapshot read |
| 10 | GET | `/api/hrm/catalog-sync` | HRM | List synced keys |
| 11 | POST | `/api/hrm/settings-catalogs/sync-from-xbos` | HRM Settings | Optional bulk sync UI |
| 12 | GET | `/api/hrm/settings-catalogs/:catalogKey/items` | HRM FE pickers | Post-pull consumer |

**Scope parity (U19):** List (10) và get-by-id (9) **cùng** `resolveHrmCatalogSyncScope` / `catalogCompanyId`; deep link Settings phải cùng partition với pull.

**Journey trace:**

| Journey | Matrix anchor |
|---------|----------------|
| J-XBOS-02 | Publish @ HOLD → pull @ HRM |
| J-XBOS-CTRL-01..03 | §3 `departments` / `leave_types` / CFG-005 |
| J-XBOS-08 | Inbox approve ↔ P-LEAVE / P-REC-* instances |
| UF-XBOS-09/15 | Catalog gov + extension (CO-DL) |

---

## 5. Validation matrix (data)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-WFCAT-01 | Publish without `hrm` in `assignedTo` | Business reject / no HRM pull |
| VAL-WFCAT-02 | Apply with empty `targets` and empty `memberCompanyIds` | 400 validation |
| VAL-WFCAT-03 | Pull with `company_id=xevn` (tenant as company) | **409** `SCOPE_CONTEXT_MISMATCH` |
| VAL-WFCAT-04 | Group CEO pull/list with JWT `main` | Effective catalog partition **holding** |
| VAL-WFCAT-05 | Member CEO pull @ own tenant + `main` | Snapshot scoped member tenant |
| VAL-WFCAT-06 | Apply P1 key before sponsor P1 gate | **400** `XBOS-CFG-005` (if enforced) |
| VAL-WFCAT-07 | Checksum / version drift on GET config-sync | **409** `XBOS-CFG-004` family |

---

## 6. Data risks & residual

| ID | Risk | Mitigation |
|----|------|------------|
| R-WFCAT-01 | Plane A subsidiary id ≠ Plane B slug | Luôn ghi cả hai cột §1; QA count employees by **op slug** |
| R-WFCAT-02 | `finance`/`services` tên LE dễ nhầm CO-DL/CO-VN | Dùng `co_key` + org `companyId` làm khóa testcase |
| R-WFCAT-03 | WF codes chưa product | Dùng §2 `code_status`: GOVERNANCE_LOCK = TC def only (không spawn product); SPEC_GAP = BLOCKED; AS-IS = product path — SoT `PO_WF_CANDIDATE_CODE_LOCK.md` |
| R-WFCAT-04 | Delta file `BA_ERP_XBOS_CTRL_SPEC_01` missing on disk | Normative allow-list retained via `docs/hrm/SRS.md` §16.7 + `PILOT_BUSINESS_FLOW_BA_TRACE.md` §22 |

---

## 7. Liên kết

- Program: `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md`
- Scope: `docs/qa/PILOT_SCOPE_DATA_MATRIX.md`
- Slug map: `scripts/lib/hrm-company-slug-map.mjs` · org seed: `apps/api/xbos-api/data/org-seed-member-companies.json`
- Slice: `docs/program/slices/DOC-ENT-P0-XBOS-CAT.md`
- Evidence: `docs/qa/evidence/po-wf-cat-company-matrix-01.md`
- Evidence (lock refresh): `docs/qa/evidence/po-wf-cat-company-matrix-lock-refresh-01.md`
- Code lock SoT: `docs/program/matrices/PO_WF_CANDIDATE_CODE_LOCK.md`

---

*PO-WF-CAT-COMPANY-MATRIX · PO-WF-CAT-COMPANY-MATRIX-01 · DOC-DELTA PO-WF-CAT-COMPANY-MATRIX-LOCK-REFRESH-01*
