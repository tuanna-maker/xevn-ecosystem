# PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01 — API F.1 · Pack-resolve + ephemeral preview RETAIN cite (Option A · HOLD invent)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-14 seat **#16**) |
| **lane** | governance · sa |
| **change_mode** | **HOLD / RETAIN cite** **F-CORE-CTR-PACK-01** + **F-CORE-CTR-PREV-01** · **must_keep** **F-CORE-CTR-CL-01..04** · **NO ADD** Nest dual · **NO** VER invent as 09b · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · unlock **Dev-FE preview fidelity residual ONLY** · **DENY** Dev invent schema/API/VER |
| **uc_ids** | `UC-BP-CORE-09b` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-13 CORE-09a **SEALED** stamp **`CORE09AQC1-MSLA4LX9`** · peers **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · peer QA `CORE09AQA-MSLA1C9L` |
| **ref_data** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-DATA-01.md) — HOLD RETAIN pack_rules + templates + clauses + contracts · ephemeral preview · **no** VER persist as 09b · schema ADD **NOT unlock** |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-BA-01.md) · AC-CORE-09B-* · VAL-CORE-PREV-* · O1–O12 · **BR-CTR-CL-02/04** · **AC-CTR-PRINT-01..03/06..08** · J-HRM-CORE-09B-01..04 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md) Option A · F-CORE-CTR-PACK/PREV RETAIN |
| **ref_core09a_api** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md) — CL body SoT + snapshot freeze **SEALED must_keep** · **≠** printable DONE |
| **ref_core08_api** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md) — RD + payroll_link **SEALED must_keep** · **≠** pillar DONE |
| **ref_core02_api** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_api** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md) — public strip · Nest `/core` DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09b** Diễn biến **#1–#5** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · AC-CTR-PRINT-01..03 · 06..08 |
| **ref_paper_api** | **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** **RETAIN** · must_keep **F-CORE-CTR-CL-01..04** · physical `/contracts-insurance/contracts*` pack-resolve+preview · paper `/core/…` **alias only** · peers **F-CORE-CTR-VER/PDF/TPL** **OUT invent** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-09a = printable DONE · **DENY** claim CORE-08 = pillar DONE |
| **ba-data** | **ALREADY CONFIRMED HOLD** (DATA-01) — this seat **does not** re-open schema invent |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **artifact_size** | SPEC_LEN=28177 · EVID_LEN=5523 (NFD path) |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Physical pack+preview SoT GĐ1 | Nest `@Controller('contracts-insurance')` — **`/api/hrm/contracts-insurance/contracts*`** **ONLY** |
| F-CORE-CTR-PACK-01 | **RETAIN cite** LIVE `GET …/contracts/pack-resolve?employee_id=` — **HOLD invent** Nest `/core` dual pack SoT |
| F-CORE-CTR-PREV-01 | **RETAIN cite** LIVE `POST …/contracts/:id/preview` — ephemeral merge · **DENY** INSERT issued `hrm_contract_print_versions` as 09b SoT |
| Pack MVP | **`GENERAL` · `IT_OFFICE` · `DRIVER`** (labels VI: Chung · IT/văn phòng · Lái xe) · **`LOGISTICS`** optional / **not** mandatory GĐ1 AC |
| Wire codes | **`HRM-CTR-PACK-200`** · **`HRM-CTR-PREV-200`** · **`HRM-CTR-TPL-NONE`** · **`HRM-CTR-PACK-INVALID`** · **`HRM-CTR-TPL-PACK-MISMATCH`** · **`HRM-CTR-DRIVER-REQUIRED`** · **`HRM-CTR-TERM-INVALID`** · scope **`HRM-SCOPE-409` / `HRM-CTR-409` / `HRM-CTR-UNIT-SCOPE`** |
| Preview DTO | `sections` · `clauses[]` · `merged_fields` · `missing_fields[]` · `missing_clauses[]` · `can_issue` · `cb_masked` (+ template/pack meta) |
| Paper path | `/api/hrm/core/…/preview` (if cited) = **logical alias / DOC-DELTA only** — **DENY** Nest `@Controller('core')` pack/preview SoT |
| Clause consume | Bodies from CORE-09a LIVE library / template attach — **DENY** FE hardcode long legal |
| Registry | `employee_contracts` create/edit/**F5** **must_keep** (AC-CTR-PRINT-08) — preview = **ADD overlay only** |
| Peers OUT | **F-CORE-CTR-VER / PDF / TPL** invent as this WI DONE — **OUT** (09c/09d) |
| CORE-09a / 08 / 02 / 01 | **must_keep** CL body+snapshot · RD+payroll_link · packages/AuthZ/CB-403 · public strip · Nest `/core` DENY · stamps **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** |
| Envelope | **RETAIN** `{ code, message, data }` |
| U19 | pack-resolve = contract get = preview = registry list/mutate scope family |
| Display-ready | Pack label VI · clause titles · missing lists · `can_issue` · `cb_masked` — **FE residual OK** · **DENY** FE invent PDF Net / second body SoT |
| Unlock | **Dev-FE preview fidelity residual ONLY** after this **CONFIRMED RETAIN** — **DENY** Dev invent schema/API/VER · Nest `/core` |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-HRM-CORE-09A/08/02/01 |

```text
  FE «Chọn gói nghề + xem trước HĐLĐ» — UX residual only
        │  Network MUST contain /contracts-insurance/contracts/pack-resolve
        │                  and /contracts-insurance/contracts/:id/preview
        │  DENY Nest /core/* pack/preview SoT · DENY FE hardcode body · DENY VER INSERT as 09b
        ▼
  F-CORE-CTR-PACK-01  GET  /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=
        → suggested_pack · allowed_packs[] · reason · job_family
        │
  F-CORE-CTR-PREV-01  POST /api/hrm/contracts-insurance/contracts/:id/preview
        → sections · clauses[] · merged_fields · missing_* · can_issue · cb_masked
        │  EPHEMERAL — MUST NOT INSERT issued hrm_contract_print_versions
        │
        ├─► Pack MVP: GENERAL | IT_OFFICE | DRIVER  (LOGISTICS optional)
        ├─► HCNS may override pack_code BEFORE issue
        ├─► IT ↔ DRIVER → clause set + DRIVER fields differ
        ├─► 0 active template → HRM-CTR-TPL-NONE
        ├─► bad pack → HRM-CTR-PACK-INVALID
        ├─► pack≠template → HRM-CTR-TPL-PACK-MISMATCH
        ├─► DRIVER miss → missing_fields / HRM-CTR-DRIVER-REQUIRED (issue path)
        │
        ├─► Consume CORE-09a F-CORE-CTR-CL-01..04 (must_keep · no reopen rewrite)
        ├─► Registry CRUD must_keep (UF-HRM-02 / CORE-09)
        │
        └─► must_keep CORE-08 RD+payroll_link · CORE-02 · CORE-01
              Nest /core DENY · printable false · ≠ CORE-09a=printable DONE

  paper /api/hrm/core/… = alias only
  OUT invent: F-CORE-CTR-VER / PDF / TPL as CORE-09b DONE
  CORE-09a GWC ≠ printable DONE · CORE-08 GWC ≠ CORE pillar DONE
```

**Invariant CORE-PREV-PATH (O1):** Pack/preview Network **MUST** hit `/contracts-insurance/contracts*` · Nest dual `/core` pack/preview = **FAIL**.

**Invariant CORE-PREV-EPHEMERAL (O3):** Preview → **0** new issued print-version row = **PASS** · insert issued as 09b = **FAIL O3/O8**.

**Invariant CORE-PREV-CONSUME (O9):** Clause bodies from CORE-09a library — FE hardcode long legal = **FAIL**.

**Invariant CORE-PREV-GATE (O5):** `can_issue=true` with non-empty mandatory missings = **FAIL**.

**Invariant CORE-PREV-PACK-DIFF (O6):** IT↔DRIVER same clause body set = **FAIL**.

**Invariant CORE-PREV-REGISTRY (O7):** Preview overlay **MUST NOT** break registry create/edit/F5.

**Invariant CORE-PREV-PEER-OUT (O8):** VER/PDF/TPL invent as this WI DONE = **FAIL**.

**Invariant CORE-PREV-≠-09A-PRINTABLE (O9/O10):** CORE-09a GWC **≠** printable DONE · claim = **FAIL**.

**Invariant CORE-PREV-≠-08-PILLAR (O9):** CORE-08 GWC **≠** CORE pillar DONE.

**Invariant CORE-PREV-≠-PRINTABLE (O10):** Slice GWC **≠** `contracts_printable_ready=true`.

**Invariant CORE-PREV-S-SCOPE (U19):** pack-resolve = get = preview.

**Invariant CORE-PREV-DATA-HOLD:** Schema ADD without BA/QA column-gap proof = **FAIL** (DATA already HOLD).

---

## 2. AS-IS Nest baseline → residual (HOLD invent)

| Surface | LIVE (read-only cite) | Gap vs F.1 this seat |
|---------|----------------------|----------------------|
| `GET …/contracts/pack-resolve` | LIVE `ContractsInsuranceController.resolveContractPack` → `resolvePackForEmployee` · code `HRM-CTR-PACK-200` | **RETAIN** SoT — **HOLD invent** |
| Pack rules GET/PUT | LIVE `…/pack-rules` · `HRM-CTR-PACK-200` | **RETAIN** Settings residual OK |
| `POST …/contracts/:contractId/preview` | LIVE `previewContract` · code `HRM-CTR-PREV-200` · returns `PreviewResult` | **RETAIN** · **FE fidelity residual** |
| Ephemeral | `previewContract` returns DTO only — **no** issued INSERT | **RETAIN LOCK** |
| Issue/PDF peer | `POST …/print-versions` · `GET …/print-versions/:id/pdf` | **OUT invent as 09b DONE** (peer 09c) |
| Pack enum | `CONTRACT_PACK_CODES` = GENERAL/IT_OFFICE/DRIVER/LOGISTICS | MVP AC = first 3 |
| Errors | `HRM-CTR-TPL-NONE` · `PACK-INVALID` · `TPL-PACK-MISMATCH` · `DRIVER-REQUIRED` · `TERM-INVALID` | **RETAIN** — no invent rewrite |
| C&B mask | `can_view_cb` body → `cb_masked` + salary mask | **RETAIN** CORE-02 |
| Mandatory gate | `validatePreview` + `mandatoryGate` → `missing_*` · `can_issue` | **RETAIN** + FE list UX |
| Clause consume | `resolveClausesForPack` → `body_vi` from library | **must_keep** CORE-09a |
| Nest `/core/…/preview` | **ABSENT** as controller SoT | **DENY** invent · paper alias only |
| Second preview persist / mega-EAV | **ABSENT** | **HOLD** (DATA) |
| Source | `contracts-insurance.controller.ts` (~L680–695 pack-resolve · ~L1178–1194 preview) · `contract-legal-print.service.ts` `resolvePackForEmployee` · `previewContract` · `validatePreview` · `mandatoryGate` · constants | FE residual after CONFIRMED |

**FORBIDDEN invent this seat:** Nest `@Controller('core')` pack/preview SoT · second preview persist store · mega-EAV · invent VER/PDF/TPL as DONE · claim CORE-09a=printable · claim CORE-08=pillar · flip `contracts_printable_ready` · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip · `apps/**` · Dev invent schema/API.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL PACK** | **`GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=`** (+ `company_id` / headers) |
| **PHYSICAL PREV** | **`POST /api/hrm/contracts-insurance/contracts/:contractId/preview`** |
| **PHYSICAL registry** | **`/api/hrm/contracts-insurance/contracts*`** (list/get/create/update) **must_keep** |
| **PHYSICAL pack rules** | **`GET/PUT …/pack-rules`** (Settings residual) |
| **PHYSICAL CL must_keep** | **`/api/hrm/contracts-insurance/contract-clauses*`** (CORE-09a SEALED) |
| **LOGICAL (paper)** | `/api/hrm/core/…/preview` · `/core/…/pack-resolve` (if cited) |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/contracts-insurance/contracts` for pack/preview — **FAIL O1** if FE hits Nest `/core/*` as second SoT |

| Paper / logical | Physical | DB |
|-----------------|----------|-----|
| F-CORE-CTR-PACK-01 `/core/…/pack-resolve` | `/contracts-insurance/contracts/pack-resolve` | `hrm_contract_pack_rules` + employees |
| F-CORE-CTR-PREV-01 `/core/…/preview` | `/contracts-insurance/contracts/:id/preview` | templates + clauses + contracts (ephemeral DTO) |
| F-CORE-CTR-CL-01..04 | `/contract-clauses*` | `hrm_contract_clauses` **must_keep** |
| F-CORE-CTR-VER/PDF/TPL | Peer **OUT** | 09c/09d |
| F-CORE-RD-01 | CORE-08 SEALED | rewards* + discipline* |
| F-CORE-EMP-02 / SI | CORE-02 SEALED | packages\|eins |
| F-CORE-EMP-01 public | `/employees*` | CORE-01 SEALED strip |

---

## 4. Lifecycle & DTO (RETAIN — normative cite)

### 4.1 F-CORE-CTR-PACK-01 — Pack resolve response (LIVE)

| Field | Type | Rule |
|-------|------|------|
| `employee_id` | uuid | Query required |
| `job_family` | string\|null | From `custom_fields` / job_title_key |
| **`suggested_pack`** | enum | From `hrm_contract_pack_rules` (job_family match → priority; else fallback; else hard `GENERAL`) |
| **`allowed_packs`** | string[] | LIVE = full `CONTRACT_PACK_CODES` (incl. optional LOGISTICS) · **MVP AC** asserts first 3 |
| **`reason`** | string | `job_family:…` \| `fallback_rule` \| `hard_default_GENERAL` |
| Scope | — | Same `resolveScope` / `assertResourceInHrmScope` as contract get · emp 404 → `HRM-CON-404` |

**HCNS override (O2):** UI/API may pass `pack_code` on preview **before** issue — suggestion ≠ hard lock.

**Display-ready (O11):** FE **MAY** map pack → VI (`Chung` / `IT/văn phòng` / `Lái xe`) — **DENY** inventing Nest pack SoT.

### 4.2 F-CORE-CTR-PREV-01 — Preview request / response (LIVE)

| Field | Request | Response | Rule |
|-------|:-------:|:--------:|------|
| `pack_code` | opt | YES | Override suggest; must match template pack else **`HRM-CTR-TPL-PACK-MISMATCH`** |
| `template_id` / `template_code` | opt | YES | Resolve active template; 0 → **`HRM-CTR-TPL-NONE`** |
| `field_overrides` | opt | → merged | Preview-only merge |
| `can_view_cb` | opt (default true) | — | false → **`cb_masked=true`** · salary `***` |
| `sections[]` | — | YES | Grouped by `clause_group` |
| `clauses[]` | — | YES | `code` · `title_vi` · `body_vi` · version · mandatory · sort |
| `merged_fields` | — | YES | Registry + keyword_map + overrides |
| `missing_fields[]` | — | YES | Đ.21 + DRIVER keys when pack=DRIVER |
| `missing_clauses[]` | — | YES | Mandatory ACTIVE not attached |
| **`can_issue`** | — | YES | true **iff** both missing lists empty |
| **`cb_masked`** | — | YES | ACL surface · AC-CTR-PRINT-07 |
| `show_driver_license_block` | — | YES | true when pack=`DRIVER` |
| `compensation_snapshot` | — | YES\|null | Only when `can_view_cb` + package linked |
| Persist | — | **NO** | **DENY** issued VER INSERT |

### 4.3 Pack switch (O6 · AC-CTR-PRINT-03)

| Action | Expected |
|--------|----------|
| Preview with `pack_code=IT_OFFICE` | Clause set filtered by `apply_to_packs` / template pack |
| Preview with `pack_code=DRIVER` | **Different** clause set **and** DRIVER missing keys when empty · `show_driver_license_block=true` |
| Same body set for both | **FAIL O6** |

### 4.4 Ephemeral vs issue (O3 · O8)

| Call | Persist |
|------|---------|
| `POST …/preview` | **Ephemeral DTO only** |
| `POST …/print-versions` | Peer **09c** — **OUT invent as CORE-09b DONE** |
| `GET …/print-versions/:id/pdf` | Peer **09c** — **OUT** |

---

## 5. F.1 endpoint contracts (RETAIN cite)

### 5.1 F-CORE-CTR-PACK-01 — Resolve occupational pack

| | |
|--|--|
| **Mục đích** | Gợi ý gói nghề HĐLĐ theo họ nghề / quy tắc pack của pháp nhân; trả `allowed_packs` để HCNS chọn/đổi trước khi xem trước / phát hành. |
| **Nghiệp vụ xử lý** | AuthZ · `resolveScope` · load employee in expanded company ids · `assertResourceInHrmScope` · đọc `hrm_contract_pack_rules` (priority ASC) · match `job_family` → else fallback → else `GENERAL` · return suggested + allowed + reason. **Không** ghi DB. |
| **Tham chiếu bước SRS** | **UC-BP-CORE-09b** Diễn biến **#1 / #2 / #5** · AC-CORE-09B-01 · AC-CTR-PRINT (pack suggest) · **O1/O2** · BR-CTR-CL-02 (pack context) |
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` |
| **Success** | `200` · `HRM-CTR-PACK-200` · `{ employee_id, job_family, suggested_pack, allowed_packs[], reason }` |
| **Errors** | `HRM-CON-404` · `HRM-CTR-409` / scope · `HRM-CTR-PACK-INVALID` (on rules write / requirePack consumers) |

### 5.2 F-CORE-CTR-PREV-01 — Ephemeral merge preview

| | |
|--|--|
| **Mục đích** | Ghép mẫu + điều khoản ACTIVE theo gói + field registry/Đ.21 thành **bản xem trước** văn bản HĐLĐ; liệt kê thiếu bắt buộc; che C&B khi thiếu quyền — **không** phát hành bản in. |
| **Nghiệp vụ xử lý** | Load contract (U19) · resolve **active** template for pack · pack↔template assert · `resolveClausesForPack` (CORE-09a bodies) · merge keyword_map + MergeToken registry + overrides · `validatePreview` (Đ.21 + DRIVER) · `mandatoryGate` · C&B mask · compute `can_issue` · **return DTO only** (no issued VER INSERT). |
| **Tham chiếu bước SRS** | Diễn biến **#2–#4** · **AC-CTR-PRINT-01..03 · 06..08** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · AC-CORE-09B-02.. · **O3–O7/O11** |
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:contractId/preview` |
| **Success** | `200` · `HRM-CTR-PREV-200` · `PreviewResult` (may `can_issue=false`) |
| **Errors** | `HRM-CTR-TPL-NONE` · `HRM-CTR-PACK-INVALID` · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TERM-INVALID` · contract/scope 404/409 · Auth deny |

### 5.3 Pack rules admin (RETAIN — Settings residual)

| | |
|--|--|
| **Mục đích** | HCNS cấu hình quy tắc gợi ý gói (job_family / fallback). |
| **Nghiệp vụ** | GET/PUT `…/pack-rules` trên `hrm_contract_pack_rules` — **ONE SoT** · **≠** JD pack dual-write. |
| **SRS** | O2 Settings · DATA VAL-CORE-PREV-DATA-01 |
| **METHOD / path** | `GET/PUT /api/hrm/contracts-insurance/…/pack-rules` (LIVE controller) |
| **Success** | `HRM-CTR-PACK-200` |

### 5.4 must_keep — F-CORE-CTR-CL-01..04 (CORE-09a SEALED)

| | |
|--|--|
| **Mục đích** | Thư viện điều khoản = SoT `body_vi` cho preview consume. |
| **Rule** | **RETAIN** physical `/contract-clauses*` · draft in-place · issued CONFLICT→activate · snapshot freeze · **DENY** reopen rewrite · **DENY** FE hardcode |
| **Stamp** | **`CORE09AQC1-MSLA4LX9`** · **≠** printable DONE |

### 5.5 OUT invent peers (not this WI DONE)

| Paper | Peer UC | Rule |
|-------|---------|------|
| **F-CORE-CTR-VER** | UC-BP-CORE-09c | Print-version persist / issue |
| **F-CORE-CTR-PDF** | UC-BP-CORE-09c | PDF/HTML render of **issued** version |
| **F-CORE-CTR-TPL** catalog invent DONE | UC-BP-CORE-09d | Open TPL catalog as DONE — preview **may** resolve existing active template without claiming 09d DONE |

---

## 6. Error taxonomy (RETAIN — no invent rewrite)

| Code | HTTP | Meaning |
|------|------|---------|
| `HRM-CTR-PACK-200` | 200 | Pack resolve / pack-rules OK |
| `HRM-CTR-PREV-200` | 200 | Ephemeral preview OK (may `can_issue=false`) |
| `HRM-CTR-TPL-NONE` | 4xx | 0 active non-archived template for pack |
| `HRM-CTR-PACK-INVALID` | 400 | Unknown / OOS pack_code |
| `HRM-CTR-TPL-PACK-MISMATCH` | 4xx | Request pack ≠ template `pack_code` |
| `HRM-CTR-DRIVER-REQUIRED` | 400 | DRIVER required fields missing (issue path / hard gate) |
| `HRM-CTR-TERM-INVALID` | 400 | Bad term_type |
| `HRM-CTR-ISSUE-BLOCKED` | 4xx | Peer 09c — preview `can_issue=false` blocks issue |
| `HRM-CON-404` / `HRM-CTR-CL-404` | 404 | Missing resource / out of scope |
| `HRM-CTR-409` / `HRM-SCOPE-409` / `HRM-CTR-UNIT-SCOPE` | 409 | Scope mismatch |
| Sealed `HRM-CTR-CL-*` / `HRM-CORE-RD-*` / `HRM-CORE-CB-*` | — | **DENY** rewrite · must_keep |

---

## 7. Scope parity (U19)

| Surface | Same resolver family |
|---------|----------------------|
| Pack resolve | `GET …/contracts/pack-resolve` · `resolvePackForEmployee` + `assertResourceInHrmScope` |
| Contract get | `GET …/contracts/:id` · `getContractById` / `loadContractForPrint` |
| Preview | `POST …/contracts/:id/preview` · same expanded company ids |
| Registry list/mutate | `/contracts-insurance/contracts*` |

**Flag `scope_parity`:** pack-resolve / list returns id but get/preview 404 under group CEO `main` = **P0**.

**J-* DRAFT (BA):** `J-HRM-CORE-09B-01..04` — open+pack suggest · preview text layout · pack switch + C&B mask · mandatory block + Nest `/core` 0 + CORE-09a/08/02/01 regression + registry F5.

---

## 8. must_keep & DENY

| Item | Rule |
|------|------|
| LIVE pack + preview spine | `/contracts-insurance/contracts/pack-resolve` + `…/contracts/:id/preview` |
| Ephemeral preview | **no** issued VER INSERT as 09b |
| CORE-09a | F-CORE-CTR-CL-01..04 · body SoT + snapshot freeze · stamp **`CORE09AQC1-MSLA4LX9`** · **≠** printable DONE · J-HRM-CORE-09A-01..04 RETAIN |
| CORE-08 | rewards* + discipline* + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE |
| CORE-02 | packages/eins · AuthZ-403 · CB-403 · stamp **`CORE02QC1-MSL80DU6`** |
| CORE-01 | public strip · stamp **`CORE01QC1-MSL6WMS7`** |
| Nest `/core` | **DENY** pack/preview SoT |
| Schema ADD / mega-EAV / second preview store | **HOLD** (DATA) · **NOT unlock** this seat |
| 09c VER/PDF · 09d TPL | **OUT invent** as this WI DONE |
| Honesty | printable / recruitment / jd / CORE UAT **false** · C-SLICE |
| Seed / apps/** | **DENY** this seat |
| Reopen sealed J-HRM-CORE-09A/08/02/01 | **DENY** without regression |
| Dev invent schema/API/VER | **DENY** — FE preview fidelity residual only |

---

## 9. Traceability (requirement → API → FE → test)

| BR / AC | API | FE / J-* | Test expect |
|---------|-----|----------|-------------|
| O1 · BR-CORE-PREV-PATH | PACK-01 · PREV-01 physical | J-09B-01/02 | Nest `/core` 0 |
| O2 · AC-CORE-09B-01 | PACK-01 | J-09B-01 | suggested + allowed VI |
| O3 · AC-CTR-PRINT-02 · AC-CORE-09B-02 | PREV-01 ephemeral | J-09B-02 | Text layout · no VER INSERT |
| O4 · AC-CTR-PRINT-07 | PREV-01 `cb_masked` | J-09B-03 | Non-C&B mask |
| O5 · AC-CTR-PRINT-01/06 · BR-CTR-CL-02/04 | PREV-01 gate · TPL-NONE | J-09B-04 | `can_issue=false` + lists |
| O6 · AC-CTR-PRINT-03 | PREV pack switch | J-09B-03 | IT↔DRIVER diff |
| O7 · AC-CTR-PRINT-08 | registry CTR | J-09B-04 | F5 CRUD PASS |
| O8 peers OUT | VER/PDF/TPL | — | OUT invent DONE |
| O9 must_keep | sealed CL/RD/CB/public | J-09B-04 smoke | ≠ printable · ≠ pillar |
| O10 honesty | — | evidence footer | printable false · C-SLICE |
| O11 display | FE map VI | preview UX | ≠ PDF invent · ≠ hardcode body |
| U19 | pack=get=preview | Group CEO | scope_parity |

---

## 10. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` pack/preview controller | O1 DENY · QA Network assert |
| Preview writes issued VER «for convenience» | O3/O8 ephemeral lock · peer 09c |
| FE hardcodes legal clause body | CORE-PREV-CONSUME · BR-CTR-CL-03 |
| Claim CORE-09a GWC = printable | O9/O10 · honesty footer |
| Fold 09c/09d into 09b DONE | O8 OUT · peer seats |
| Break registry CRUD | O7 must_keep · AC-CTR-PRINT-08 |
| Schema ADD without gap proof | DATA HOLD · CORE-PREV-DATA-HOLD |
| Dev invents API because “labels missing” | Unlock **FE residual only** · VI map on FE |

---

## 11. Unlock ladder

| Step | Owner | Gate |
|------|-------|------|
| 1 | **sa** (this seat) | API F.1 **CONFIRMED RETAIN** |
| 2 | **dev-fe** | Preview fidelity residual — bind LIVE pack-resolve + preview · pack VI · text layout · IT↔DRIVER · `cb_masked` · missing lists · `can_issue` · registry F5 intact · **U65** · **≠** invent Nest `/core` / schema / VER |
| 3 | **qa** | J-HRM-CORE-09B-01..04 · Nest `/core` 0 · seals smoke · honesty false · ephemeral assert |
| 4 | **qc** | GWC seat · **DENY** module CORE/CTR UAT · **DENY** printable flip · **DENY** CORE-09a=printable |
| **HOLD** | **dev-be** invent | **No** schema/API/VER invent unless later residual WI proves gap |

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **next_owner** | **pm** → dispatch **dev-fe** preview fidelity residual (**or** QA prep if FE already fidelity-proven) |
| **Dev-BE** | **HOLD invent** — no Nest `/core` · no mega-EAV · no VER as 09b · no second preview store |
| **Dev-FE** | Preview fidelity on LIVE `/contracts-insurance/contracts*` pack-resolve+preview only |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-api-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09B-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09b
depends_on: API-01 CONFIRMED RETAIN · docs/program/specs/PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · peer CORE09AQC1-MSLA4LX9
spec_ref: F-CORE-CTR-PACK-01 · F-CORE-CTR-PREV-01 RETAIN · physical /contracts-insurance/contracts* pack-resolve+preview · paper /core alias only · ephemeral no VER INSERT · BR-CTR-CL-02/04 · AC-CTR-PRINT-01..03/06..08 · J-HRM-CORE-09B-01..04 DRAFT

MISSION — Preview fidelity residual ONLY (preserve_default · U65 · NO invent schema/API/VER):
1) Bind HĐLĐ pack suggest + preview to LIVE GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id= + POST …/contracts/:id/preview — DENY Nest /core dual
2) Pack MVP GENERAL/IT_OFFICE/DRIVER VI labels; HCNS override; IT↔DRIVER clause+field diff; show DRIVER block when pack=DRIVER
3) Ephemeral preview: sections/clauses/merged_fields/missing_*/can_issue/cb_masked — DENY INSERT issued print-version; DENY FE hardcode long legal body
4) Surface TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH / DRIVER missings; registry create/edit/F5 must_keep
5) must_keep CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY
6) DENY invent 09c VER/PDF · 09d TPL as DONE · claim CORE-09a=printable · contracts_printable_ready · reopen J-HRM-CORE-09A/08/02/01 · seed · honesty flip

exit: docs/qa/evidence/po-hrm-mvp-gd1-core-09b-cluster-fe-01.md · READY_FOR_QA · J-HRM-CORE-09B-01..04
```

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 **CONFIRMED RETAIN** for UC-BP-CORE-09b: cite **F-CORE-CTR-PACK-01** on LIVE `GET /api/hrm/contracts-insurance/contracts/pack-resolve?employee_id=` · cite **F-CORE-CTR-PREV-01** on LIVE `POST …/contracts/:id/preview` (ephemeral `sections`/`clauses`/`merged_fields`/`missing_*`/`can_issue`/`cb_masked` · **no** issued VER INSERT) · pack MVP GENERAL/IT_OFFICE/DRIVER · wire **TPL-NONE** / **PACK-INVALID** / **TPL-PACK-MISMATCH** / **DRIVER-REQUIRED** · display-ready VI · U19 pack-resolve=get=preview · must_keep F-CORE-CTR-CL-01..04 · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · registry CRUD · **OUT** invent 09c VER/PDF · 09d TPL as DONE · DENY claim CORE-09a=printable · `contracts_printable_ready` · reopen sealed J-HRM-CORE-09A/08/02/01 · seed · honesty flip · apps/** · C-SLICE. Unlock **Dev-FE preview fidelity residual ONLY** — **not** Dev invent schema/API/VER. |
| **next_owner** | **pm** → **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | FE preview fidelity · J-09B DRAFT until QA · schema ADD remains HOLD · 09c/09d peer |
