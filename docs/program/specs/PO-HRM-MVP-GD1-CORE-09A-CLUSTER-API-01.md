# PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01 — API F.1 · Clause library RETAIN cite (Option A · HOLD invent)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-13 seat **#15**) |
| **lane** | governance · sa |
| **change_mode** | **HOLD / RETAIN cite** **F-CORE-CTR-CL-01..04** + **F-CORE-CTR-PUB/PULL** · **NO ADD** Nest dual · **NO** mega-EAV · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · unlock **Dev-FE Settings UX residual ONLY** · **DENY** Dev invent schema/API |
| **uc_ids** | `UC-BP-CORE-09a` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-12 CORE-08 **SEALED** stamp **`CORE08QC1-MSL9BFFE`** · peers **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** |
| **ref_data** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-DATA-01.md) — HOLD RETAIN `hrm_contract_clauses` · `clauses_snapshot_json` freeze · no mega-EAV |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-BA-01.md) · AC-CORE-09A-* · VAL-CORE-CL-* · O1–O12 · **BR-CTR-CL-01..04** · J-HRM-CORE-09A-01..04 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md) Option A · F-CORE-CTR-CL RETAIN |
| **ref_core08_api** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md) — RD + payroll_link **SEALED must_keep** · **≠** pillar DONE · note **≠** FR-08 DONE |
| **ref_core02_api** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_api** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md) — public strip · Nest `/core` DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09a** Diễn biến **#1–#5** · **BR-CTR-CL-01..04** · AC-CTR-CL-01..03 · AC-PLT-CTR-CL-01..06 |
| **ref_paper_api** | **F-CORE-CTR-CL-01..04** **RETAIN** · **F-CORE-CTR-PUB/PULL** **RETAIN** · physical `/contracts-insurance/contract-clauses*` · paper `/core/…/clauses` **alias only** · peers **F-CORE-CTR-PREV/VER/PDF/TPL** **OUT invent** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-08 = pillar DONE · **DENY** note-CRUD = FR-08 DONE |
| **ba-data** | **ALREADY CONFIRMED HOLD** (DATA-01) — this seat **does not** re-open schema invent |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **artifact_size** | SPEC_LEN=26756 · EVID_LEN=5482 (NFD path) |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Physical clause SoT GĐ1 | Nest `@Controller('contracts-insurance')` — **`/api/hrm/contracts-insurance/contract-clauses*`** **ONLY** body SoT |
| F-CORE-CTR-CL-01..04 | **RETAIN cite** LIVE list/create/get/update/activate/retire — **HOLD invent** second controller / Nest `/core` dual |
| Draft vs issued | Draft / not-issued → **PATCH in-place** · Active + issued snapshot → **`HRM-CTR-CL-CODE-CONFLICT`** → **`POST …/activate`** version bump |
| Snapshot freeze | **`hrm_contract_print_versions.clauses_snapshot_json`** immutable when `status=issued` — **must_keep** |
| Placeholders | **`{{token}}` / `{{tên_trường}}`** only — DENY dual merge syntax |
| Soft retire | **`POST …/retire`** → `status=retired` · optional soft archive `archived_at` — **DENY** hard-delete referenced |
| Publish/pull | **`/contract-library/publishes*`** + **`/pull`** (+ apply) — **RETAIN** lineage · **≠** second body SoT |
| Paper path | `/api/hrm/core/…/clauses` = **logical alias / DOC-DELTA only** — **DENY** Nest `@Controller('core')` clause SoT |
| Settings / XBOS | Admin **UX only** — **DENY** authoritative `body_vi` store |
| Mega-EAV / prior-body admin | **HOLD** (DATA O5) — **NOT unlock** this seat |
| Peers OUT | **F-CORE-CTR-PREV / VER / PDF / TPL** invent as this WI DONE — **OUT** (09b/09c/09d) |
| CORE-08 / 02 / 01 | **must_keep** RD+payroll_link · packages/AuthZ/CB-403 · public strip · Nest `/core` DENY · stamps **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** |
| Envelope | **RETAIN** `{ code, message, data }` · success **`HRM-CTR-CL-200/201`** · fail **`HRM-CTR-CL-*`** · scope **`HRM-SCOPE-409` / `HRM-CTR-409`** |
| U19 | list = get = update = activate = retire = publish/pull scope family |
| Display-ready | Status / group / pack VI labels for Settings bind — **FE residual OK** (map enum) · **DENY** FE invent PDF Net / second body SoT |
| Unlock | **Dev-FE Settings UX residual ONLY** after this **CONFIRMED RETAIN** — **DENY** Dev invent schema/API / Nest `/core` |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-CORE-08/02/01 |

```text
  FE «Thư viện điều khoản HĐ» (Cài đặt) — UX residual only
        │  Network MUST contain /contracts-insurance/contract-clauses
        │  DENY Nest /core/* clause SoT · DENY Settings/XBOS body writer SoT
        ▼
  F-CORE-CTR-CL-01  GET  /api/hrm/contracts-insurance/contract-clauses
  F-CORE-CTR-CL-02  POST/PATCH …/contract-clauses[+/:id]
  F-CORE-CTR-CL-01b GET  …/contract-clauses/:clauseId
  F-CORE-CTR-CL-03  POST …/contract-clauses/:clauseId/activate
  F-CORE-CTR-CL-04  POST …/contract-clauses/:clauseId/retire
        │
        ├─► draft / not-issued → updateClause IN PLACE (body_vi)
        ├─► active + issued snapshot → CONFLICT → activate bump version
        ├─► issued HĐ → clauses_snapshot_json IMMUTABLE
        ├─► {{field}} / {{token}} ONLY
        │
        ├─► RETAIN F-CORE-CTR-PUB/PULL
        │     POST/GET …/contract-library/publishes*
        │     POST …/contract-library/pull (+ apply)
        │     ≠ second body SoT
        │
        └─► must_keep CORE-08 RD+payroll_link · CORE-02 · CORE-01
              Nest /core DENY · snapshot freeze · printable false

  paper /api/hrm/core/…/clauses = alias only
  OUT invent: F-CORE-CTR-PREV / VER / PDF / TPL as CORE-09a DONE
  CORE-08 GWC ≠ CORE pillar DONE · note-CRUD ≠ FR-08 DONE
```

**Invariant CORE-CL-PATH (O1):** Clause mutate Network **MUST** hit `/contracts-insurance/contract-clauses*` · Nest dual `/core` clause = **FAIL**.

**Invariant CORE-CL-SETTINGS-≠-SOT (O1):** Settings/XBOS **MUST NOT** own authoritative `body_vi`.

**Invariant CORE-CL-DRAFT (O3):** Draft/not-issued PATCH → **2xx** + F5 new body.

**Invariant CORE-CL-ISSUED (O3):** Active + issued → PATCH body → **`HRM-CTR-CL-CODE-CONFLICT`** → activate bump · **DENY** silent overwrite.

**Invariant CORE-CL-SNAPSHOT (O3/O7):** Issued `clauses_snapshot_json` **immutable** after library bump.

**Invariant CORE-CL-PLACEHOLDER (O4):** `{{x}}` only — dual syntax = **FAIL**.

**Invariant CORE-CL-RETIRE (O6):** Soft retire · snapshots readable · hard-delete referenced = **FAIL**.

**Invariant CORE-CL-PUB-≠-BODY (O8):** Publish/pull **≠** second body SoT.

**Invariant CORE-CL-PEER-OUT (O8):** PREV/VER/PDF/TPL invent as this WI DONE = **FAIL**.

**Invariant CORE-CL-≠-RD-DONE (O9):** CORE-08 GWC **≠** CORE pillar DONE.

**Invariant CORE-CL-≠-NOTE-DONE (O9):** note-CRUD **≠** FR-08 DONE.

**Invariant CORE-CL-≠-PRINTABLE (O10):** Slice GWC **≠** `contracts_printable_ready=true`.

**Invariant CORE-CL-S-SCOPE (U19):** list = get = update = activate = retire.

**Invariant CORE-CL-NO-EAV (O5):** Mega clause-version EAV / prior-body admin table **HOLD** — **NOT unlock**.

---

## 2. AS-IS Nest baseline → residual (HOLD invent)

| Surface | LIVE (read-only cite) | Gap vs F.1 this seat |
|---------|----------------------|----------------------|
| `GET/POST/PATCH …/contract-clauses*` | LIVE `ContractsInsuranceController` + `ContractLegalPrintService` · codes `HRM-CTR-CL-*` | **RETAIN** SoT — **HOLD invent** |
| `GET …/contract-clauses/:clauseId` | LIVE get-by-id + U19 scope | **RETAIN** |
| `POST …/:clauseId/activate` | LIVE version bump when issued | **RETAIN** |
| `POST …/:clauseId/retire` | LIVE `status=retired` | **RETAIN** · soft archive via `softDeleteClause` optional |
| Draft in-place | `updateClause` edits `body_vi` when not issued-blocked | **RETAIN** |
| Issued soft-block | `clauseHasIssuedSnapshot` → `HRM-CTR-CL-CODE-CONFLICT` | **RETAIN** |
| Snapshot freeze | `hrm_contract_print_versions.clauses_snapshot_json` | **must_keep RETAIN** |
| `{{token}}` | body / keyword_map AS-IS | **RETAIN LOCK** |
| Publish/pull | LIVE `ContractLibraryPublishService` `/contract-library/*` | **RETAIN** ≠ body SoT |
| Display labels VI | `displayClause` returns raw row (+ lineage) — **no** `status_label` yet | **FE Settings residual** map VI · optional thin BE later **≠** schema invent |
| Nest `/core/…/clauses` | **ABSENT** as controller SoT | **DENY** invent · paper alias only |
| Mega-EAV / prior-body admin | **ABSENT** | **HOLD** (DATA O5) |
| Settings/XBOS body store | **DENY** | Fail O1 if authoritative |
| Source | `contracts-insurance.controller.ts` (~L549–649) · `contract-legal-print.service.ts` list/create/update/activate/retire · `contract-library-publish.service.ts` | FE residual after CONFIRMED |

**FORBIDDEN invent this seat:** Nest `@Controller('core')` clause SoT · Settings/XBOS body SoT · mega-EAV · second `body_vi` table · unlock prior-body admin history · invent PREV/VER/PDF/TPL as DONE · claim CORE-08=pillar DONE · claim note=FR-08 DONE · flip `contracts_printable_ready` · reopen J-CORE-08/02/01 · seed · honesty flip · `apps/**` · Dev invent schema/API.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL (Nest GĐ1)** | **`/api/hrm/contracts-insurance/contract-clauses`** · **`…/contract-clauses/:clauseId`** · **`…/activate`** · **`…/retire`** |
| **PHYSICAL PUB/PULL** | **`/api/hrm/contracts-insurance/contract-library/publishes`** · **`…/publishes/:publishVersion`** · **`…/pull`** · **`…/apply`** |
| **LOGICAL (paper)** | `/api/hrm/core/…/clauses` (if cited) |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/contracts-insurance/contract-clauses` for clause mutate — **FAIL O1** if FE mutates Nest `/core/*` as second SoT |

| Paper / logical | Physical | DB |
|-----------------|----------|-----|
| F-CORE-CTR-CL-01..04 `/core/…/clauses` | `/contracts-insurance/contract-clauses*` | `hrm_contract_clauses` |
| Body SoT | same | **`body_vi`** |
| Issued history | print-versions read | **`clauses_snapshot_json`** |
| F-CORE-CTR-PUB/PULL | `/contract-library/*` | publishes + pull audits + lineage cols |
| F-CORE-CTR-PREV/VER/PDF/TPL | Peer **OUT** | 09b/09c/09d |
| F-CORE-RD-01 | CORE-08 SEALED | rewards* + discipline* |
| F-CORE-EMP-02 / SI | CORE-02 SEALED | packages\|eins |
| F-CORE-EMP-01 public | `/employees*` | CORE-01 SEALED strip |

---

## 4. Lifecycle & DTO (RETAIN — normative cite)

### 4.1 Request / response fields (LIVE)

| Field | Create | Update | Response | Rule |
|-------|:------:|:------:|:--------:|------|
| `company_id` | YES | query/header | YES | U19 persist/resolve |
| `code` | YES | immutable key | YES | Active UQ · CONFLICT on collide |
| `title_vi` | YES | optional | YES | Required non-empty |
| `body_vi` | YES | optional | YES | **Body SoT** · `{{field}}` allowed |
| `clause_group` | YES | optional | YES | Group key |
| `apply_to_packs` | opt (`*` default) | optional | YES | Pack codes / `*` |
| `sort_order` | opt | optional | YES | Order in group |
| `mandatory` | opt | optional | YES | Consumer gate (peer OUT) |
| `status` | opt (`draft`) | optional | YES | `draft`\|`active`\|`retired` |
| `version` | — | — | YES | Bump on activate when issued |
| `effective_from` | opt | optional | YES | Optional date |
| lineage (`origin`…) | — | stamp override | YES | DATA-02 RETAIN |
| `archived_at` | — | soft archive | YES | Soft-delete |

**Display-ready (O11 residual):** FE Settings **MAY** map `status` → VI (`Nháp` / `Hiệu lực` / `Ngừng dùng`) and present group/pack labels — **DENY** inventing a second body store or PDF Network as SoT. Thin BE `*_label` ADD later = separate residual WI — **not** schema invent this seat.

### 4.2 Draft vs issued (O3 · BR-CTR-CL-01)

| State | PATCH `body_vi` | Activate |
|-------|-----------------|----------|
| `draft` / active **not** in issued snapshot | **In-place 2xx** · version unchanged (or optional non-issued bump) · **F5** shows new body | Optional → set `active` |
| `active` **and** code present in issued `clauses_snapshot_json` | **409/CONFLICT** `HRM-CTR-CL-CODE-CONFLICT` — **DENY** silent overwrite | **Required** → `version = version + 1` · status `active` · retire other active same code |
| After bump | Library vN+1 for **future** attach | Issued print versions keep **old** snapshot |

### 4.3 Soft retire (O6)

| Action | LIVE behavior | Contract |
|--------|---------------|----------|
| `POST …/retire` | `status='retired'` | Hide from default new select · filter «gồm ngừng» may show |
| Soft archive | `archived_at` + `retired` (`softDeleteClause`) | Preferred over hard DELETE |
| Issued snapshots | Remain readable | **DENY** hard-delete when referenced in issued history |

### 4.4 Placeholders (O4)

| Allowed | Denied |
|---------|--------|
| `{{token}}` · `{{tên_trường}}` | Dual syntax in one body (`{{x}}` + `${x}` / other) as SoT |

---

## 5. F.1 endpoint contracts (RETAIN cite)

### 5.1 F-CORE-CTR-CL-01 — List clauses

| | |
|--|--|
| **Mục đích** | Cấp danh sách điều khoản thư viện theo pháp nhân / nhóm / gói / trạng thái cho màn Cài đặt «Thư viện điều khoản HĐ». |
| **Nghiệp vụ xử lý** | AuthZ · `resolveScope` + `pushCompanyIdFilter` · filter `archived_at IS NULL` · optional `status` / `clause_group` / `pack_code` · ORDER BY `sort_order`, `code` · displayClause. |
| **Tham chiếu bước SRS** | **UC-BP-CORE-09a** Diễn biến **#1** · AC-CORE-09A-01 · AC-CTR-CL-01 · O1 |
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-clauses` |
| **Success** | `200` · `HRM-CTR-CL-200` · `{ total, data[] }` |
| **Errors** | Scope mismatch · Auth deny |

### 5.2 F-CORE-CTR-CL-01b — Get by id

| | |
|--|--|
| **Mục đích** | Đọc chi tiết một điều khoản trong cùng scope list (U19). |
| **Nghiệp vụ xử lý** | Same expanded company filter · `assertResourceInHrmScope` · 404 out-of-scope. |
| **Tham chiếu bước SRS** | Diễn biến **#1/#3** · U19 · O12 |
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contract-clauses/:clauseId` |
| **Success** | `200` · `HRM-CTR-CL-200` |
| **Errors** | `HRM-CTR-CL-404` · `HRM-CTR-409` |

### 5.3 F-CORE-CTR-CL-02 — Create / update

| | |
|--|--|
| **Mục đích** | Tạo nháp / cập nhật nội dung điều khoản (body-as-data) — draft in-place; chặn ghi đè khi đã phát hành. |
| **Nghiệp vụ xử lý** | Validate code/title/body → `HRM-CTR-CL-REQUIRED` · pack normalize · create default `draft` version=1 · update in-place unless active+issued → CONFLICT · lineage `member_override` stamp when pulled row edited. |
| **Tham chiếu bước SRS** | Diễn biến **#2/#3** · AC-CORE-09A-02/04/05 · AC-PLT-CTR-CL-01/02/04 · BR-CTR-CL-01/03 · O2/O3/O4 |
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses` · `PATCH …/contract-clauses/:clauseId` |
| **Success** | `201/200` · `HRM-CTR-CL-201/200` |
| **Errors** | `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · pack invalid |

### 5.4 F-CORE-CTR-CL-03 — Activate (+ bump when issued)

| | |
|--|--|
| **Mục đích** | Đưa điều khoản vào hiệu lực; khi đã gắn bản in phát hành thì **tăng phiên bản** thay vì ghi đè im lặng. |
| **Nghiệp vụ xử lý** | Assert required fields · retire other active same code · if `clauseHasIssuedSnapshot` → `version+1` else `GREATEST(version,1)` · set `active`. |
| **Tham chiếu bước SRS** | Diễn biến **#3** · AC-CORE-09A-03/05 · AC-PLT-CTR-CL-02 · BR-CTR-CL-01 · O3 |
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses/:clauseId/activate` |
| **Success** | `200` · `HRM-CTR-CL-200` · version reflected |
| **Errors** | `HRM-CTR-CL-REQUIRED` · `HRM-CTR-CL-CODE-CONFLICT` · `404` |

### 5.5 F-CORE-CTR-CL-04 — Retire soft

| | |
|--|--|
| **Mục đích** | Ngừng dùng điều khoản khỏi chọn mới; giữ snapshot HĐ đã phát hành. |
| **Nghiệp vụ xử lý** | Set `status=retired` · hide from default active select · issued snapshots readable · prefer soft archive over hard delete. |
| **Tham chiếu bước SRS** | Diễn biến **#4** · AC-CORE-09A-07 · AC-CTR-CL-03 · AC-PLT-CTR-CL-06 · O6 |
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contract-clauses/:clauseId/retire` |
| **Success** | `200` · `HRM-CTR-CL-200` |
| **Errors** | `HRM-CTR-CL-404` · scope |

### 5.6 F-CORE-CTR-PUB / PULL — RETAIN (not new body SoT)

| | |
|--|--|
| **Mục đích** | Xuất bản thư viện tập đoàn → thành viên kéo về (lineage) — **không** tạo SoT nội dung thứ hai. |
| **Nghiệp vụ xử lý** | Group publish checksum · member pull/apply · stamp `origin` / `origin_publish_version` / `lineage_code` on clause rows — body still lives on `hrm_contract_clauses`. |
| **Tham chiếu bước SRS** | FR-UC-BP-CORE-09a lineage · DATA-02 · O8 RETAIN |
| **METHOD / path** | `POST/GET …/contract-library/publishes*` · `POST …/pull` · `POST …/apply` |
| **OUT this WI DONE** | **F-CORE-CTR-PREV** · **VER** · **PDF** · **TPL** invent / claim printable UAT |

### 5.7 Snapshot freeze (consumer assert — not mutate library SoT)

| | |
|--|--|
| **Mục đích** | Bảo toàn nội dung điều khoản đã phát hành trên HĐ. |
| **Nghiệp vụ** | After issue, **DENY** mutate `clauses_snapshot_json` from library edit/activate — library vN+1 for future only. |
| **SRS** | AC-CORE-09A-06 · AC-PLT-CTR-CL-03 · BR-CTR-CL-01 · O3/O7 |
| **Assert** | Reopen issued print version → body unchanged |

---

## 6. Error taxonomy (RETAIN — no invent rewrite)

| Code | HTTP | Meaning |
|------|------|---------|
| `HRM-CTR-CL-200` | 200 | List/get/update/activate/retire OK |
| `HRM-CTR-CL-201` | 201 | Create OK |
| `HRM-CTR-CL-REQUIRED` | 400 | Missing code / title_vi / body_vi |
| `HRM-CTR-CL-CODE-CONFLICT` | 409 | Active code collide **or** issued body change requires activate |
| `HRM-CTR-CL-404` | 404 | Missing / out of scope |
| `HRM-CTR-409` / `HRM-SCOPE-409` | 409 | Scope mismatch |
| Pack invalid codes | 400 | Bad `apply_to_packs` |
| Sealed RD / CB / AuthZ | — | **DENY** rewrite · must_keep |

---

## 7. Scope parity (U19)

| Surface | Same resolver family |
|---------|----------------------|
| List | `GET …/contract-clauses` |
| Get-by-id | `GET …/contract-clauses/:clauseId` |
| Update / activate / retire | same `contracts-insurance` + `resolveScope` / `expandHrmTextCompanyIds` |
| Issued detect | `clauseHasIssuedSnapshot` uses expanded company ids (main↔holding) |
| Publish/pull | library publish service scope family |

**Flag `scope_parity`:** list returns id but get/update/activate 404 under group CEO `main` = **P0**.

**J-* DRAFT (BA):** `J-HRM-CORE-09A-01..04` — create+activate · draft F5 · issued bump+freeze · retire + Nest `/core` 0 + CORE-08/02/01 smoke.

---

## 8. must_keep & DENY

| Item | Rule |
|------|------|
| LIVE clause spine | `/contracts-insurance/contract-clauses*` · draft in-place · issued CONFLICT→activate · soft retire · lineage |
| Snapshot freeze | `clauses_snapshot_json` immutable when issued |
| Publish/pull | RETAIN · ≠ second body SoT |
| CORE-08 | rewards* + discipline* + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE · note **≠** FR-08 DONE |
| CORE-02 | packages/eins · AuthZ-403 · CB-403 · stamp **`CORE02QC1-MSL80DU6`** |
| CORE-01 | public strip · stamp **`CORE01QC1-MSL6WMS7`** |
| Nest `/core` | **DENY** clause SoT |
| Settings/XBOS | **DENY** body SoT |
| Mega-EAV / prior-body admin | **HOLD** · default **NOT unlock** |
| PREV/VER/PDF/TPL | **OUT invent** as this WI DONE |
| Honesty | printable / recruitment / jd / CORE UAT **false** · C-SLICE |
| Seed / apps/** | **DENY** this seat |
| Reopen sealed J-CORE-08/02/01 | **DENY** without regression |
| Dev invent schema/API | **DENY** — FE Settings UX residual only |

---

## 9. Traceability (requirement → API → FE → test)

| BR / AC | API | FE / J-* | Test expect |
|---------|-----|----------|-------------|
| BR-CTR-CL-01 · AC-PLT-CTR-CL-02/03 | F-CORE-CTR-CL-02/03 · snapshot | J-09A-03 | CONFLICT → bump · freeze |
| BR-CTR-CL-03 · AC-PLT-CTR-CL-05 | resolve library/snapshot | J-09A-03 note | No FE hardcode long legal |
| AC-CTR-CL-01 · AC-PLT-CTR-CL-01/04 | CL-01/02/03 | J-09A-01/02 | Create · draft F5 · activate |
| AC-CTR-CL-03 · AC-PLT-CTR-CL-06 | CL-04 | J-09A-04 | Soft retire · snapshot OK |
| O1 path | physical path | Network | Nest `/core` 0 |
| O9 must_keep | sealed APIs | J-09A-04 smoke | ≠ pillar DONE · ≠ note=FR-08 |
| O10 honesty | — | evidence footer | printable false · C-SLICE |
| O11 display | FE map labels | Settings UX | ≠ PDF invent |

---

## 10. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` clause controller | O1 DENY · QA Network assert |
| Settings catalog becomes body SoT | CORE-CL-SETTINGS · VAL fail |
| Silent issued overwrite | RETAIN CONFLICT → activate |
| Snapshot rewrite on bump | CORE-CL-SNAPSHOT · AC-PLT-CTR-CL-03 |
| Mega-EAV “for audit” | DATA HOLD · require BA/QA proof |
| Pull 09b/c/d into this WI | O8 OUT |
| Claim CORE-08 / note / printable DONE | O9/O10 · honesty footer |
| Dev invents schema because “labels missing” | Unlock **FE residual only** · labels map on FE |

---

## 11. Unlock ladder

| Step | Owner | Gate |
|------|-------|------|
| 1 | **sa** (this seat) | API F.1 **CONFIRMED RETAIN** |
| 2 | **dev-fe** | Settings UX residual — bind LIVE physical path · draft F5 · CONFLICT UX → activate · retire · display labels · **U65** · **≠** body SoT · **≠** invent Nest `/core` / schema |
| 3 | **qa** | J-HRM-CORE-09A-01..04 · Nest `/core` 0 · seals smoke · honesty false |
| 4 | **qc** | GWC seat · **DENY** module CORE/CTR UAT · **DENY** printable flip |
| **HOLD** | **dev-be** invent | **No** schema/API invent unless later residual WI proves gap (labels thin ADD ≠ mega-EAV) |

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **next_owner** | **pm** → dispatch **dev-fe** Settings UX residual (**or** QA prep if FE already fidelity-proven) |
| **Dev-BE** | **HOLD invent** — no Nest `/core` · no mega-EAV · no second body SoT |
| **Dev-FE** | Settings fidelity on LIVE `/contracts-insurance/contract-clauses*` only |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-api-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09a
depends_on: API-01 CONFIRMED RETAIN · docs/program/specs/PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · peer CORE08QC1-MSL9BFFE
spec_ref: F-CORE-CTR-CL-01..04 RETAIN · physical /contracts-insurance/contract-clauses* · paper /core alias only · BR-CTR-CL-01..04 · AC-CORE-09A-* · J-HRM-CORE-09A-01..04 DRAFT

MISSION — Settings UX residual ONLY (preserve_default · U65 · NO invent schema/API):
1) Bind Cài đặt → Thư viện điều khoản HĐ to LIVE GET/POST/PATCH/activate/retire /api/hrm/contracts-insurance/contract-clauses* — DENY Nest /core dual · DENY Settings/XBOS body SoT
2) Draft in-place PATCH 2xx + F5; issued PATCH → CONFLICT UX → POST activate bump; snapshot freeze assert path documented
3) Soft retire; {{field}} placeholders; display-ready VI status/group/pack labels (FE map OK)
4) RETAIN publish/pull consumer if already wired — NOT invent PREV/VER/PDF/TPL as DONE
5) must_keep CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY
6) DENY claim CORE-08=pillar DONE · note=FR-08 DONE · contracts_printable_ready · reopen J-CORE-08/02/01 · seed · honesty flip · Nest dual

exit: docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md · READY_FOR_QA · J-HRM-CORE-09A-01..04
```

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 **CONFIRMED RETAIN** for UC-BP-CORE-09a: cite **F-CORE-CTR-CL-01..04** on LIVE `/api/hrm/contracts-insurance/contract-clauses*` (list/create/get/update/activate/retire) · draft in-place vs issued **`HRM-CTR-CL-CODE-CONFLICT`→activate bump** · **`clauses_snapshot_json` freeze** · `{{field}}` · soft retire · display-ready FE residual · **RETAIN** F-CORE-CTR-PUB/PULL ≠ body SoT · **OUT** invent PREV/VER/PDF/TPL · must_keep CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · DATA HOLD mega-EAV · DENY Settings/XBOS body SoT · claim CORE-08=pillar DONE · note=FR-08 DONE · `contracts_printable_ready` · reopen sealed J-CORE-08/02/01 · seed · honesty flip · apps/** · C-SLICE. Unlock **Dev-FE Settings UX residual ONLY** — **not** Dev invent schema/API. |
| **next_owner** | **pm** → **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | FE Settings fidelity · J-09A DRAFT until QA · prior-body admin history remains HOLD · 09b/09c/09d peer |
