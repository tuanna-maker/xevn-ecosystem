# QA-PO-HRM-REC-CHANNELS-CONSUMER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` |
| **role** | qa |
| **ack_status** | **FAIL_TO_PM** (retest #4 2026-08-11 — AC-REC-01/03 🟢; AC-REC-02 harness P2) |
| **stamp** | `RECCHQA-MSNK95YR` (UV) · `RECCHQA-MSNJV0SR` (YCTD/WF) · prior retest #3 `RECCHQA-MSNJEXWE` |
| **date** | 2026-08-11 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser-only (no seed) |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **env** | portal `http://127.0.0.1:5173` · HRM `:28001` · commit `dc930c5` |

## spec_ref

- `docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md` · AC-SET-CONSUMER-CH-REC-01..03
- FE handoff: `docs/qa/evidence/po-hrm-rec-channels-consumer-fe-01.md`

## Automated (pre-browser)

| Check | Result |
|-------|--------|
| Vitest (`catalogSearchPicker` + `candidateRecruitmentChannelUi` + form source locks) | **43/43 PASS** |

## Channel catalog precondition (API)

| Item | Value |
|------|--------|
| `recruitment_channels` EFF | **4** (`CSO_01`..`CSO_04`) |
| Sample | `CSO_01` / label «Website» |

## Browser — AC matrix

| AC / check | Verdict | Evidence |
|------------|---------|----------|
| **AC-REC-01-PRECOND** (EFF>0) | 🟢 | API settings-catalogs · 4 codes |
| **YCTD-BOOTSTRAP-U65** | 🔴 | U65 FE chain JD (5 rows) → YCTD create → **0** `requisitions` POST · receivable **0** |
| **L2** tab Ứng viên | 🟢 | Mount · no Sync ERROR |
| **REGRESSION-YCTD** | 🟢 | Empty gate: `hdsd-candidate-form-empty-yctd` · no receivable YCTD |
| **AC-REC-01** mutate (Tạo UV → Lưu → POST `source`=code → F5) | 🔴 | **Blocked** — cannot select YCTD / submit UV |
| **AC-REC-02** filter | ⬜ | Not reached |
| **AC-REC-03** list/detail label | ⬜ | Not reached |
| **VAL-REC-CH-FE-01** Network | ⬜ | Not reached |
| **AC-REC-01-PICKER-SMOKE** (blocked path) | 🟡 | Nguồn dropdown **4 options** · not legacy-only LinkedIn set · harness did not capture `data-value` on select |

## Root cause (QA)

1. `GET /api/hrm/recruitment/requisitions?receivable=true` → **count 0** (total requisitions **0** in DB).
2. Bootstrap trong runner: mở YCTD create + JD picker — **không** thấy POST requisitions (form `hdsd-requisition-form-ready` / submit path).
3. Consumer slice **phụ thuộc** UV create — không thể nghiệm thu POST/PATCH `candidates-pool` `source=catalog code` + F5 trong phiên này.

## hdsd_align (partial)

| Step | Status |
|------|--------|
| Login → HRM → Tuyển dụng → **Ứng viên** | 🟢 |
| **Tạo UV** → Nguồn catalog | 🟡 picker options count=4 only (no Lưu) |
| Settings sync kênh | N/A (EFF already 4) |

## Honesty flags

| Flag | Value |
|------|--------|
| `settings_catalog_e2e_ready` | **false** (deny flip) |
| `UF-HRM-10` full PASS | **not claimed** |

## Artifacts

- Runner: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs`
- JSON: `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json`
- Screens: `docs/qa/evidence/screens/qa-po-hrm-rec-channels-consumer-01/` (when captured)

## pm_dispatch_hint

`dev-fe` — YCTD create từ tab Yêu cầu tuyển dụng không persist (0 rows API); fix `hdsd-requisition-form-ready` / submit + workflow tới receivable **hoặc** restore U65 path J-REC-WF. Sau đó **re-run** `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` (full mutate + filter + F5).

## completion_report

**Closed:** L0 · vitest 43 · channel EFF precondition · L2 candidates · YCTD empty-gate regression · partial picker option count.  
**Open:** AC-REC-01..03 browser mutate end-to-end · VAL-REC-CH-FE-01 · AC-REC-02/03.

## next_owner

`pm` → `dev-fe` (YCTD create blocker) then `qa` retest same WI.

---

## Retest — 2026-08-11 (`PO-HRM-REC-YCTD-CREATE-BLOCKER-01` READY)

| Field | Value |
|-------|--------|
| **stamp** | `RECCHQA-MSNJ2BYL` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** (2026-08-11) |
| **Vitest** | `catalogSearchPicker` + `candidateRecruitmentChannelUi` + `po-hrm-rec-channels-consumer-fe-01` **40/40**; `jobRequisitionYctdWave2` **16/16**; `jobRequisitionUi` + `hdsdMutateTestIds` **47/47** |
| **commit** | `dc930c5` |

### Exit criteria matrix (retest)

| # | Criterion | Verdict | Notes |
|---|-----------|---------|--------|
| 1 | YCTD Thêm→JD→Lưu → POST `/requisitions` 2xx → GET `total`≥1 | 🟢 | Network **POST 201** title `YCTD QA RECCHQA-MSNJ2BYL` · API `GET …/requisitions?company_id=main` **total=1** |
| 2 | Receivable after draft/WF — document Y-S9 or unblock UV | 🔴 | `receivable=true` **0** · `headcount_mode=out_of_plan` · `requires_bod=true` · `status=pending_approval` · `cv_intake_allowed=false` |
| 3 | AC-REC-01..03 UV mutate + filter/badge | 🔴 | Blocked — `hdsd-candidate-form-empty-yctd` · no POST `candidates-pool` |
| 4 | Regression channels vitest + YCTD dept picker | 🟢 | Vitest spot PASS (see above) |
| 5 | Evidence append + stamp | 🟢 | This section |

### Y-S9 / WF (SRS-aligned — no seed)

| Step | FE / Network | Result |
|------|----------------|--------|
| Gửi duyệt QT | POST `…/requisitions/{id}/submit-workflow?company_id=holding` **201** | `workflow_instance_id` spawned |
| Inbox «Xử lý nhanh» → Duyệt | POST `…/workflow-engine/tasks/…/complete` **422** (×2) | `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json` |
| Receivable probe | `GET …/requisitions?receivable=true` main+holding | **0** rows |

**spec_ref:** `recruitment.service.ts` out_of_plan **Y-S9** — first inbox leg → `approved`; BOD leg → `open_for_hire`; receivable filter `open|approved|open_for_hire`. Current row stuck `pending_approval` after WF UI attempt → **WF bridge / inbox payload P0** (not channels consumer FE).

### Browser AC (retest)

| AC | Verdict | Detail |
|----|---------|--------|
| AC-REC-01-PRECOND | 🟢 | EFF=4 `CSO_01` Website |
| YCTD-BOOTSTRAP-U65 | 🟡 | POST **201** but receivable still **0** (WF leg not receivable) |
| L2-CANDIDATES | 🟢 | Tab mount |
| REGRESSION-YCTD | 🟢 | Empty gate when receivable=0 |
| AC-REC-01-PICKER-SMOKE | 🟡 | 4 source options · no mutate |
| AC-REC-01 / 02 / 03 | 🔴 | Not reached |

### Artifacts (retest)

- Runner: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs`
- JSON: `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json` (stamp `RECCHQA-MSNJ2BYL`)
- Inbox cont: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.mjs` · `_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json`

### pm_dispatch_hint (retest)

`dev-be` + `dev-fe` (inbox): WF task **complete** from CC inbox must 2xx and recruitment bridge must advance YCTD `pending_approval` → `approved` (out_of_plan leg 1) per `recruitment-workflow.bridge.ts` Y-S9; then BOD leg if needed for `open_for_hire`. **Không seed.** After fix → re-run `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` full AC-REC-01..03.

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01
role: dev-be
entry_criteria: QA-PO-HRM-REC-CHANNELS-CONSUMER-01 retest — POST requisitions 201 + submit-workflow 201 but inbox complete 422; receivable=0; status pending_approval
read_first: apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts Y-S9 · docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md retest §
exit_criteria: U65 ceo@ — YCTD out_of_plan → Gửi duyệt QT → inbox Duyệt 2xx → GET receivable≥1 OR status=approved; then QA reruns AC-REC
evidence_path: docs/qa/evidence/po-hrm-rec-yctd-wf-inbox-bridge-be-01.md
ack_status: READY_FOR_QA
```

## completion_report (retest)

**Closed:** L0 · vitest regression · **YCTD create POST 201 + GET total=1** (`PO-HRM-REC-YCTD-CREATE-BLOCKER-01`) · channel EFF · L2 candidates · empty-YCTD gate · Y-S9 documented.  
**Open:** WF inbox complete 422 · receivable=0 · AC-REC-01..03 · VAL-REC-CH-FE-01.

## next_owner

`pm` → `dev-be` (`PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01`) then `qa` retest `QA-PO-HRM-REC-CHANNELS-CONSUMER-01`.

---

## Retest #3 — 2026-08-11 (`PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01` READY)

| Field | Value |
|-------|--------|
| **stamp** | `RECCHQA-MSNJEXWE` (WF/inbox leg) · UV run `RECCHQA-MSNJKJ1I` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** (post `hrm-api` restart + portal `:5173` up) |
| **Vitest** | `catalogSearchPicker` + `candidateRecruitmentChannelUi` + `po-hrm-rec-channels-consumer-fe-01` **40/40** |
| **BE unit** | `po-hrm-rec-yctd-wf-inbox-bridge-be-01` **3/3** · `recruitment-workflow.bridge` **20/20** |
| **commit** | `dc930c5` |

### Exit criteria matrix (retest #3)

| # | Criterion | Verdict | Notes |
|---|-----------|---------|--------|
| 1 | New `out_of_plan` YCTD → Lưu → Gửi duyệt QT → CC inbox Duyệt **2xx** (not 422) | 🟢 | `RECCHQA-MSNJEXWE`: POST requisitions **201** · submit-workflow **201** · inbox `POST …/workflow-engine/tasks/…/complete` **201** (`_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json`) |
| 2 | `GET …/requisitions?receivable=true` **≥1** | 🟢 | After inbox leg 1: **1** row `87a237e7-…` · `status=approved` · title `YCTD QA RECCHQA-MSNJEXWE` |
| 3 | AC-REC-01: Tạo UV → Nguồn `CSO_01` → POST `candidates-pool` 2xx → F5 | 🔴 | Picker/source OK (`CSO_01`/`Website`) but **no POST** — console **409** `YCTD ngoài ĐB chưa đủ duyệt BOD` (`cv_intake_allowed=false` on receivable row; harness also created extra pending YCTD when `QA_FORCE_NEW_YCTD` leaked) |
| 4 | AC-REC-02/03 filter + badge | 🔴 | Not reached (blocked at #3) |
| 5 | Evidence append + stamp | 🟢 | This section |

### WF / Y-S9 (U65 — no seed)

| Step | Network | Result |
|------|---------|--------|
| Bridge spawn (post restart `hrm-api`) | submit-workflow **201** | New instance for `MSNJEXWE` |
| Inbox «Duyệt» leg 1 | complete **201** (was **422** pre-bridge) | `pending_approval` → `approved` |
| BOD / `open_for_hire` | No inbox task for stamp on leg 2 | `requires_bod=true` · `cv_intake_allowed=false` — UV mutate still blocked per `recruitment.service.ts` |

### Browser AC (retest #3)

| AC | Verdict | Detail |
|----|---------|--------|
| AC-REC-01-PRECOND | 🟢 | EFF=4 `CSO_01` |
| YCTD / WF bridge | 🟢 | See exit #1–2 |
| L2-CANDIDATES | 🟢 | Tab mount |
| REGRESSION-YCTD | 🟢 | Picker visible when receivable≥1 |
| AC-REC-01 / VAL-REC-CH-FE-01 | 🔴 | 409 BOD gate — not channels FE regression |
| AC-REC-02 / 03 | 🔴 | Not reached |

### Artifacts (retest #3)

- Runner: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs` (+ `QA_FORCE_NEW_YCTD` only for fresh WF stamp)
- Inbox: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.mjs` · `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json`
- JSON: `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json`

### pm_dispatch_hint (retest #3)

`dev-be` — **BOD leg / `open_for_hire` + `cv_intake_allowed`** for `out_of_plan` after inbox leg 1 (receivable list shows `approved` but UV POST still 409); align AC-REC-01 with SRS Y-S9 leg 2 or document `in_plan` U65 path for consumer slice. `dev-fe` optional: YCTD picker binds **receivable row with `cv_intake_allowed=true`** (not newest pending draft). **Bridge inbox 422: closed** — no re-dispatch `PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01`.

### completion_report (retest #3)

**Closed:** L0 · vitest 40 · BE bridge specs 23 · **WF inbox complete 201** · **receivable≥1** on fresh `out_of_plan` YCTD (`MSNJEXWE`).  
**Open:** AC-REC-01..03 (BOD/`cv_intake_allowed` gate) · VAL-REC-CH-FE-01 browser POST.

### next_owner

`pm` → `dev-be` (BOD/open_for_hire chain) then `qa` re-run `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` AC-REC only.

### ack_status

**FAIL_TO_PM** (WF bridge slice 🟢; consumer mutate slice 🔴)

---

## Retest #4 — 2026-08-11 (`PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01` READY)

| Field | Value |
|-------|--------|
| **stamp (YCTD/WF)** | `RECCHQA-MSNJV0SR` · requisition `cc266a29-9d08-4caa-8086-6f8ce940cc7e` |
| **stamp (UV AC-REC-01)** | `RECCHQA-MSNK95YR` |
| **L0** | `pnpm run qc:fe-be-health` exit **0** (post `hrm-api` restart + portal `:5173` restored) |
| **Vitest** | `catalogSearchPicker` 33 + `candidateRecruitmentChannelUi` 4 + `po-hrm-rec-channels-consumer-fe-01` 3 = **40/40** |
| **BE unit** | `po-hrm-rec-yctd-bod-open-for-hire-be-01` 3/3 · `po-hrm-rec-yctd-wf-inbox-bridge-be-01` 3/3 |
| **commit** | `dc930c5` |

### Exit criteria matrix (retest #4)

| # | Criterion | Verdict | Notes |
|---|-----------|---------|--------|
| 1 | Fresh `out_of_plan` YCTD → Gửi duyệt QT → CC inbox Duyệt **201** | 🟢 | U65: `QA_FORCE_NEW_YCTD` → POST requisitions **201** + submit-workflow **201**; `cont` inbox `POST …/workflow-engine/tasks/…/complete` **201** (`_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json`) |
| 2 | Receivable row `status=open_for_hire` · `cv_intake_allowed=true` | 🟢 | After inbox: `GET …/requisitions/cc266a29…` · `pipeline_flags.cv_intake_allowed=true` · `status=open_for_hire` (BOD terminal fix verified) |
| 3 | AC-REC-01: Nguồn `CSO_01` → POST **2xx** → F5 list/detail label | 🟢 | `POST /api/hrm/recruitment/candidates` **201** `source=CSO_01` · `requisition_id=cc266a29…` · F5 + detail 🟢 (`RECCHQA-MSNK95YR`) |
| 4 | AC-REC-02 filter · AC-REC-03 badge | 🟡 / 🟢 | **AC-REC-03** list+detail 🟢 · **AC-REC-02** 🔴 harness — source filter combobox locator (no `Nguồn` text on trigger; see `CandidatesTab.tsx` SelectTrigger) |
| 5 | Evidence append + stamp | 🟢 | This section |

### WF / receivable (U65)

| Step | Result |
|------|--------|
| `hrm-api` restart | Turbo `dev:hrm-api` after kill `:28001` |
| New YCTD `MSNJV0SR` | `headcount_mode=out_of_plan` · WF spawn **201** |
| Inbox leg 1 | complete **201** → terminal maps **`open_for_hire`** + **`cv_intake_allowed=true`** |
| Stale `MSNJEXWE` (`approved`) | Still in receivable list (count=2) — UV bound to **`MSNJV0SR`** via `QA_YCTD_PREFER_STAMP` |

### Browser AC (retest #4)

| AC | Verdict | Detail |
|----|---------|--------|
| AC-REC-01-PRECOND | 🟢 | EFF=4 `CSO_01` |
| YCTD / BOD open_for_hire | 🟢 | Exit #1–2 |
| L2-CANDIDATES | 🟢 | Tab mount |
| AC-REC-01 / VAL-REC-CH-FE-01 | 🟢 | Network path **`/recruitment/candidates`** (harness fix; was wrongly watching `candidates-pool` only) |
| AC-REC-03-LIST / DETAIL / F5 | 🟢 | Label «Website» |
| AC-REC-02 | 🔴 | Filter option not found (harness P2) |

### QA harness fixes (this retest)

- Network assert: include `POST /api/hrm/recruitment/candidates` (FE `createCandidatePool`).
- Radix Select: pick `[role=option]` at **page** scope + `QA_YCTD_PREFER_STAMP` for open_for_hire row.

### Artifacts (retest #4)

- Runner: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs`
- Inbox: `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.mjs` · `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json`
- JSON: `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json` (stamp `RECCHQA-MSNK95YR`)

### pm_dispatch_hint (retest #4)

`dev-fe` (P2): add `data-testid` on candidates source filter **or** QA harness bind `recruitment.ct.sourcePlaceholder` / second combobox — product filter exists (`CandidatesTab.tsx` L774). **Không** re-dispatch `PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01` (BOD/open_for_hire 🟢). Optional `qc` narrow GWC on AC-REC-02 harness only.

### completion_report (retest #4)

**Closed:** L0 · vitest 40 · BE 6/6 · **YCTD WF inbox 201** · **open_for_hire + cv_intake_allowed** · **AC-REC-01/03 + VAL-REC-CH-FE-01** browser 🟢.  
**Open:** **AC-REC-02** filter (harness locator P2).

### next_owner

`pm` → `dev-fe` (filter testid/locator) or `qa` harness-only patch; then optional `qc` slice gate.

### ack_status

**FAIL_TO_PM** (core consumer mutate 🟢; AC-REC-02 residual P2)

---

## Retest #5 — AC-REC-02 only — 2026-08-11 (`PO-HRM-REC-CHANNELS-CONSUMER-AC-REC-02-FILTER-01` READY)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-REC-CHANNELS-CONSUMER-01` |
| **run stamp** | `RECCHQA-MSNKIJ5R` (harness session) |
| **UV row (prior #4)** | `RECCHQA-MSNK95YR` — **not** re-created (AC-REC-01/03 carry) |
| **L0** | `pnpm run qc:fe-be-health` exit **0** |
| **Persona** | `ceo@xe.vn` · `company_id=main` · U65 zero-seed |
| **Portal** | `http://127.0.0.1:5173` · commit `dc930c5` |

### AC-REC-02 (browser — HDSD testids)

| Step | Action | Result |
|------|--------|--------|
| 1 | HRM → Tuyển dụng → Ứng viên (`tab=candidates`) | L2 mount 🟢 |
| 2 | `getByTestId('hdsd-candidate-filter-source')` → click | Trigger visible 🟢 |
| 3 | `getByTestId('hdsd-candidate-filter-source-option-CSO_01')` → click | Option visible 🟢 |
| 4 | Assert table row contains `RECCHQA-MSNK95YR` | **PASS** — filtered list shows expected UV |

### Scope (this retest)

| AC | Verdict | Notes |
|----|---------|--------|
| AC-REC-01 / VAL-REC-CH-FE-01 | ⚪ carry | Retest #4 `RECCHQA-MSNK95YR` — not re-stamped |
| AC-REC-03 | ⚪ carry | Retest #4 |
| **AC-REC-02** | 🟢 **PASS** | Harness: `QA_AC_REC_02_ONLY=1` · testids per `po-hrm-rec-channels-consumer-ac-rec-02-fe-01.md` |

### Harness

- Updated `scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs`: `runAcRec02Filter()` + `hdsd-candidate-filter-source*` (replaces combobox `hasText: /Nguồn/` locator)
- JSON: `docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json`
- Screens: `docs/qa/evidence/screens/qa-po-hrm-rec-channels-consumer-01/ac-rec-02-*.png`

### honesty

- `settings_catalog_e2e_ready`: **false** (deny flip)
- `uf_hrm_10_full`: **false**

### pm_dispatch_hint

`qc` — **PO-HRM-REC-CHANNELS-CONSUMER-QC-01** narrow GWC on AC-REC-01..03 + AC-REC-02; **deny** `settings_catalog_e2e_ready` promotion.

### completion_report (retest #5)

**Closed:** AC-REC-02 filter by catalog code `CSO_01` via HDSD testids; row `RECCHQA-MSNK95YR` visible after filter. L0 🟢. Harness script updated.  
**Open:** None for this work_item — QC narrow gate.

### next_owner

`qc`

### ack_status

**PASS_TO_PM**

