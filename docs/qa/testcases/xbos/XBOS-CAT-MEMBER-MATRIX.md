# Menu TC Pack — `XBOS-CAT-MEMBER-MATRIX` · Catalog publish @ HOLD → apply-to-members × `co_key` → HRM pull/F5

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-CATALOG-APPLY` · consumer `HRM-SETTINGS-CATALOGS` |
| **pack_id** | `XBOS-CAT-MEMBER-MATRIX` |
| **surface** | `xbos-cc` + `hrm-web` embed |
| **route(s)** | `/command-center?settings=hrm_catalog_apply_members` · catalog gov publish (UF-09 alias) · `/command-center/hrm/settings` tab **Danh mục** · `/hr/settings-catalogs` |
| **HDSD** | CC **Cài đặt → Áp dụng danh mục HRM** · CC catalog governance **Phê duyệt / Publish** · HRM **Cài đặt → Danh mục → Đồng bộ từ XBOS** · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` UF-XBOS-09/15 · UF-HRM-10 |
| **SRS / FR / UC** | UC-XBOS-09/15 · **FR-XBOS-CTRL-01..03** · SRS HRM **§16.7** P0 allow-list · UC-HRM-06..08 |
| **TechSpec / Matrix SoT** | `docs/program/matrices/PO_WF_CATALOG_COMPANY_MATRIX.md` **§1 · §3 · §3.3 · §4** · `PO_WF_PROCESS_TAXONOMY.md` **P-CAT-EXT** · `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §5–§7 |
| **API_CONTRACT** | `POST …/config-sync/catalog/:catalogKey/publish` → `XBOS-CFG-203` · `POST …/apply-to-members` → `XBOS-CFG-204` · `POST …/hrm/catalog-sync/pull/:key` → `HRM-SYNC-200` · `GET …/catalog-sync/:key` → `HRM-SYNC-201` · `POST …/settings-catalogs/sync-from-xbos` |
| **UF / J-*** | **UF-XBOS-09** · **UF-XBOS-15** · **UF-HRM-10** · **J-XBOS-02** · **J-XBOS-CTRL-01..03** |
| **author** | qa · `PO-ECO-TC-XBOS-CAT-MEMBER-01` |
| **work_item_id** | `PO-ECO-TC-XBOS-CAT-MEMBER-01` |
| **date** | 2026-08-03 |
| **ack_status** | **SYNTHED** · `PO-ECO-TC-SYNTH-WF-CAT-01` |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix (process_id×co_key×catalog_key) ☑ · Trace ☑ |
| **Locks** | **U65** zero-seed · design TC **PLANNED** · **uat_done=false** · **cấm** apps/** · **cấm** invent UUID |

> IEEE 829 / ISO 29119 lean · Inventory từ `ApplyCatalogToMembersPanel` · `configSyncApplyMembers.ts` · company matrix §3.3 field AC · **không** copy chrome từ `XBOS-CATALOG-CC` / `XBOS-INBOX-CAT` (XREF only).

**Supersedes path:** prior draft `XBOS-CATALOG-MEMBER-MATRIX.md` → stub pointer to this file.

---

## 0. Spec read ack & dual-plane

| Source | Path | Sections |
|--------|------|----------|
| Company matrix | `PO_WF_CATALOG_COMPANY_MATRIX.md` | §1 dual-plane · §3.1–§3.3 · §4 API · VAL-WFCAT-* |
| Taxonomy | `PO_WF_PROCESS_TAXONOMY.md` | **P-CAT-EXT** AS-IS `wf_hrm_catalog_extension_*` |
| Program | `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` | §5–§7 DoD catalog keys |
| SRS allow-list | `docs/hrm/SRS.md` §16.7 | P0: `job_titles` · `departments` · `leave_types` · `recruitment_channels` · `job_grades` |
| WF process pack (merge) | `XBOS-WF-PROCESS-MATRIX.md` | **TC-WFM-CAT-*** · P-CAT-EXT |
| Inbox / gov XREF | `XBOS-INBOX-CAT.md` | **TC-XIC-CG-*** · **TC-XIC-EXT-*** — **không** re-author |
| CC master OOS | `XBOS-CATALOG-CC.md` | UF-14 document/measure/price — **OOS** |

### 0.1 Dual-plane (`co_key`) — must_keep

| `co_key` | Org `companyId` (Plane A · publish/apply) | Member JWT `tenantId` | HRM op slug (Plane B) | Apply target body |
|----------|-------------------------------------------|----------------------|----------------------|-------------------|
| **CO-HOLD** | `holding` (JWT portal `main` → partition holding) | `xevn` | `holding` | SoT publish source |
| **CO-TMDV** | `xe-tmdv` | `xe-tmdv` | `trsport` | `{ "tenantId":"xe-tmdv", "companyId":"main" }` |
| **CO-VISUN** | `visun` | `visun` | `logistics` | `{ "tenantId":"visun", "companyId":"main" }` |
| **CO-DL** | `xe-du-lich` | `xe-du-lich` | `finance` | `{ "tenantId":"xe-du-lich", "companyId":"main" }` |
| **CO-VN** | `xe-vietnam` | `xe-vietnam` | `services` | `{ "tenantId":"xe-vietnam", "companyId":"main" }` |

**QA rule:** Employee/count asserts use **Plane B slug**; apply POST uses **Plane A tenantId + `companyId=main`**. Never use `xe-tmdv` as HRM row slug.

### 0.2 P0 `catalog_key` inventory (SRS §16.7 + matrix §3.1)

| Tier | `catalog_key` | UI label (VI) | Alias / notes |
|------|---------------|---------------|---------------|
| **P0** | `job_titles` | Chức danh | Alias `positions`, `employee_positions` — **XREF only**, no separate SoT publish |
| **P0** | `departments` | Phòng ban | J-XBOS-CTRL-01 |
| **P0** | `leave_types` | Loại nghỉ phép | J-XBOS-CTRL-02 · CO-DL primary pull |
| **P0** | `recruitment_channels` | Nguồn ứng viên | Alias `candidate_sources`, `channels` · Primary consumer CO-TMDV/VISUN |
| **P0** | `job_grades` | Ngạch bậc chức danh | Alias `grades` |
| **P1 / GWC** | `contract_types` | Loại hợp đồng | Program label P0 · SRS **P1** — VAL-WFCAT-06 · spot only |
| **Alias** | `positions` | *(no publish)* | Pull/resolve → `job_titles` |

**Boundary:** Pack = **publish @ CO-HOLD → apply ≥1 member → HRM pull/F5** for P0 keys. Gov inbox approve + extension FE = **XREF** (`TC-XIC-*` / `TC-WFM-CAT-*`). CC autosave doc/measure/price = **OOS** (`XBOS-CATALOG-CC`).

---

## 1. Screen inventory

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **SCR-CAT-PUB** | settings / gov | Catalog governance publish / config-sync publish FE | Publish SoT @ CO-HOLD (`PublishCatalogDto`) | loading · validation · success version↑ |
| **SCR-APPLY-SHELL** | settings tab | `?settings=hrm_catalog_apply_members` | Khung Cài đặt CC | scope bar · menuNotice |
| **SCR-APPLY-PANEL** | page | `ApplyCatalogToMembersPanel` · `data-testid=apply-catalog-to-members-panel` | Allow-list + ĐVTV + nguồn tập đoàn | loading members/source · empty · result |
| **POP-APPLY-CONFIRM** | confirm | **Áp dụng cho n ĐVTV** | «Áp dụng danh mục sang ĐVTV» | cancel · confirm **Áp dụng** |
| **SCR-HRM-CAT-TAB** | tab | HRM `/settings` · `value=catalogs` | `SettingsCatalogsTab` | loadError · empty · rows |
| **SCR-HRM-CAT-PAGE** | page | `/hr/settings-catalogs` | Deep link | idem tab |
| **SCR-HRM-MD-BUCKET** | section | Metadata bucket post-sync | Picker/list by key | empty CTA → sync |
| **SCR-EXT-MEMBER** *(XREF)* | dialog | UF-15 CO-DL | Extension FE — **TC-XIC-EXT-*** | — |

**Đếm:** pages/tabs=5 · confirms=1 · shell=1 · XREF surface=1

---

## 2. Field dictionary (matrix §3.3)

### 2.1 Publish @ CO-HOLD (`PublishCatalogDto`)

| field_id | UI / wire | required | Validation | API |
|----------|-----------|----------|------------|-----|
| F-PUB-TENANT | `tenantId` | Y | Group = `xevn` | body |
| F-PUB-CO | `companyId` | Y | `holding` or JWT `main`→holding | body |
| F-PUB-NAME | `name` | Y | non-empty | body |
| F-PUB-DOMAIN | `domain` | Y | catalog domain | body |
| F-PUB-ASSIGN | `assignedTo[]` | Y | **includes `hrm`** — VAL-WFCAT-01 | body |
| F-PUB-ITEM-CODE | `items[].code` | Y | `^[A-Za-z0-9_:-]{2,64}$` | body |
| F-PUB-ITEM-LABEL | `items[].label` | Y | non-empty · display VI | body |
| F-PUB-ITEM-STATUS | `items[].status` | Y | `active` \| `draft` | body |

### 2.2 Apply panel

| field_id | UI label (VI) | control | required | API / wire |
|----------|---------------|---------|----------|------------|
| F-APPLY-KEY | Danh mục nguồn | select `#apply-catalog-key` | Y | path `:catalogKey` · U72 VI label only |
| F-APPLY-LOAD-SRC | Tải lại nguồn tập đoàn | button | — | GET `config-sync/catalog/{key}?target=hrm` |
| F-APPLY-SRC-SUM | Tóm tắt nguồn | text | — | UI **tập đoàn** (not raw `holding`) · version · checksum |
| F-APPLY-MEM-ROW | ĐVTV checkbox | `apply-member-{id}` | Y (≥1) | `targets[]` `{tenantId, companyId:main}` |
| F-APPLY-SUBMIT | Áp dụng cho n ĐVTV | MutationButton | Y | POST apply-to-members |
| F-APPLY-RESULT | Kết quả | status | — | `appliedCount≥1` · `XBOS-CFG-204` |

### 2.3 HRM pull / consumer

| field_id | UI label | API |
|----------|----------|-----|
| F-HRM-SYNC-BTN | Đồng bộ từ XBOS | POST `settings-catalogs/sync-from-xbos` |
| F-HRM-PULL | Pull key | POST `catalog-sync/pull/:catalogKey` |
| F-HRM-SNAP | Snapshot items | GET `catalog-sync/:catalogKey` → `HRM-SYNC-201` |
| F-HRM-ITEM-LABEL | Nhãn mục | GET settings-catalogs items — **cấm** raw key (U72) |
| F-HRM-SYNC-STAMP | Đồng bộ lúc | **dd/MM/yyyy HH:mm** |

**Đếm fields:** **18** (publish 8 + apply 6 + HRM 4)

---

## 3. Function inventory

| fn_id | UI | screen_id | API | success FE+F5 | fail | hdsd_align |
|-------|-----|-----------|-----|---------------|------|------------|
| FN-PUB-HOLD | Publish / Lưu SoT @ tập đoàn | SCR-CAT-PUB | POST `…/publish` or gov `…/catalog-governance/publish?catalogKey=` | `XBOS-CFG-203`; version↑; item label visible | VAL-WFCAT-01 · 409 scope | CC catalog gov / platform publish path |
| FN-PUB-READ | Tải nguồn tập đoàn | SCR-APPLY-PANEL | GET config-sync | Summary tập đoàn + version | 404 `XBOS-CFG-001` | **Tải lại nguồn tập đoàn** |
| FN-APPLY-SELECT | Chọn ĐVTV | SCR-APPLY-PANEL | — | `selectedIds≥1` | empty candidates | checkbox ĐVTV |
| FN-APPLY-EXEC | Áp dụng | SCR-APPLY-PANEL | POST apply-to-members | toast · `appliedCount` · F5 | VAL-WFCAT-02 · CFG-005 | **Áp dụng** confirm |
| FN-HRM-SYNC | Đồng bộ từ XBOS | SCR-HRM-CAT-TAB | POST sync-from-xbos | stamp · counts · F5 | VAL-WFCAT-03 | UF-HRM-10 |
| FN-HRM-PULL | Pull một key | SCR-HRM-MD-BUCKET | POST pull/:key | GET snapshot non-empty · F5 | sync errors | J-XBOS-02 |
| FN-HRM-VERIFY | Quan sát label | SCR-HRM-* | GET items | Label VI = published | empty after 2xx = FAIL | U72 |
| FN-AU-MEMBER | Member blocked | SCR-APPLY-PANEL | — | 403/409 · no holding publish | — | VAL-WFCAT-05 invert |
| FN-EXT-XREF | Extension CO-DL | *(INBOX)* | extension-items | — | — | **XREF** TC-XIC-EXT / TC-WFM-CAT |

**Đếm functions:** **9**

---

## 4. Behavior matrix (catalog_key × co_key)

| `catalog_key` | CO-HOLD | Preferred apply `co_key` (≥1; DoD ≥2 where noted) | HRM pull verify | `process_id` note |
|---------------|---------|-----------------------------------------------------|-----------------|-------------------|
| `job_titles` | **Publish** | **CO-TMDV** + **CO-VISUN** | Group `main`→holding + member spot | consume P-REC-* |
| `departments` | Publish | CO-TMDV + CO-DL | picker/list | — |
| `leave_types` | Publish | **CO-DL** (primary) + CO-VISUN | leave pickers | P-LEAVE consume |
| `recruitment_channels` | Publish | **CO-TMDV** + **CO-VISUN** | recruitment FE | P-REC-* |
| `job_grades` | Publish | CO-TMDV + CO-VN | grade picker | — |
| `positions` | — | — | alias → `job_titles` | XREF only |
| *(extension)* | Approve gov | **CO-DL** FE extension | after UF-09 | **P-CAT-EXT** |

---

## 5. Test case matrix

### Quy ước

- **TC-ID:** `TC-XCM-<AREA>-<type>-<nnn>` · Types: **HP** · **FD** · **BD** · **AU** · **UX** · **XREF** · **ALIAS**
- **Required columns:** `process_id` · `co_key` · `catalog_key` · `hdsd_align` · Type
- **U65 global precond:** No seed; FE-origin items only; empty SoT = **BLOCKED** not 🟢
- **Status:** all **PLANNED** · `uat_done=false`

### 5.1 Publish @ CO-HOLD — ≥1 HP + Lưu per P0 key family

| TC-ID | Type | process_id | co_key | catalog_key | hdsd_align | Persona | Steps (HDSD) | Expected | Status |
|-------|------|------------|--------|-------------|------------|---------|--------------|----------|--------|
| TC-XCM-PUB-JT-HP-001 | HP | — | CO-HOLD | `job_titles` | CC catalog publish / Lưu SoT | ceo@xe.vn | Login Group CEO → open publish FE (gov alias or config-sync path) → set F-PUB-* · `assignedTo` incl. **hrm** · ≥1 item code/label/status → **Lưu/Publish** → F5 | POST **2xx** `XBOS-CFG-203`; GET holding snapshot has item **label**; version↑ | PLANNED |
| TC-XCM-PUB-DE-HP-001 | HP | — | CO-HOLD | `departments` | same | ceo@xe.vn | Publish **Phòng ban** item @ holding → Lưu → F5 | `XBOS-CFG-203`; dept item in SoT | PLANNED |
| TC-XCM-PUB-LV-HP-001 | HP | — | CO-HOLD | `leave_types` | same | ceo@xe.vn | Publish **Loại nghỉ phép** → Lưu → F5 | `XBOS-CFG-203`; leave type in SoT | PLANNED |
| TC-XCM-PUB-RC-HP-001 | HP | — | CO-HOLD | `recruitment_channels` | same | ceo@xe.vn | Publish **Nguồn ứng viên** → Lưu → F5 | `XBOS-CFG-203`; channel in SoT | PLANNED |
| TC-XCM-PUB-JG-HP-001 | HP | — | CO-HOLD | `job_grades` | same | ceo@xe.vn | Publish **Ngạch bậc** → Lưu → F5 | `XBOS-CFG-203`; grade in SoT | PLANNED |
| TC-XCM-PUB-FD-001 | FD | — | CO-HOLD | `job_titles` | publish validation | ceo@xe.vn | Publish **without** `hrm` in `assignedTo` (VAL-WFCAT-01) | Business reject; HRM pull unchanged | PLANNED |
| TC-XCM-PUB-FD-002 | FD | — | CO-HOLD | `job_titles` | item code BR | ceo@xe.vn | `code` invalid (<2 chars / bad charset) → Lưu | 400 validation; no version bump | PLANNED |
| TC-XCM-PUB-AU-001 | AU | — | CO-DL | `job_titles` | member cannot publish holding | du-lich.ceo@xe.vn | Attempt holding publish | **409** / UI blocked | PLANNED |

### 5.2 Apply-to-members — panel + multi-`co_key`

| TC-ID | Type | process_id | co_key | catalog_key | hdsd_align | Persona | Steps | Expected | Status |
|-------|------|------------|--------|-------------|------------|---------|-------|----------|--------|
| TC-XCM-AP-HP-001 | HP | — | CO-HOLD | *(shell)* | **Áp dụng danh mục HRM** | ceo@xe.vn | CC → Cài đặt → **Áp dụng danh mục HRM** | Panel `apply-catalog-to-members-panel`; dropdown VI labels only | PLANNED |
| TC-XCM-AP-HP-002 | HP | — | CO-HOLD | `job_titles` | **Tải lại nguồn tập đoàn** | ceo@xe.vn | Select **Chức danh** → Tải lại nguồn | GET **200**; summary **tập đoàn** + version/checksum | PLANNED |
| TC-XCM-AP-HP-003 | HP | — | CO-TMDV+CO-VISUN | `job_titles` | **Áp dụng** confirm | ceo@xe.vn | After PUB-JT + load → check **CO-TMDV** + **CO-VISUN** → Áp dụng → confirm | POST **201** `XBOS-CFG-204`; `appliedCount≥2`; F5 result | PLANNED |
| TC-XCM-AP-DE-HP-001 | HP | — | CO-TMDV+CO-DL | `departments` | Áp dụng | ceo@xe.vn | Apply **Phòng ban** → ≥2 members → confirm → F5 | `XBOS-CFG-204`; appliedCount≥1 | PLANNED |
| TC-XCM-AP-LV-HP-001 | HP | — | CO-DL+CO-VISUN | `leave_types` | Áp dụng | ceo@xe.vn | Apply **Loại nghỉ phép** (CO-DL primary) | `XBOS-CFG-204` | PLANNED |
| TC-XCM-AP-RC-HP-001 | HP | — | CO-TMDV+CO-VISUN | `recruitment_channels` | Áp dụng | ceo@xe.vn | Apply **Nguồn ứng viên** | `XBOS-CFG-204` | PLANNED |
| TC-XCM-AP-JG-HP-001 | HP | — | CO-TMDV+CO-VN | `job_grades` | Áp dụng | ceo@xe.vn | Apply **Ngạch bậc** | `XBOS-CFG-204` | PLANNED |
| TC-XCM-AP-FD-001 | FD | — | — | `job_titles` | empty apply | ceo@xe.vn | Apply with **no** members selected / empty `targets`+`memberCompanyIds` | UI block or **400** VAL-WFCAT-02; **no** fan-out | PLANNED |
| TC-XCM-AP-FD-002 | FD | — | CO-TMDV | *(tamper P2 key)* | allow-list | ceo@xe.vn | Force key outside phase allow-list | **400** `XBOS-CFG-005` · J-XBOS-CTRL-03 · member L0 unchanged | PLANNED |
| TC-XCM-AP-FD-003 | FD | — | CO-HOLD | `job_titles` | wrong scope / no source | ceo@xe.vn | Áp dụng khi chưa tải nguồn | UI «Chưa tải được catalog nguồn…»; no POST | PLANNED |
| TC-XCM-AP-BD-001 | BD | — | CO-TMDV | `job_titles` | single member | ceo@xe.vn | Select **1** ĐVTV only | POST may 201; matrix DoD notes `appliedCount=1` vs ≥2 preference | PLANNED |
| TC-XCM-AP-UX-001 | UX | — | CO-HOLD | *(all)* | U72 | ceo@xe.vn | Inspect dropdown + confirm | **Không** raw `(job_titles)` in UI | PLANNED |

### 5.3 HRM pull / F5 AC (post-apply)

| TC-ID | Type | process_id | co_key | catalog_key | hdsd_align | Persona | Steps | Expected | Status |
|-------|------|------------|--------|-------------|------------|---------|-------|----------|--------|
| TC-XCM-HRM-JT-HP-001 | HP | — | CO-HOLD *(main→holding)* | `job_titles` | **Đồng bộ từ XBOS** + F5 | ceo@xe.vn | After AP-HP-003 → HRM Settings **Danh mục** → **Đồng bộ từ XBOS** → F5 → open Chức danh bucket | POST sync/pull **2xx** `HRM-SYNC-200`; GET snapshot **HRM-SYNC-201** items non-empty; label VI; stamp dd/MM/yyyy HH:mm | PLANNED |
| TC-XCM-HRM-DE-HP-001 | HP | — | CO-TMDV *(spot)* / group | `departments` | Đồng bộ + F5 | ceo@xe.vn | After AP-DE → sync → F5 | Dept row/picker shows applied **label** | PLANNED |
| TC-XCM-HRM-LV-HP-001 | HP | — | **CO-DL** | `leave_types` | Đồng bộ + F5 | ceo@xe.vn *or* member scope | After AP-LV → sync @ CO-DL partition → F5 | Leave type visible; VAL-WFCAT-05 if member CEO | PLANNED |
| TC-XCM-HRM-RC-HP-001 | HP | — | CO-TMDV | `recruitment_channels` | Đồng bộ + F5 | ceo@xe.vn | After AP-RC → sync → F5 | Channel in recruitment consumer | PLANNED |
| TC-XCM-HRM-JG-HP-001 | HP | — | CO-VN | `job_grades` | Đồng bộ + F5 | ceo@xe.vn | After AP-JG → sync → F5 | Grade label in picker | PLANNED |
| TC-XCM-HRM-FD-001 | FD | — | — | `job_titles` | wrong scope | ceo@xe.vn | Force `company_id=xevn` (tenant-as-company) | **409** `SCOPE_CONTEXT_MISMATCH` VAL-WFCAT-03; no fake rows | PLANNED |
| TC-XCM-HRM-FD-002 | FD | — | CO-HOLD | `job_titles` | empty after false 2xx | ceo@xe.vn | Sync when apply never ran | Honest empty / BLOCKED — **not** 🟢 UF | PLANNED |
| TC-XCM-HRM-AU-001 | AU | — | CO-DL | `leave_types` | member pull scope | du-lich.ceo@xe.vn | HRM sync as member CEO | Snapshot scoped `xe-du-lich`/`main` only — VAL-WFCAT-05 | PLANNED |
| TC-XCM-HRM-UX-001 | UX | — | CO-HOLD | *(any)* | stamp format | ceo@xe.vn | F5 after sync | No ISO-Z raw timestamp | PLANNED |

### 5.4 P-CAT-EXT · alias · cross-pack XREF

| TC-ID | Type | process_id | co_key | catalog_key | hdsd_align | Steps / Expected | Status |
|-------|------|------------|--------|-------------|------------|------------------|--------|
| TC-XCM-EXT-XREF-001 | XREF | **P-CAT-EXT** | CO-DL | *(extension item)* | UF-15 → UF-09 | **Do not retest here** — execute **TC-WFM-CAT-HP-001** (def @ HOLD) → **TC-XIC-EXT-HP-001** → **TC-XIC-CG-HP-001**; then optional pull F5 | PLANNED |
| TC-XCM-EXT-XREF-002 | XREF | **P-CAT-EXT** | CO-HOLD | — | gov reject | Pointer **TC-WFM-CAT-FD-001** · **TC-XIC-CG-FD-001** | PLANNED |
| TC-XCM-ALIAS-001 | ALIAS | — | CO-TMDV | `positions` → `job_titles` | pull alias | GET/pull `positions` resolves same family as `job_titles`; **no** separate publish SoT | PLANNED |
| TC-XCM-ALIAS-002 | ALIAS | — | — | `candidate_sources` → `recruitment_channels` | alias map | Canonical dropdown key = `recruitment_channels` | PLANNED |
| TC-XCM-XREF-CC-001 | XREF | — | CO-HOLD | *(CC master)* | UF-14 OOS | Pointer **`XBOS-CATALOG-CC.md`** TC-CCC-* — not personnel catalog | PLANNED |
| TC-XCM-XREF-SET-001 | XREF | — | — | *(HRM settings)* | UF-HRM-10 | Dedupe synth vs **TC-SET-C-HP-002** / HRM-SETTINGS — neo-map, do not double-count | PLANNED |

### 5.5 Auth / VAL regression

| TC-ID | Type | process_id | co_key | catalog_key | hdsd_align | Steps | Expected | Status |
|-------|------|------------|--------|-------------|------------|-------|----------|--------|
| TC-XCM-AU-002 | AU | — | CO-DL | `job_titles` | apply holding blocked | du-lich.ceo@xe.vn opens apply / POST holding apply | **403/409**; no fan-out SoT | PLANNED |
| TC-XCM-VAL-006 | FD | — | CO-HOLD | `contract_types` | P1 gate | Apply/publish P1 before sponsor gate | **400** `XBOS-CFG-005` VAL-WFCAT-06 if enforced · else GWC | PLANNED · GWC |

**TC count:** **36** rows (design pack · PLANNED)

---

## 6. Coverage check (exit criteria)

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| HP publish@HOLD + Lưu per P0 key family | 5 (`job_titles`,`departments`,`leave_types`,`recruitment_channels`,`job_grades`) | §5.1 PUB-*-HP-001 ×5 | 0 |
| ≥1 apply-to-members path | 1 | AP-HP-003 + per-key AP-*-HP | 0 |
| ≥1 member pull/F5 AC | 1 | §5.3 HRM-*-HP (≥5 keys) | 0 |
| ≥1 FD wrong scope / empty apply | 1 | AP-FD-001 · AP-FD-003 · HRM-FD-001 | 0 |
| `positions` alias XREF (no invent SoT) | 1 | ALIAS-001 | 0 |
| Columns process_id · co_key · catalog_key · hdsd_align · HP/FD/XREF | all TC rows | §5 | 0 |
| Field-level AC §3.3 | publish/apply/pull | §2 + steps | 0 |
| P-CAT-EXT XREF to TC-WFM / TC-XIC | 1 | EXT-XREF-001/002 | 0 |

---

## 7. Traceability

| TC-ID | Matrix / VAL | UF / J | API |
|-------|--------------|--------|-----|
| TC-XCM-PUB-JT-HP-001 | §3.3 Publish | J-XBOS-02 | POST publish `XBOS-CFG-203` |
| TC-XCM-AP-HP-003 | §3.3 Apply | UF-XBOS-09 chain | POST apply-to-members `XBOS-CFG-204` |
| TC-XCM-HRM-JT-HP-001 | §3.3 Pull · VAL-WFCAT-04 | UF-HRM-10 · J-XBOS-02 | pull + GET snapshot |
| TC-XCM-HRM-DE-HP-001 | J-XBOS-CTRL-01 | — | departments |
| TC-XCM-HRM-LV-HP-001 | J-XBOS-CTRL-02 | P-LEAVE consume | leave_types |
| TC-XCM-AP-FD-002 | J-XBOS-CTRL-03 · VAL-WFCAT-06 | — | CFG-005 |
| TC-XCM-HRM-FD-001 | VAL-WFCAT-03 | — | 409 scope |
| TC-XCM-EXT-XREF-001 | Taxonomy P-CAT-EXT · matrix §2 | UF-15→09 | TC-WFM-CAT-HP-001 · TC-XIC-EXT-HP-001 · TC-XIC-CG-HP-001 |
| TC-XCM-ALIAS-001 | §3.1 positions alias | — | resolve → job_titles |

**Synth merge targets:** `XBOS-WF-PROCESS-MATRIX.md` (**TC-WFM-CAT-***) · `XBOS-INBOX-CAT.md` (**TC-XIC-***) · `HRM-SETTINGS.md` · roster `XBOS-CATALOG-APPLY`.

---

## 8. Out of scope / residual

| Item | Reason | Status |
|------|--------|--------|
| UF-XBOS-14 CC document/measure/price | Other pack | OOS → `XBOS-CATALOG-CC.md` |
| Full UF-09/15 chrome retest | XREF INBOX-CAT | XREF |
| `contract_types` HP as P0 | SRS §16.7 **P1** | GWC · VAL-006 |
| Dedicated CC Publish button | Apply panel does not replace publish — GAP-XCM-PUB-UI | SPEC_GAP FE · FN-PUB-HOLD still AC |
| Browser execution | Design-only wave | PLANNED · uat_done false |

| Gap ID | Note | Owner |
|--------|------|-------|
| GAP-XCM-PUB-UI | Portal may lack dedicated Publish chrome on apply panel — TC steps allow gov/config-sync FE path | dev-fe / PM |
| GAP-XCM-CT-P1 | contract_types gate | pm |

---

## 9. Handoff

```
ack_status: SYNTHED
synth_wi: PO-ECO-TC-SYNTH-WF-CAT-01
evidence_path: docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md
author_evidence: docs/qa/evidence/po-eco-tc-xbos-cat-member-01.md
pack_path: docs/qa/testcases/xbos/XBOS-CAT-MEMBER-MATRIX.md
counts: screens=7 fields=18 functions=9 tcs=36
uat_done: false
```

---

*PO-ECO-TC-XBOS-CAT-MEMBER-01 · XBOS-CAT-MEMBER-MATRIX · 2026-08-03*
