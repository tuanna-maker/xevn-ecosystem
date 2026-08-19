# PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01 — API F.1 · Issued VER + PDF RETAIN cite (Option A · HOLD invent)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-15 seat **#17**) |
| **lane** | governance · sa |
| **change_mode** | **HOLD / RETAIN cite** **F-CORE-CTR-VER-01** · **F-CORE-CTR-VER-02** · **F-CORE-CTR-PDF-01** · **must_keep** **F-CORE-CTR-PACK-01** + **F-CORE-CTR-PREV-01** ephemeral · **must_keep** **F-CORE-CTR-CL-01..04** · **NO ADD** Nest dual · **NO** invent endpoints/schema · **NO** rewrite PREV→INSERT VER · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · unlock **Dev-FE save VER + PDF U65 fidelity residual ONLY** · **Dev-BE HOLD** unless residual wire gap proven · **DENY** Dev invent schema/API/endpoints |
| **uc_ids** | `UC-BP-CORE-09c` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · Wave-14 CORE-09b **SEALED** stamp **`CORE09BQC1-MSLB05DZ`** · peers **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · peer QA `CORE09BQA-MSLAWKV6` |
| **ref_data** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-DATA-01.md) — HOLD RETAIN `hrm_contract_print_versions` + denorm pack/template · snapshot freeze · **no** mega-EAV · schema ADD **NOT unlock** |
| **ref_ba** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-BA-01.md) · AC-CORE-09C-* · VAL-CORE-VER-* · O1–O12 · **BR-CTR-CL-01/02/04** · **AC-CTR-PRINT-01/04/05/06/08** · J-HRM-CORE-09C-01..04 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md) Option A · F-CORE-CTR-VER/PDF RETAIN |
| **ref_core09b_api** | [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-API-01.md) — PACK+PREV ephemeral **SEALED must_keep** · **≠** printable DONE |
| **ref_core09a_api** | [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-API-01.md) — CL body SoT + snapshot freeze **SEALED must_keep** |
| **ref_core08_api** | [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md) — RD + payroll_link **SEALED must_keep** · **≠** pillar DONE |
| **ref_core02_api** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md) — packages/eins · AuthZ/CB-403 |
| **ref_core01_api** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md) — public strip · Nest `/core` DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09c** Diễn biến **#1–#5** · **BR-CTR-CL-01** · **BR-CTR-CL-02** · **BR-CTR-CL-04** · AC-CTR-PRINT-01 · 04 · 05 · 06 · 08 |
| **ref_paper_api** | **F-CORE-CTR-VER-01** · **F-CORE-CTR-VER-02** · **F-CORE-CTR-PDF-01** **RETAIN** · must_keep **F-CORE-CTR-PACK-01** + **F-CORE-CTR-PREV-01** ephemeral · must_keep **F-CORE-CTR-CL-01..04** · physical `/contracts-insurance/*` · paper `/core/…` **alias only** · peers **F-CORE-CTR-TPL** **OUT invent DONE** as 09d |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · **C-SLICE** · U65 · **DENY** claim CORE-09b = printable DONE · **DENY** invent 09d TPL as this WI DONE |
| **Carry OBS** | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → peer **UC-BP-CORE-09d** (idle-ok this seat — **not** invent TPL DONE here) |
| **ba-data** | **ALREADY CONFIRMED HOLD** (DATA-01) — this seat **does not** re-open schema invent |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **artifact_size** | SPEC_LEN=35616 · EVID_LEN=5830 (NFD path) |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Physical VER+PDF SoT GĐ1 | Nest `@Controller('contracts-insurance')` — **`/api/hrm/contracts-insurance/*`** **ONLY** |
| F-CORE-CTR-VER-01 | **RETAIN cite** LIVE `POST …/contracts/:contractId/print-versions` — server **re-run** `previewContract` + **`can_issue`** gate · INSERT `status=issued` · freeze snapshots · supersede prior · denorm pack/template |
| F-CORE-CTR-VER-02 | **RETAIN cite** LIVE `GET …/contracts/:contractId/print-versions` + `GET …/contracts/:contractId/print-versions/:versionId` — display-ready · soft `archived_at IS NULL` |
| F-CORE-CTR-PDF-01 | **RETAIN cite** LIVE `GET …/print-versions/:versionId/pdf` — **pdfkit from issued snapshot only** · optional `?format=html` debug · **DENY** live-library re-merge |
| Wire codes | **`HRM-CTR-VER-201`** · **`HRM-CTR-VER-200`** · **`HRM-CTR-ISSUE-BLOCKED`** · **`HRM-CTR-DRIVER-REQUIRED`** · **`HRM-CTR-TERM-INVALID`** · **`HRM-CTR-TPL-NONE`** · **`HRM-CTR-VERSION-NOT-ISSUED`** · **`HRM-CTR-PV-404`** · **`HRM-CTR-RENDER-FAIL`** · **`HRM-CTR-PACK-INVALID`** · **`HRM-CTR-TPL-PACK-MISMATCH`** · scope **`HRM-SCOPE-409` / `HRM-CTR-409` / `HRM-CTR-UNIT-SCOPE`** |
| Paper path | `/api/hrm/core/…/print-versions*` (if cited) = **logical alias / DOC-DELTA only** — **DENY** Nest `@Controller('core')` VER/PDF SoT |
| PREV / PACK | CORE-09b **must_keep ephemeral** — **DENY** rewrite PREV→INSERT VER as this seat SoT |
| Clause consume | Bodies from CORE-09a LIVE library at issue → freeze into `clauses_snapshot_json` — **DENY** FE hardcode legal |
| Registry | `employee_contracts` create/edit/**F5** **must_keep** (AC-CTR-PRINT-08) — VER/PDF = **ADD overlay only** |
| Peers OUT | **F-CORE-CTR-TPL** invent DONE as this WI — **OUT** (09d) · carry **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** |
| CORE-09b / 09a / 08 / 02 / 01 | **must_keep** PACK+PREV · CL+snapshot · RD+payroll_link · packages/AuthZ/CB-403 · public strip · Nest `/core` DENY · stamps **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** |
| Envelope | **RETAIN** `{ code, message, data }` for VER JSON · PDF = binary `application/pdf` (not JSON envelope) |
| U19 | contract get = VER create = list = get-by-id = PDF — same `resolveHrmListScope` / `loadContractForPrint` / `assertResourceInHrmScope` family as pack-resolve + preview |
| Display-ready | `version_no` · `pack_code` · status · issued_at · template_code · cb mask on snapshot read · PDF Blob — **FE residual OK** · **DENY** FE invent PDF by re-merging live library |
| Unlock | **Dev-FE save VER + PDF U65 fidelity residual ONLY** after this **CONFIRMED RETAIN** — **Dev-BE HOLD** unless residual wire gap proven — **DENY** Dev invent schema/API/endpoints · Nest `/core` |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** reopen sealed J-HRM-CORE-09B/09A/08/02/01 · **NO** claim CORE-09b=printable · **NO** flip `contracts_printable_ready` |

```text
  FE «Lưu phiên bản + In/PDF HĐLĐ» — UX residual only
        │  Network MUST contain /contracts-insurance/contracts/:id/print-versions
        │                  and /contracts-insurance/print-versions/:versionId/pdf
        │  DENY Nest /core/* VER/PDF SoT · DENY FE invent PDF from live remerge
        │  DENY rewrite PREV→INSERT VER · DENY invent 09d TPL as DONE
        ▼
  F-CORE-CTR-VER-01  POST /api/hrm/contracts-insurance/contracts/:contractId/print-versions
        → re-run previewContract (server) · !can_issue → ISSUE-BLOCKED / DRIVER / TERM / TPL-NONE
        → supersede prior issued · INSERT status=issued · freeze merged/clauses/comp
        → denorm pack/template on employee_contracts · HRM-CTR-VER-201
        │
  F-CORE-CTR-VER-02  GET …/contracts/:contractId/print-versions
                     GET …/contracts/:contractId/print-versions/:versionId
        → list/detail display-ready · archived_at IS NULL · HRM-CTR-VER-200
        │
  F-CORE-CTR-PDF-01  GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf
        → status must be issued · render from SNAPSHOT only (pdfkit) · %PDF
        → ?format=html debug only · HRM-CTR-VERSION-NOT-ISSUED / RENDER-FAIL
        │
        ├─► Consume CORE-09b PACK+PREV (ephemeral must_keep · can_issue gate)
        ├─► Consume CORE-09a CL bodies → clauses_snapshot_json freeze
        ├─► Registry CRUD must_keep (UF-HRM-02 / CORE-09)
        │
        └─► must_keep CORE-08 RD+payroll_link · CORE-02 · CORE-01
              Nest /core DENY · printable false · ≠ CORE-09b=printable DONE

  paper /api/hrm/core/… = alias only
  OUT invent: F-CORE-CTR-TPL catalog as CORE-09c DONE (peer 09d)
  CORE-09b GWC ≠ printable DONE · C-SLICE ≠ module UAT
```

**Invariant CORE-VER-PATH (O1):** Save/list/get/PDF Network **MUST** hit `/contracts-insurance/*` · Nest dual `/core` VER/PDF = **FAIL**.

**Invariant CORE-VER-GATE (O2):** VER INSERT when `can_issue=false` / missing mandatory = **FAIL** · must return ISSUE-BLOCKED (or DRIVER/TERM/TPL-NONE) + missing lists · **DENY** FE-trusted issue.

**Invariant CORE-VER-SNAPSHOT (O3):** PDF from live-library re-merge (not issued snapshot) = **FAIL** · BR-CTR-CL-01 · AC-CTR-PRINT-05.

**Invariant CORE-VER-AMEND (O4):** Silent overwrite of prior issued row (no supersede + new `version_no`) = **FAIL**.

**Invariant CORE-VER-PREV-KEEP (O5):** Preview path INSERT issued VER = **FAIL** · must_keep stamp **`CORE09BQC1-MSLB05DZ`**.

**Invariant CORE-VER-F5 (O6):** After VER 201, list/detail + F5 mất pack/`version_no` = **FAIL** · AC-CTR-PRINT-04.

**Invariant CORE-VER-REGISTRY (O7):** VER/PDF overlay breaks registry create/edit/F5 = **FAIL** · AC-CTR-PRINT-08.

**Invariant CORE-VER-PEER-OUT (O8):** Invent 09d TPL catalog as this WI DONE = **FAIL**.

**Invariant CORE-VER-≠-09B-PRINTABLE (O9/O10):** CORE-09b GWC **≠** printable DONE · claim = **FAIL**.

**Invariant CORE-VER-≠-PRINTABLE (O10):** Slice GWC later **≠** `contracts_printable_ready=true` without named QA printable U65.

**Invariant CORE-VER-S-SCOPE (U19):** contract get = create = list = get = PDF.

**Invariant CORE-VER-DATA-HOLD:** Schema ADD without BA/QA column-gap proof = **FAIL** (DATA already HOLD).

---

## 2. AS-IS Nest baseline → residual (HOLD invent)

| Surface | LIVE (read-only cite) | Gap vs F.1 this seat |
|---------|----------------------|----------------------|
| `POST …/contracts/:contractId/print-versions` | LIVE `ContractsInsuranceController.createPrintVersion` → `createPrintVersion` · code **`HRM-CTR-VER-201`** | **RETAIN** SoT — **HOLD invent** · **FE save fidelity residual** |
| Issue gate | `createPrintVersion` → `previewContract` · `!can_issue` → DRIVER / TERM / **`HRM-CTR-ISSUE-BLOCKED`** | **RETAIN LOCK** |
| Supersede + INSERT | UPDATE prior `issued`→`superseded` · MAX(`version_no`)+1 · INSERT freeze JSON · denorm pack/template | **RETAIN** |
| `GET …/print-versions` | LIVE `listPrintVersions` · `archived_at IS NULL` · ORDER BY `version_no` DESC · **`HRM-CTR-VER-200`** | **RETAIN** · FE list UX residual |
| `GET …/print-versions/:versionId` | LIVE `getPrintVersionById` · scope assert · **`HRM-CTR-PV-404`** · **`HRM-CTR-VER-200`** | **RETAIN** |
| `GET …/print-versions/:versionId/pdf` | LIVE `renderPrintVersionPdf` · issued-only · pdfkit from snapshot · optional `?format=html` · **`HRM-CTR-VERSION-NOT-ISSUED`** · **`HRM-CTR-RENDER-FAIL`** | **RETAIN** · **FE PDF fidelity residual** |
| Display | `displayPrintVersion` · `can_view_cb` mask salary / compensation | **RETAIN** CORE-02 |
| Pack/PREV must_keep | `GET …/pack-resolve` · `POST …/preview` ephemeral | **must_keep** CORE-09b · **DENY** PREV→INSERT rewrite |
| CL must_keep | `/contract-clauses*` | **must_keep** CORE-09a |
| Nest `/core/…/print-versions` | **ABSENT** as controller SoT | **DENY** invent · paper alias only |
| Second VER store / mega-EAV | **ABSENT** | **HOLD** (DATA) |
| Source | `contracts-insurance.controller.ts` (~L697–728 pdf · ~L1196–1247 VER) · `contract-legal-print.service.ts` `createPrintVersion` · `listPrintVersions` · `getPrintVersionById` · `renderPrintVersionPdf` · `displayPrintVersion` · `contract-print-pdf.renderer.ts` · DTO `CreatePrintVersionDto` · constants VER/ISSUE/PDF | FE residual after CONFIRMED |

**FORBIDDEN invent this seat:** Nest `@Controller('core')` VER/PDF SoT · second VER store · mega-EAV · wipe print_versions · rewrite PREV→INSERT VER · invent 09d TPL as DONE · claim CORE-09b=printable · flip `contracts_printable_ready` · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip · `apps/**` · Dev invent schema/API/endpoints.

---

## 3. Path & alias lock (O1)

| Plane | Path |
|-------|------|
| **PHYSICAL VER create** | **`POST /api/hrm/contracts-insurance/contracts/:contractId/print-versions`** |
| **PHYSICAL VER list** | **`GET /api/hrm/contracts-insurance/contracts/:contractId/print-versions`** |
| **PHYSICAL VER get** | **`GET /api/hrm/contracts-insurance/contracts/:contractId/print-versions/:versionId`** |
| **PHYSICAL PDF** | **`GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf`** (+ optional `?format=html`) |
| **PHYSICAL PREV must_keep** | **`POST …/contracts/:contractId/preview`** (ephemeral — **no** issued INSERT) |
| **PHYSICAL PACK must_keep** | **`GET …/contracts/pack-resolve?employee_id=`** |
| **PHYSICAL CL must_keep** | **`/api/hrm/contracts-insurance/contract-clauses*`** (CORE-09a SEALED) |
| **PHYSICAL registry** | **`/api/hrm/contracts-insurance/contracts*`** (list/get/create/update) **must_keep** |
| **LOGICAL (paper)** | `/api/hrm/core/…/print-versions*` · `/core/…/pdf` (if cited) |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. Gateway rewrite optional — **not** unlock-gate. |
| QA Network assert | Path **contains** `/contracts-insurance` for VER/PDF — **FAIL O1** if FE hits Nest `/core/*` as second SoT |

| Paper / logical | Physical | DB |
|-----------------|----------|-----|
| F-CORE-CTR-VER-01 `/core/…/print-versions` POST | `/contracts-insurance/contracts/:id/print-versions` POST | `hrm_contract_print_versions` INSERT issued |
| F-CORE-CTR-VER-02 list/get | `/contracts-insurance/contracts/:id/print-versions*` GET | same table SELECT |
| F-CORE-CTR-PDF-01 `/core/…/pdf` | `/contracts-insurance/print-versions/:versionId/pdf` | snapshot JSON → pdfkit |
| F-CORE-CTR-PACK/PREV | CORE-09b SEALED | pack_rules + ephemeral DTO |
| F-CORE-CTR-CL-01..04 | `/contract-clauses*` | `hrm_contract_clauses` **must_keep** |
| F-CORE-CTR-TPL | Peer **OUT invent DONE** | 09d |
| F-CORE-RD-01 | CORE-08 SEALED | rewards* + discipline* |
| F-CORE-EMP-02 / SI | CORE-02 SEALED | packages\|eins |
| F-CORE-EMP-01 public | `/employees*` | CORE-01 SEALED strip |

---

## 4. Lifecycle & DTO (RETAIN — normative cite)

### 4.1 F-CORE-CTR-VER-01 — Create / issue request (LIVE `CreatePrintVersionDto`)

| Field | Request | Rule |
|-------|:-------:|------|
| `template_id` | opt UUID | Resolve active template |
| `template_code` | opt string | Alt resolve |
| `pack_code` | opt (required if no template_id/code) | Override suggest; must match template pack else **`HRM-CTR-TPL-PACK-MISMATCH`** |
| `field_overrides` | opt object | Passed into server re-preview merge |
| `can_view_cb` | opt bool (default true) | Controls display mask on returned VER DTO |

### 4.2 Issue algorithm (O2 · O3 · O4 — LOCK)

```text
1) ensureSchema (LIVE HOLD — no ADD this seat)
2) preview = previewContract(contractId, payload, scope…)   // server re-preview
3) if !preview.can_issue:
     DRIVER miss + pack=DRIVER → HRM-CTR-DRIVER-REQUIRED
     term dates miss → HRM-CTR-TERM-INVALID
     else → HRM-CTR-ISSUE-BLOCKED (+ missing_fields / missing_clauses)
     // TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH may throw earlier inside preview
4) UPDATE hrm_contract_print_versions SET status='superseded'
     WHERE contract_id=? AND status='issued' AND archived_at IS NULL
5) version_no = MAX(version_no)+1
6) INSERT status='issued' with:
     pack_code · template_id · template_code · template_version
     merged_fields_json (preview.merged_fields + _meta.template_code)
     clauses_snapshot_json (preview.clauses)
     compensation_snapshot_json (preview.compensation_snapshot | null)
     issued_at=NOW() · issued_by
7) UPDATE employee_contracts SET pack_code, template_id, template_code
8) return displayPrintVersion(row, can_view_cb)
```

**DENY:** FE-trusted issue without server re-preview · mutate issued snapshot body · silent overwrite without supersede · PREV path doing steps 4–7.

### 4.3 F-CORE-CTR-VER-02 — List / get response (LIVE display)

| Field | Type | Rule |
|-------|------|------|
| `id` | uuid | Version id |
| `contract_id` · `company_id` | uuid / text | Soft FK + scope |
| **`version_no`** | int | Monotonic · amend = +1 |
| **`pack_code`** | text | Frozen at issue |
| `template_id` · **`template_code`** · `template_version` | uuid/text/int | Frozen · column wins over `_meta` |
| **`merged_fields_json`** | object | Frozen merge · salary `***` when `!can_view_cb` |
| **`clauses_snapshot_json`** | array | Frozen `{code, title_vi, body_vi, …}` |
| **`compensation_snapshot_json`** | object\|null | ACL · mask `{masked:true}` when `!can_view_cb` |
| **`status`** | enum | `draft_preview` \| **`issued`** \| **`superseded`** |
| `issued_at` · `issued_by` | timestamptz / text | Audit |
| `pdf_artifact_ref` | text\|null | Optional storage key — render SoT remains snapshot |
| List envelope | `{ total, data[] }` | Soft exclude `archived_at` set · ORDER `version_no` DESC |

### 4.4 F-CORE-CTR-PDF-01 — PDF render (O3 · O11)

| Rule | Expected |
|------|----------|
| Load version via `getPrintVersionById` (same U19 scope) | 404 → **`HRM-CTR-PV-404`** |
| `status !== 'issued'` | **`HRM-CTR-VERSION-NOT-ISSUED`** 400 |
| Render input | `merged_fields_json` + `clauses_snapshot_json` from **issued row only** |
| Default | `application/pdf` · body starts **`%PDF`** · pdfkit · headers `X-HRM-PDF-Stub: false` · `X-HRM-PDF-Engine: pdfkit` |
| `?format=html` | debug HTML only — **not** primary U65 SoT |
| Engine fail | **`HRM-CTR-RENDER-FAIL`** 500 |
| **DENY** | Re-merge live library / FE invent Net PDF from live clauses |

### 4.5 Amend (O4 · FR-09c #5)

| Action | Expected |
|--------|----------|
| Second successful POST print-versions | New `version_no` · prior `issued` → `superseded` · prior snapshot body **unchanged** |
| Silent overwrite prior issued row | **FAIL O4** |

### 4.6 PREV vs VER (O5 · must_keep)

| Call | Persist |
|------|---------|
| `POST …/preview` | **Ephemeral DTO only** · `ver_insert_posts=0` **must_keep** CORE-09b |
| `POST …/print-versions` | **THIS seat SoT** — issued INSERT |
| `GET …/pdf` | Render from issued snapshot |

---

## 5. F.1 endpoint contracts (RETAIN cite)

### 5.1 F-CORE-CTR-VER-01 — Issue / save print version

| | |
|--|--|
| **Mục đích** | Phát hành **phiên bản in HĐLĐ** đã khóa: server xác nhận đủ điều kiện (`can_issue`), đóng băng snapshot (fields + clauses + C&B khi ACL), đánh số `version_no`, supersede bản issued trước — phục vụ list/F5 và PDF. |
| **Nghiệp vụ xử lý** | AuthZ · `resolveScopeContext` · **re-run** `previewContract` (cùng DTO pack/template/overrides/`can_view_cb`) · nếu `!can_issue` → 400 ISSUE-BLOCKED / DRIVER / TERM (+ missing lists; TPL-NONE/PACK/TPL-MISMATCH từ preview) · load contract U19 · supersede prior `issued` · INSERT `hrm_contract_print_versions` `status=issued` freeze three JSON cols · denorm `pack_code`/`template_*` trên `employee_contracts` · return display DTO (mask C&B khi thiếu quyền). **DENY** FE-trusted issue · **DENY** mutate prior issued snapshot. |
| **Tham chiếu bước SRS** | **FR-UC-BP-CORE-09c** Diễn biến **#1** (Lưu phiên bản) · **#5** (phụ lục/amend) · **AC-CTR-PRINT-01/04/06** · **BR-CTR-CL-01/02/04** · AC-CORE-09C-01 · **O1/O2/O4/O6** |
| **METHOD / path** | `POST /api/hrm/contracts-insurance/contracts/:contractId/print-versions` |
| **DTO ↔ DB (DATA-01)** | Request `CreatePrintVersionDto` → preview → INSERT cols: `id` · `contract_id` · `company_id` · `version_no` · `pack_code` · `template_id` · `template_code` · `template_version` · `merged_fields_json` · `clauses_snapshot_json` · `compensation_snapshot_json` · `status=issued` · `issued_at` · `issued_by` · denorm UPDATE `employee_contracts.pack_code/template_id/template_code` |
| **Success** | `201` · envelope code **`HRM-CTR-VER-201`** · displayPrintVersion row |
| **Errors** | **`HRM-CTR-ISSUE-BLOCKED`** · **`HRM-CTR-DRIVER-REQUIRED`** · **`HRM-CTR-TERM-INVALID`** · **`HRM-CTR-TPL-NONE`** · **`HRM-CTR-PACK-INVALID`** · **`HRM-CTR-TPL-PACK-MISMATCH`** · contract/scope 404/409 · Auth deny |

### 5.2 F-CORE-CTR-VER-02 — List / get print versions

| | |
|--|--|
| **Mục đích** | Hiển thị lịch sử phiên bản in đã phát hành (và superseded) theo hợp đồng — `pack_code` + `version_no` + status + issued_at — để HCNS xác nhận sau Lưu và sau F5. |
| **Nghiệp vụ xử lý** | **List:** load contract U19 · SELECT print_versions `archived_at IS NULL` + company filter · ORDER `version_no` DESC · map `displayPrintVersion`. **Get:** SELECT by `versionId` + company filter · `assertResourceInHrmScope` · 404 **`HRM-CTR-PV-404`** · display mask C&B. **Không** ghi DB. |
| **Tham chiếu bước SRS** | Diễn biến **#3 / #4** · **AC-CTR-PRINT-04** · AC-CORE-09C-02 · **O1/O6/O11** · U19 |
| **METHOD / path** | `GET /api/hrm/contracts-insurance/contracts/:contractId/print-versions` · `GET …/contracts/:contractId/print-versions/:versionId` |
| **DTO ↔ DB (DATA-01)** | SELECT all §4.1 DATA cols except soft-deleted · response maps `merged_fields_json` / `clauses_snapshot_json` / `compensation_snapshot_json` with ACL mask |
| **Success** | `200` · **`HRM-CTR-VER-200`** · list `{ total, data[] }` or single display row |
| **Errors** | **`HRM-CTR-PV-404`** · `HRM-CTR-409` / scope · contract 404 |

### 5.3 F-CORE-CTR-PDF-01 — PDF / print from issued snapshot

| | |
|--|--|
| **Mục đích** | Xuất **PDF in HĐLĐ** khớp đúng nội dung đã lưu tại phiên bản issued — không phụ thuộc thư viện điều khoản / template live sau issue. |
| **Nghiệp vụ xử lý** | `getPrintVersionById` (U19) · require `status=issued` else **`HRM-CTR-VERSION-NOT-ISSUED`** · build render input from **frozen** `merged_fields_json` + `clauses_snapshot_json` · default `renderContractPrintPdfBuffer` (pdfkit) · validate `%PDF` magic · optional `?format=html` debug · set Content-Type / Content-Disposition / `X-HRM-PDF-*` · **DENY** live-library re-merge. |
| **Tham chiếu bước SRS** | Diễn biến **#2** · **AC-CTR-PRINT-05** · **BR-CTR-CL-01** · AC-CORE-09C-03 · **O3/O6/O11** |
| **METHOD / path** | `GET /api/hrm/contracts-insurance/print-versions/:versionId/pdf` |
| **DTO ↔ DB (DATA-01)** | Read-only issued row snapshots → binary PDF · optional write `pdf_artifact_ref` **not required** for GĐ1 AC (render SoT = snapshot JSON) |
| **Success** | `200` · `application/pdf` · body starts `%PDF` · filename `contract-{contract_id}-v{version_no}.pdf` |
| **Errors** | **`HRM-CTR-VERSION-NOT-ISSUED`** · **`HRM-CTR-PV-404`** · **`HRM-CTR-RENDER-FAIL`** · scope 409 |

### 5.4 must_keep — F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 (CORE-09b SEALED)

| | |
|--|--|
| **Mục đích** | Gợi ý gói + xem trước ephemeral · cung cấp `can_issue` / missing_* cho gate VER. |
| **Rule** | **RETAIN** physical pack-resolve + preview · **ephemeral** · **DENY** reopen rewrite PREV→INSERT VER · stamp **`CORE09BQC1-MSLB05DZ`** · **≠** printable DONE |
| **Codes** | `HRM-CTR-PACK-200` · `HRM-CTR-PREV-200` · TPL-NONE / PACK-INVALID / TPL-PACK-MISMATCH |

### 5.5 must_keep — F-CORE-CTR-CL-01..04 (CORE-09a SEALED)

| | |
|--|--|
| **Mục đích** | Thư viện điều khoản = SoT `body_vi` consume vào `clauses_snapshot_json` tại issue. |
| **Rule** | **RETAIN** `/contract-clauses*` · draft in-place · issued CONFLICT→activate · snapshot freeze · **DENY** reopen rewrite · **DENY** FE hardcode |
| **Stamp** | **`CORE09AQC1-MSLA4LX9`** |

### 5.6 OUT invent peers (not this WI DONE)

| Paper | Peer UC | Rule |
|-------|---------|------|
| **F-CORE-CTR-TPL** catalog invent DONE | UC-BP-CORE-09d | Open TPL catalog as DONE — issue **may** resolve existing active template without claiming 09d DONE |
| Carry OBS | UC-BP-CORE-09d | **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** — idle-ok this seat |

---

## 6. Error taxonomy (RETAIN — no invent rewrite)

| Code | HTTP | Meaning |
|------|------|---------|
| `HRM-CTR-VER-201` | 201 | Print version issued OK |
| `HRM-CTR-VER-200` | 200 | List/get version OK |
| `HRM-CTR-ISSUE-BLOCKED` | 400 | `can_issue=false` — missing mandatory fields/clauses |
| `HRM-CTR-DRIVER-REQUIRED` | 400 | DRIVER pack missing GPLX/vehicle_plate |
| `HRM-CTR-TERM-INVALID` | 400 | Term dates / term_type invalid |
| `HRM-CTR-TPL-NONE` | 4xx | 0 active template for pack (via preview) |
| `HRM-CTR-PACK-INVALID` | 400 | Unknown / OOS pack_code |
| `HRM-CTR-TPL-PACK-MISMATCH` | 4xx | Request pack ≠ template pack |
| `HRM-CTR-VERSION-NOT-ISSUED` | 400 | PDF when status ≠ issued |
| `HRM-CTR-PV-404` | 404 | Print version not found / out of scope |
| `HRM-CTR-RENDER-FAIL` | 500 | PDF engine failure |
| `HRM-CTR-409` / `HRM-SCOPE-409` / `HRM-CTR-UNIT-SCOPE` | 409 | Scope mismatch |
| Sealed `HRM-CTR-PREV-200` / `HRM-CTR-PACK-200` / `HRM-CTR-CL-*` / `HRM-CORE-*` | — | **DENY** rewrite · must_keep |

---

## 7. Scope parity (U19)

| Surface | Same resolver family |
|---------|----------------------|
| Contract get / load | `loadContractForPrint` / `getContractById` + `assertResourceInHrmScope` |
| Pack resolve / preview | CORE-09b SEALED same expanded company ids |
| VER create | `createPrintVersion` → preview + loadContractForPrint |
| VER list | `listPrintVersions` → loadContractForPrint + `pushCompanyIdFilter` |
| VER get | `getPrintVersionById` + `assertResourceInHrmScope` |
| PDF | `renderPrintVersionPdf` → `getPrintVersionById` |

**Flag `scope_parity`:** list/create returns id but get/PDF 404 under group CEO `main` = **P0**.

**J-* DRAFT (BA):** `J-HRM-CORE-09C-01..04` — preview→save VER→F5 · PDF match snapshot · issue blocked when missing · Nest `/core` 0 + PREV ephemeral + CORE-09a/08/02/01 regression + amend supersede.

---

## 8. must_keep & DENY

| Item | Rule |
|------|------|
| LIVE VER+PDF spine | `POST/GET …/print-versions*` · `GET …/pdf` on `/contracts-insurance/*` |
| Server re-preview + can_issue | **LOCK** · DENY FE-trusted issue |
| Snapshot freeze + PDF-from-snapshot | **LOCK** · DENY live remerge |
| Amend supersede | New `version_no` · prior `superseded` |
| CORE-09b | PACK+PREV ephemeral · stamp **`CORE09BQC1-MSLB05DZ`** · **≠** printable DONE · J-HRM-CORE-09B-* RETAIN |
| CORE-09a | F-CORE-CTR-CL-01..04 · stamp **`CORE09AQC1-MSLA4LX9`** |
| CORE-08 | rewards* + discipline* + payroll_link · stamp **`CORE08QC1-MSL9BFFE`** · **≠** pillar DONE |
| CORE-02 | packages/eins · AuthZ-403 · CB-403 · stamp **`CORE02QC1-MSL80DU6`** |
| CORE-01 | public strip · stamp **`CORE01QC1-MSL6WMS7`** |
| Nest `/core` | **DENY** VER/PDF SoT |
| Schema ADD / mega-EAV / second VER store | **HOLD** (DATA) · **NOT unlock** this seat |
| Rewrite PREV→INSERT VER | **DENY** |
| 09d TPL invent DONE | **OUT invent** as this WI DONE · carry OBS |
| Honesty | printable / recruitment / jd / CORE UAT **false** · C-SLICE |
| Seed / apps/** | **DENY** this seat |
| Reopen sealed J-HRM-CORE-09B/09A/08/02/01 | **DENY** without regression |
| Dev invent schema/API/endpoints | **DENY** — FE save/PDF fidelity residual only · BE HOLD unless wire gap proven |

---

## 9. Traceability (requirement → API → FE → test)

| BR / AC | API | FE / J-* | Test expect |
|---------|-----|----------|-------------|
| O1 · BR-CORE-VER-PATH | VER-01/02 · PDF-01 physical | J-09C-01/02/04 | Nest `/core` 0 |
| O2 · AC-CTR-PRINT-01/06 · BR-CTR-CL-02/04 | VER-01 gate | J-09C-03 | ISSUE-BLOCKED + lists · no INSERT |
| O3 · AC-CTR-PRINT-05 · BR-CTR-CL-01 | PDF-01 snapshot | J-09C-02 | `%PDF` match issued snapshot |
| O4 · FR-09c #5 | VER-01 amend | J-09C-04 | prior superseded · new version_no |
| O5 · CORE-09b must_keep | PREV-01 | J-09C-04 regress | preview `ver_insert=0` |
| O6 · AC-CTR-PRINT-04 | VER-01/02 | J-09C-01 | 201 · list F5 còn pack+version |
| O7 · AC-CTR-PRINT-08 | registry CTR | J-09C-04 | F5 CRUD PASS |
| O8 peers OUT | TPL | — | OUT invent DONE · carry OBS |
| O9 must_keep | sealed PACK/PREV/CL/RD/CB/public | J-09C-04 smoke | ≠ printable · ≠ pillar |
| O10 honesty | — | evidence footer | printable false · C-SLICE |
| O11 display | FE bind VER + PDF Blob | save/PDF UX | ≠ live remerge invent |
| U19 | get=create=list=pdf | Group CEO | scope_parity |

---

## 10. Risks & mitigation

| Risk | Mitigation |
|------|------------|
| Dev invents Nest `/core` VER/PDF controller | O1 DENY · QA Network assert Nest `/core` 0 |
| PREV rewritten to persist issued | O5 · stamp CORE09B · VAL-CORE-VER-08 |
| PDF re-merges live library after clause edit | O3 · AC-CTR-PRINT-05 · PDF-01 snapshot-only |
| FE-trusted issue skips can_issue | O2 · server re-preview LOCK |
| Claim CORE-09b GWC = printable | O9/O10 · honesty footer |
| Fold 09d TPL into 09c DONE | O8 OUT · carry OBS only |
| Silent overwrite issued | O4 supersede + new version_no |
| Break registry CRUD | O7 must_keep · AC-CTR-PRINT-08 |
| Schema ADD without gap proof | DATA HOLD · CORE-VER-DATA-HOLD |
| Dev invents API because “labels missing” | Unlock **FE residual only** · VI map on FE |
| Dev-BE invents wire without proven gap | **HOLD** unless residual wire gap proven after this RETAIN |

---

## 11. Unlock ladder

| Step | Owner | Gate |
|------|-------|------|
| 1 | **sa** (this seat) | API F.1 **CONFIRMED RETAIN** |
| 2 | **dev-fe** | Save VER + PDF U65 fidelity residual — bind LIVE POST/GET print-versions* + GET pdf · show pack/`version_no` · F5 · PDF Blob match · ISSUE-BLOCKED UX · registry F5 intact · **≠** invent Nest `/core` / schema / endpoints · **≠** rewrite PREV |
| 3 | **qa** | J-HRM-CORE-09C-01..04 · Nest `/core` 0 · PREV ephemeral regress · seals smoke · honesty false · PDF snapshot match |
| 4 | **qc** | GWC seat · **DENY** module CORE/CTR UAT · **DENY** printable flip · **DENY** CORE-09b=printable |
| **HOLD** | **dev-be** invent | **No** schema/API invent unless later residual WI proves **wire gap** (not label/UX gap) |
| Peer | **09d** | TPL + OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` |

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · API **CONFIRMED RETAIN** |
| **next_owner** | **pm** → dispatch **dev-fe** save VER + PDF fidelity residual (**Dev-BE HOLD** unless wire gap proven) |
| **Dev-BE** | **HOLD invent** — no Nest `/core` · no mega-EAV · no PREV→INSERT rewrite · no second VER store · no invent endpoints |
| **Dev-FE** | Save VER + PDF fidelity on LIVE `/contracts-insurance/*` print-versions + pdf only |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-api-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09c
depends_on: API-01 CONFIRMED RETAIN · docs/program/specs/PO-HRM-MVP-GD1-CORE-09C-CLUSTER-API-01.md · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · peer CORE09BQC1-MSLB05DZ
spec_ref: F-CORE-CTR-VER-01 · F-CORE-CTR-VER-02 · F-CORE-CTR-PDF-01 RETAIN · physical /contracts-insurance/* print-versions* + pdf · paper /core alias only · must_keep PACK+PREV ephemeral · CL-01..04 · BR-CTR-CL-01/02/04 · AC-CTR-PRINT-01/04/05/06/08 · J-HRM-CORE-09C-01..04 DRAFT

MISSION — Save VER + PDF U65 fidelity residual ONLY (preserve_default · NO invent schema/API/endpoints):
1) Bind HĐLĐ «Lưu phiên bản» + In/PDF to LIVE POST/GET /api/hrm/contracts-insurance/contracts/:id/print-versions* + GET …/print-versions/:versionId/pdf — DENY Nest /core dual
2) After 201 HRM-CTR-VER-201: list/detail show pack_code + version_no (+ status/issued_at); F5 còn; amend → new version + prior superseded
3) PDF Blob 200 %PDF from issued snapshot only — DENY FE invent PDF by re-merging live library; surface VERSION-NOT-ISSUED
4) Issue blocked UX: ISSUE-BLOCKED / DRIVER / TERM / TPL-NONE + missing lists; PREV remains ephemeral (no VER INSERT on preview)
5) must_keep CORE-09b PACK+PREV · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest /core DENY · registry CRUD F5
6) DENY invent 09d TPL as DONE · claim CORE-09b=printable · contracts_printable_ready · reopen J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip
7) Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-fe-01.md · READY_FOR_QA · J-HRM-CORE-09C-01..04
```

---

## 13. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | API F.1 **CONFIRMED RETAIN** for UC-BP-CORE-09c: cite **F-CORE-CTR-VER-01** on LIVE `POST /api/hrm/contracts-insurance/contracts/:id/print-versions` (server re-preview + `can_issue` · snapshot freeze · supersede amend · denorm pack/template · **`HRM-CTR-VER-201`**) · cite **F-CORE-CTR-VER-02** on LIVE `GET …/print-versions*` (**`HRM-CTR-VER-200`**) · cite **F-CORE-CTR-PDF-01** on LIVE `GET …/print-versions/:versionId/pdf` (pdfkit from issued snapshot only · **`HRM-CTR-VERSION-NOT-ISSUED`** / **`HRM-CTR-RENDER-FAIL`**) · DTO↔DB from DATA-01 · U19 list=get=create=pdf · must_keep F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · CORE-08 RD+payroll_link · CORE-02 packages/AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · registry CRUD · **OUT** invent 09d TPL as DONE · carry **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** → 09d · DENY claim CORE-09b=printable · `contracts_printable_ready` · reopen sealed J-HRM-CORE-09B/09A/08/02/01 · seed · honesty flip · apps/** · C-SLICE. Unlock **Dev-FE save VER + PDF U65 fidelity residual ONLY** — **Dev-BE HOLD** unless residual wire gap proven — **not** Dev invent schema/API/endpoints. |
| **next_owner** | **pm** → **dev-fe** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | FE save/PDF fidelity · J-09C DRAFT until QA · schema ADD remains HOLD · Dev-BE invent HOLD · 09d peer + OBS |

---

*End API-01 · Wave-15 CORE-09c · sa F.1 RETAIN · 2026-08-09*
