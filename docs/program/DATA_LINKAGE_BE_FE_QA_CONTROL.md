# Kiểm soát liên kết dữ liệu BE ↔ FE (QA/QC gate)

| Field | Value |
|-------|--------|
| **SoT** | Program control — XeVN OS / X-BOS |
| **Date** | 2026-07-27 |
| **Trigger incident** | Company Management `employee_count=0` vs Dashboard ~1100 |
| **SRS** | `docs/hrm/SRS.md` **UC-HRM-CO-01** / **FR-HRM-CO-HC-01** · **FR-HRM-CO-IND-01** |
| **TechSpec** | `docs/hrm/TECHSPEC.md` **§19** |
| **Linkage map** | `docs/qa/evidence/ba-data-hrm-co-emp-linkage-01-20260727.md` |
| **OS lesson** | `_vibe-team-os/incidents/INC-DUAL-PLANE-COUNT-STUB.md` · `21-DATA-LINKAGE-DUAL-PLANE.md` |
| **DB/API gate** | `_vibe-team-os/13` §3.4.11.F · project `.cursor/rules/spec-db-api-design-gate.mdc` |
| **Physical design index (U71)** | [`docs/tech-spec/README.md`](../tech-spec/README.md) — path convention + index of `DB_DESIGN_*` / `API_DESIGN_*` pairs (canonical under `docs/hrm/` · `docs/xbos/`) |
| **Headcount physical pair** | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` · `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` (pointers under `docs/tech-spec/`) |
| **Industry physical pair** | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` · `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` |

> Mọi metric/API mới: sau TechSpec phải có **DB_DESIGN + API_DESIGN**; API_DESIGN gắn **bước Diễn biến SRS** trước khi Dev/QA.  
> Tra cứu path: **`docs/tech-spec/README.md`** (không thay thế file canonical ở module root).

---

## 1. Nguyên nhân gốc rễ (khóa)

| # | Layer | Defect |
|---|--------|--------|
| **R1** | **FE bind** | Mapper XBOS → UI hardcode `employee_count: null`; UI `\|\| 0` → hiển thị giả 0 |
| **R2** | **Identity dual-plane** | Plane A = XBOS legal entity UUID; Plane B = `employees.company_id` TEXT slug — **không** đếm bằng UUID pháp nhân |
| **R3** | **Spec/QA gap** | AC màn Công ty chỉ “có list ĐVTV”; không bắt buộc headcount parity Dashboard → QA PASS sai chuẩn |
| **R4** | **FE label SoT** | Mapper gán `industry ← entity_type` → UI «Ngành nghề» = raw `subsidiary` (org class ≠ ngành); XBOS SoT = `business_lines` + dictionary VI (**AC-CO-IND** / **BR-CO-LABEL-01**) |

**Không phải:** DB mất NV; Dashboard sai; “NV không thuộc công ty nào”. NV thuộc **operating slug**; màn Công ty **không đọc** SoT headcount.

---

## 2. Kinh nghiệm rà soát dữ liệu (PM ép member)

Trước mọi màn có **số đếm / badge / card KPI / cột số lượng**:

| Bước | Câu hỏi bắt buộc | Fail nếu |
|------|-------------------|----------|
| **D1 SoT** | Số này SoT ở **bảng/API nào**? | Chỉ suy từ UI list khác hệ |
| **D2 Key** | Khóa join là **slug / UUID / code / tenant**? | FE bind key ≠ BE filter key |
| **D3 Cross-surface** | Cùng persona, màn A và màn B cùng metric có **parity** không? | A=0, B=1100 mà vẫn PASS |
| **D4 Null policy** | `null` → «—» hay 0? | `null\|\|0` khi API chưa enrich |
| **D5 Stub hunt** | Grep `null`, `\|\| 0`, `employee_count: 0` hardcoded | Stub còn trong mapper |
| **D6 Network** | DevTools: request COUNT/summary dùng đúng key? | `company_id=<LE UUID>` |
| **D7 Spec AC** | SRS có AC số + F5 + Network? | Chỉ “load được list” |

**Checklist copy vào mọi Task QA metric:**

```text
[ ] SoT API/table cited
[ ] Join key plane documented (A/B)
[ ] Cross-surface parity (Dashboard / list / card)
[ ] No null||0 silent fake
[ ] Network proof of correct company_id / scope
[ ] F5 retains number
```

---

## 3. Hợp đồng BE vs FE (Company headcount — mẫu)

### BE phải giao

| Contract | Value |
|----------|--------|
| Endpoint | `GET /api/hrm/employees/summary?company_id=main` (Group CEO) |
| Field | `data.by_company[]`: `{ company_id, total, active_count, inactive_count, archived_count }` |
| `company_id` in array | Chỉ Plane B slug: `holding\|trsport\|logistics\|finance\|services` |
| Scope | Cùng `resolveHrmListScope` với list employees |
| Cấm | Trả LE UUID làm `company_id` workforce |

### FE phải bind

| Step | Rule |
|------|------|
| 1 | Load ĐVTV từ XBOS (profile MST/founded) |
| 2 | Bridge row → **operating_slug** (registry / name map) |
| 3 | `employee_count = by_company.find(slug).total` |
| 4 | Card Tổng NV = `data.total` hoặc sum known counts |
| 5 | API fail / unknown slug → **«—»**, không `null\|\|0` |
| 6 | Cấm gọi summary với `company_id=<xbos_legal_entity.id>` |

### QA/QC PASS chỉ khi

| AC | Evidence |
|----|----------|
| AC-CO-EMP-01 | Card ≈ Dashboard / `summary.total` |
| AC-CO-EMP-02 | Cột NV theo slug > 0 khi DB có NV |
| AC-CO-EMP-03 | Bridge đúng Visun→`logistics`… |
| AC-CO-EMP-04 | Fail → «—» |
| AC-CO-EMP-05 | Parity Dashboard cùng session |
| AC-CO-EMP-06 | F5 + Network 2xx; **cấm** PASS chỉ vì “thấy 5 công ty” |

**QC NO-GO:** metric AC thiếu trong SRS mà UI vẫn hiện số (kể cả 0); hoặc QA evidence không có Network `company_id`.

---

## 4. Mẫu UF evidence (QA)

```markdown
### UF-HRM-CO-HC — Số nhân viên màn Công ty
- Persona / URL: ceo@xe.vn · /command-center/hrm/company
- Dashboard Nhân sự (cùng session): N=
- Card Tổng nhân viên: N=
- Cột theo dòng: holding=… trsport=… …
- Network: GET /api/hrm/employees/summary?company_id=main → 200
  - by_company.length=5 · slugs=…
  - không có UUID pháp nhân trong query
- F5: …
- Verdict: 🟢 / 🔴
- spec_ref: UC-HRM-CO-01 · TECHSPEC §19 · AC-CO-EMP-*
```

```markdown
### UF-HRM-CO-IND — Ngành nghề màn Công ty
- Persona / URL: ceo@xe.vn · /command-center/hrm/company
- Cột «Ngành nghề» từng dòng: (expect VI hoặc «—»; **cấm** `subsidiary`/`holding`)
- Network: GET …/group-member-units (và/hoặc legal enrich) → 200; field `business_lines` khi DB có
- F5: cùng nhãn
- Verdict: 🟢 / 🔴
- spec_ref: UC-HRM-CO-01 · FR-HRM-CO-IND-01 · AC-CO-IND-01..04 · BR-CO-LABEL-01
```

---

## 5. Khi nào mở tài liệu này

- Mọi screen **aggregate từ hệ A hiển thị metric hệ B**
- XBOS ↔ HRM, Portal embed ↔ Nest, Mobile UUID ladder ↔ slug
- Sponsor báo “số sai / số 0 / không thuộc công ty”

PM **cấm** đóng UF metric chỉ với L2 “page load”.

---

## 6. Dual-plane residual matrix (ngoài Company headcount) — ADD `BA-DUAL-PLANE-AUDIT-02`

> **CO-HC / Company NV headcount = GWC CLOSED** — **cấm** reopen (`UF-HRM-CO-HC` · AC-CO-EMP-* · TECHSPEC §19).  
> Evidence audit: `docs/qa/evidence/ba-dual-plane-audit-02-20260727.md`.  
> ADR: `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` · `ADR-HRM-RBAC-SCOPE-LADDER` §4 (`companyId` slug · `holding` XBOS · `company_uuid` mobile).

### 6.1 Identifier planes (normative — do not conflate)

| Plane | Key shape | SoT store | Allowed consumers | Forbidden |
|-------|-----------|-----------|-------------------|-----------|
| **A — Legal entity** | UUID `xbos_legal_entity.id` (+ synthetic holding root) | XBOS org / ĐVTV / shareholders / documents | Profile, RACI path assert, infra entity keys | Workforce COUNT / `employees.company_id` filter |
| **B — Operating slug** | TEXT `holding\|trsport\|logistics\|finance\|services` (+ JWT `main` rollup) | HRM employees / leave / payroll / fleet / contracts… | HRM list/create scope · Company headcount bind | Persist LE UUID as slug |
| **B′ — Pilot UUID ladder** | `HRM_COMPANY_UUID_BY_SLUG` UUID | Mobile attendance body · Operations/Metadata DDL (legacy) | `companyScopeMatches` · OP/MD map only | Treat as Plane A LE UUID |
| **C — JWT / catalog alias** | `main` ↔ `holding` (group CEO helpers) | ADR §4 helpers | Catalog partition · KPI rollup · XBOS legal-read | Default bypass `resolveScopeContext` |

### 6.2 Remaining risk matrix (OUTSIDE CO-HC)

| # | Screen / API | Key plane used today | Risk | Sev | Owner | work_item_id |
|---|--------------|----------------------|------|-----|-------|--------------|
| 1 | HRM Operations tasks + OP-04 summary (`hrm_tasks` / `service_requests`) | Persist **B′ UUID**; wire **B slug**; OP-04 also cites TEXT modules | LE UUID mistaken for map UUID → empty/0 counts; cross-plane aggregate silent undercount | **P1** | dev-be | `D-HRM-OP-DUAL-PLANE-GUARD-01` |
| 2 | HRM Metadata queue (`employee_metadata_*`) | Persist **B′ UUID** + slug→UUID map (`G-MD-PLANE-01`) | Same class as #1; mutate 404/empty if LE UUID passed | **P1** | dev-be | `D-HRM-MD-DUAL-PLANE-GUARD-01` |
| 3 | BR-INT-05 bridge cardinality (ĐVTV vs slug) | A list (4 member LE + holding) ↔ B (5 slugs) | **CLOSED (design)** — Option A code→slug lock; ordinal non-normative | **Info** | — | `SA-G-INT-03-PLANE-A-BRIDGE-01` DONE · ADR `ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727` · optional P2 `D-HRM-BRIDGE-LE-CODE-MAP-01` |
| 4 | Mobile attendance POST (`company_uuid`) | B′ in body + JWT claim | Sending Plane A LE UUID → **409**; portal POST without claim | **P1** | qa (+ dev-mobile if FAIL) | `QA-HRM-MOB-UUID-PLANE-01` |
| 5 | XBOS Infra foundation `appliesToCompanyIds` / entity keys | **CLOSED (design)** — Plane **A** LE UUID (members) + holding aliases (`xbos-group-holding-root`/`main`/`holding`); **not** B / B′ | Legacy `main`-only persist → 0 ticks / wrong hide — FE harden | **Info** (design) · FE P1 | — → dev-fe | `SA-XBOS-INF-SCOPE-KEY-PLANE-01` DONE · ADR `ADR-XBOS-INF-APPLIES-TO-COMPANY-IDS-KEY-PLANE-20260727` · `API_DESIGN_XBOS_INFRASTRUCTURE` · next `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` |
| 6 | Employees «Thông tin công ty» + OU filter | Display **A** via bridge from **B** slug | Local AC-EMP-COL GWC; :8088 HOLD_DEPLOY only | **Info** | devops (sponsor unlock) | `C-EMP-COL-8088-01` (standing) |
| 7 | Dashboard / chart company labels (`G-INT-02`) | B display_name / registry | Residual «Khối» vs LE name on charts | **P2** | dev-fe | `D-HRM-G-INT-02-CHART-LABEL-01` |
| 8 | Operations vs Fleet company_id DDL | OP=B′ UUID · Fleet=B TEXT | Dev confusion; wrong filter helper copy-paste | **P2** | tm / dev-be on-touch | `G-OP-PLANE-01` / Fleet must_keep TEXT |
| 9 | XBOS RACI `…/companies/{companyId}/matrix` | Path A **or** B → resolve → persist TEXT | Contract OK; FE regress to wrong plane → 409 | **Info** | qa on-touch | must_keep `API_DESIGN_XBOS_RACI_RBAC` |
| 10 | XBOS WF / Catalog / KPI | B / `holding` alias — **not** LE as companyId | Documented MUST NOT bind LE | **Info** | — | ADR + API_DESIGN anti-pattern |
| 11 | G-SCOPE-01 list↔get parity | Module-specific | Standing P0 **on-touch** (not new dual-plane defect) | **P0 standing** | dev-be+qa | existing program gap — do not invent CO-HC reopen |

**Closed this audit (do not reopen):** Company Management headcount / `employees/summary.by_company` slug keys · industry ≠ `entity_type`.

### 6.3 Dev backlog priority (copy-ready)

| Priority | work_item_id | Role | One-line exit |
|----------|--------------|------|---------------|
| P1 | `D-HRM-OP-DUAL-PLANE-GUARD-01` | dev-be | Jest: LE UUID ∉ map → reject/0; slug→map UUID OK; OP-04 documents plane mix; no CO-HC touch |
| P1 | `D-HRM-MD-DUAL-PLANE-GUARD-01` | dev-be | Same anti-LE for metadata persist/list; CODE-MEMORY cite G-MD-PLANE-01 |
| ~~P1~~ | ~~`SA-G-INT-03-PLANE-A-BRIDGE-01`~~ | sa | **DONE 2026-07-27** — Option A Accepted; see ADR + `docs/qa/evidence/sa-g-int-03-plane-a-bridge-01-20260727.md` |
| P2 | `D-HRM-BRIDGE-LE-CODE-MAP-01` | dev-be | Optional PROD harden: resolve by LE `code` on `company_slug_map` (not list index); no CO-HC reopen |
| P1 | `QA-HRM-MOB-UUID-PLANE-01` | qa | U65 mobile: body UUID = JWT `company_uuid` ≠ LE; LE body → 409 |
| ~~P1~~ | ~~`SA-XBOS-INF-SCOPE-KEY-PLANE-01`~~ | sa | **DONE 2026-07-27** — Plane A + holding aliases; ADR + `docs/xbos/API_DESIGN_XBOS_INFRASTRUCTURE.md`; evidence `sa-xbos-inf-scope-key-plane-01-20260727.md` |
| P1 | `D-XBOS-INF-SCOPE-KEY-PLANE-FE-01` | dev-fe | Persist Plane A LE + prefer `xbos-group-holding-root`; never B′ / workforce member slugs; AC-INF-KEY-01..05 |
| P2 | `D-XBOS-INF-SCOPE-KEY-VALIDATE-01` | dev-be | Optional PUT reject B′ + `trsport|logistics|finance|services` as scope keys |
| P2 | `D-HRM-G-INT-02-CHART-LABEL-01` | dev-fe | Chart labels LE/ĐVTV SoT; 0 Khối* |
| P2 | `G-OP-PLANE-01` / `G-MD-PLANE-01` migrate | dev-be | Optional UUID→TEXT — **defer** until sponsor |

### 6.4 QA checklist add-on (dual-plane non-CO-HC)

```text
[ ] Identify key plane (A / B / B′ / C) before assert count/FK
[ ] Network: company_id never raw LE UUID on HRM TEXT spine
[ ] B′ paths: UUID ∈ HRM_COMPANY_UUID_BY_SLUG only (not LE)
[ ] Cross-surface: OP-04 vs employees/payroll totals — explain plane mix or FAIL
[ ] Mobile: company_uuid claim present when body UUID
[ ] Infra foundation: `appliesToCompanyIds` = Plane A LE (+ holding aliases) — not B′ / not workforce member slugs
[ ] No reopen CO-HC GWC rows
```
mpany_uuid claim present when body UUID
[ ] Infra foundation: `appliesToCompanyIds` = Plane A LE (+ holding aliases) — not B′ / not workforce member slugs
[ ] No reopen CO-HC GWC rows
```
