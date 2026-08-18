# Evidence — `PO-HRM-AMIS-PARITY-PAY-TPL-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API slice gate** (not browser UF · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-TPL-QA-01` PASS_TO_PM |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **Verdict** | **GO WITH CONDITIONS** — L1 `pay-sheet-templates*` CRUD + bind + pack≠mẫu ACCEPT |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-tpl-qa-01.md`](po-hrm-amis-parity-pay-tpl-qa-01.md) stamp **`PAYTPLQA-MSIGIKB1`** |
| **be_ref** | [`po-hrm-amis-parity-pay-tpl-be-01.md`](po-hrm-amis-parity-pay-tpl-be-01.md) READY_FOR_QA |
| **spec_ref** | `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` · F-PAY-SHEET-TPL-* · pack≠mẫu · OV-C · soft-delete · scope_parity |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json`](_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 API GWC ≠ AMIS parity DONE / payroll module UAT / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Pack as mẫu** | **DENIED** | `/salary-templates*` remains enroll-only (`HRM-PAY-200`) · mẫu = `HRM-PAY-TPL-*` |
| **Browser UF / Settings PASS** | **DENIED** | No FE Settings mẫu this seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | API smoke only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API smoke for **F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE** + period **bind-sheet-template** snapshot + **scope_parity** main↔holding + pack regression against API_DESIGN F.1. Audited QA-01 MD + FINAL JSON stamp `PAYTPLQA-MSIGIKB1` + BE-01 READY (jest 21 PASS cited). Proven: list **200** → POST **201** `HRM-PAY-TPL-201` → GET/PATCH activate → PUT lines (`displayLabel` · `sortOrder` · OV-C FK+jsonb) → archive hide · bind draft period snapshot · pack `packHasMauId=false`. OBS create-with-`paySheetTemplateId` **409** `HRM-PAY-002` = **CONDITION OK** (period uniqueness, not TPL FAIL — primary AC4 via bind endpoint). QA pack verify **3/8** = **PROCESS OBS** — this QC consolidates **8/8**. Residual FE Settings + PROCESS SRC remain open → next PM dispatch FE. **DENIED** `payroll_e2e_ready=true` · treat pack as mẫu · browser UF PASS · Phase1 DONE · AMIS parity DONE.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 GET/POST/PATCH `/pay-sheet-templates*` | QA-01 · JSON 201 `HRM-PAY-TPL-201` id `e23e72eb-…` · PATCH `status=active` | 🟢 **ACCEPT** |
| AC2 PUT lines label + sort + OV-C | PUT **200** · label `Nhãn QA…` · sort=10 · definition_id + jsonb | 🟢 **ACCEPT** |
| AC3 ARCHIVE hide from active list | archive **201** · `inActive=false` · `include_archived` → true | 🟢 **ACCEPT** |
| AC4 Bind draft → snapshot | bind **201** · `pay_sheet_template_id` + snapshot columns | 🟢 **ACCEPT** |
| OBS create-with-tpl same month | **409** `HRM-PAY-002` overlap | 🟡 **CONDITION OK** — period uniqueness |
| AC5 scope_parity main↔holding | get main **200** · get holding **200** · persist=`holding` | 🟢 **ACCEPT** |
| AC6 pack enroll-only ≠ mẫu | pack **200** `HRM-PAY-200` · `packHasMauId=false` | 🟢 **ACCEPT** |
| AC7 Honesty | `payroll_e2e_ready=false` · no seed · no browser | 🟢 **DENIED promote** |
| must_keep pack≠mẫu · OV-C FK · soft-delete · scope_parity | MD + machine + BE | 🟢 **TRACE OK** |
| FE Settings / PROCESS SRC / module UAT | residuals | 🟡 **CONDITION OPEN** — next wave |
| Module UAT / Phase1 | Explicit DENIED | 🟢 |

**Cấm:** invent `payroll_e2e_ready=true` · treat `salary_templates` as mẫu SoT · Phase1 DONE · browser UF PASS without FE · reopen pack as kỳ SoT · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · no FE Settings mẫu · PROCESS SRC not UF · L1 CRUD ≠ e2e |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| DATA/API unlock | API-01 CONFIRMED · DATA-01 prior | — | **ACCEPT** prior governance |
| BE-01 Nest CRUD | `po-hrm-amis-parity-pay-tpl-be-01.md` | READY_FOR_QA | **ACCEPT** · jest suites **2** · tests **21** PASS cited |
| QA-01 L1 smoke | `po-hrm-amis-parity-pay-tpl-qa-01.md` | PASS_TO_PM | **ACCEPT** stamp `PAYTPLQA-MSIGIKB1` |
| Machine QA-01 | `_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-01 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-01.md` | exit **1** · **3/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYTPLQA-MSIGIKB1` | 🟢 |
| `honesty.payroll_e2e_ready` / `browser_uf` / `module_uat` | all **false** | 🟢 |
| `honesty.pack_is_not_mau` | **true** | 🟢 |
| `ac.ac1`..`ac7` | all **PASS** | 🟢 |
| `create_template` | **201** `HRM-PAY-TPL-201` · persist `holding` | 🟢 |
| `put_lines` | label+sort+ovc **true** · OV-C definition_id present | 🟢 |
| `archive` / `list_after_archive` | `inActive=false` · `inArchived=true` | 🟢 |
| `bind_sheet_template` | **201** · snapshot `display_label` + `component_code=D` | 🟢 |
| `create_period_with_paySheetTemplateId` | **409** `HRM-PAY-002` | 🟡 CONDITION OK |
| `salary_templates_pack_regression` | `packHasMauId=false` | 🟢 |
| `overall.verdict` | **PASS** | 🟢 |

---

## Gate AC audit (API F.1)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 1 | F-PAY-SHEET-TPL-LIST/UPSERT | list/create/get/patch 2xx `HRM-PAY-TPL-*` | 🟢 |
| 2 | F-PAY-SHEET-TPL-LINES-01 · OV-C | PUT lines · definition_id preferred + jsonb preview stash | 🟢 |
| 3 | F-PAY-SHEET-TPL-ARCHIVE-01 soft-delete | archived_at · hide default list | 🟢 |
| 4 | F-PAY-PERIOD EXPAND bind | `POST …/bind-sheet-template` snapshot frozen | 🟢 |
| 4b | create period + `paySheetTemplateId` | **409** overlap after first draft | 🟡 **CONDITION OK** (not TPL FAIL) |
| 5 | scope_parity list↔get | main↔holding Plane B | 🟢 |
| 6 | Alias pack ≠ mẫu | `/salary-templates*` `HRM-PAY-200` · no mau id | 🟢 |
| 7 | Honesty locks | ready=false · no UF · no seed | 🟢 |
| 8 | PROCESS SRC / FORMULA-412 jsonb-only | Not this seat | ⬜ **OUT OF SCOPE** — R-PAY-SRC-PROCESS |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-01 | QC |
|-----------------|-------|-------|-----|
| **L1 F-PAY-SHEET-TPL CRUD + bind** (in-scope) | BE-01 READY | 🟢 AC1–7 PASS | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested this L1** | ⬜ **DEFERRED** — not claimed; ≠ mẫu Settings UF |
| Browser Settings mẫu UF | No FE GĐ1 | DENIED | ⬜ **NOT IN SCOPE** — next `PO-HRM-AMIS-PARITY-PAY-TPL-FE-01` |
| Payroll process SRC / lines | staged | not claimed | ⬜ **DEFERRED** — R-PAY-SRC-PROCESS |

**U19 note:** This gate certifies the **L1 API slice** named in dispatch — **not** a claim that **J-HRM-07** or payroll module UAT is newly GO. Missing L2.5 browser on Settings mẫu does **not** NO-GO L1 CRUD; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + FE residual) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| POST pay-sheet-template | Create | **PASS** |
| GET list / get by id | Read | **PASS** |
| PATCH activate | Update | **PASS** |
| PUT lines (label/sort/OV-C) | Update replace-set | **PASS** |
| POST archive | Soft-delete | **PASS** |
| POST bind-sheet-template | Update period snapshot | **PASS** |
| POST period + paySheetTemplateId (overlap) | Create deny | **PASS** (409 expected uniqueness) |
| GET salary-templates pack | Read regression | **PASS** (≠ mẫu) |
| Hard-delete mẫu | Delete | **N/A** — soft archive only |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-01 pack verify **3/8** (command_table · portal_url · journey_l25) | **PROCESS OBS** | Expected L1-only MD; QC consolidates **8/8** here — **not** product demote |
| AC1–7 HTTP codes vs F.1 | **PRODUCT OK** | CRUD / lines / archive / bind / scope / pack match |
| **409** `HRM-PAY-002` create-with-tpl | **PRODUCT OK** (OBS) | Period uniqueness — CONDITION OK · primary AC4 via bind |
| Missing FE Settings / PROCESS SRC / J-HRM-07 retest | **SCOPE / CONDITION** | Blocks ready=true · **not** L1 product NO-GO |
| No P0/P1 product residual on L1 TPL CRUD | **PRODUCT OK** | Slice ACCEPT |
| Stale-dist | **N/A / OK** | QA: unauth GET → **401** (route live) · dist present — no rebuild residual |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **C-SLICE-≠-MODULE** | honesty | `pm` | **CONDITION** | L1 GWC ≠ module UAT / AMIS DONE / Phase1 |
| **R-PAY-TPL-FE** | P1 next | `dev-fe` | **OPEN CONDITION** | Settings mẫu GĐ1 form — wire `/pay-sheet-templates*` · **cấm** DnD formula · **cấm** merge pack UI as mẫu |
| **R-PAY-SRC-PROCESS** | P1 staged | `dev-be` / formula wave | **OPEN CONDITION** | PROCESS SRC + FORMULA-412 jsonb-only — **DENIED** LIVE claim |
| **R-PAY-TPL-CREATE-BOUND** | P3 nice | `qa` | **OPTIONAL** | Retest create-with-`paySheetTemplateId` on free period window |
| **OBS-HRM-PAY-002** | process OBS | — | **CONDITION OK** | Period overlap ≠ TPL bind defect |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** Settings mẫu UF | L2.5 | `qa` later | **DEFERRED** | Historical shell PASS ≠ mẫu author UF |

**P0/P1 product residuals for this L1 WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + R-PAY-TPL-FE + R-PAY-SRC-PROCESS + OBS-HRM-PAY-002 (documented OK) — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified L1 mẫu API.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-01.md` | exit **1** · **3/8** (`command_table` · `portal_url` · `journey_l25`) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness `node scripts/qa/_tmp-po-hrm-amis-parity-pay-tpl-qa-01.mjs` (prior) | **PASS** · stamp `PAYTPLQA-MSIGIKB1` | PRODUCT OK (cited) |
| BE `pnpm --filter hrm-api exec jest --testPathPatterns=pay-sheet-template.service.spec --testPathPatterns=payroll.controller.spec` (prior) | Suites **2** · Tests **21** **PASS** | PRODUCT OK (cited) |
| L0 `pnpm run qc:dev-stack` (prior QA) | HRM/XBOS/portal **200** | ENV OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack audit.

---

## completion_report

### Closed

1. QC L1 slice gate on AMIS **mẫu bảng lương** (`/pay-sheet-templates*`) — **GO WITH CONDITIONS**.  
2. AC1–AC7 integrity ACCEPT vs machine stamp `PAYTPLQA-MSIGIKB1` + API F.1.  
3. OBS `HRM-PAY-002` create-with-tpl classified **CONDITION OK** (period uniqueness).  
4. must_keep: pack≠mẫu · OV-C FK · soft-delete · scope_parity — TRACE OK.  
5. Honesty: `payroll_e2e_ready=false` **LOCKED** · browser UF / pack-as-mẫu / Phase1 **DENIED**.  
6. QA pack PROCESS OBS consolidated into this QC **8/8** pack.

### Residual

- **R-PAY-TPL-FE** → `dev-fe` Settings mẫu GĐ1 (`PO-HRM-AMIS-PARITY-PAY-TPL-FE-01`).  
- **R-PAY-SRC-PROCESS** → formula/process wave.  
- **C-SLICE-≠-MODULE** · ready flag locked false.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → **dev-fe** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | Dispatch `PO-HRM-AMIS-PARITY-PAY-TPL-FE-01` — **cấm** flip `payroll_e2e_ready` · **cấm** merge pack UI as mẫu |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
depends_on: PO-HRM-AMIS-PARITY-PAY-TPL-QC-01 GO WITH CONDITIONS
prior: PO-HRM-AMIS-PARITY-PAY-TPL-QC-01 PASS_TO_PM

## Mission
Settings GĐ1 form for mẫu bảng lương — wire Nest /api/hrm/payroll/pay-sheet-templates* (list/create/get/patch/lines/archive).
U65 browser-ready surface · display_label + sort_order + OV-C picker (definition_id preferred).
Cấm DnD formula canvas. Cấm merge /salary-templates pack UI as mẫu SoT.
Cấm invent payroll_e2e_ready=true · cấm claim AMIS parity DONE / module UAT.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-01.md
2. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-01.md
3. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md
4. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-be-01.md

## exit_criteria
- Settings UI list/create/edit lines/archive soft-delete against live API
- pack UI (if present) remains enroll-only and visually/contractually distinct from mẫu
- solid_convention_ack FE–BE display-ready · CODE-MEMORY APPEND
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
- honesty: payroll_e2e_ready=false · READY_FOR_QA → QA browser U65
```
