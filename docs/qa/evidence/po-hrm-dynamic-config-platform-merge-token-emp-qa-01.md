# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P0 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DEVOPS-01` (`READY_FOR_QA` · closes `D-EMP-TOK-STALE-DIST`) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · API assert `holding`+`main` |
| **Stamp (prior FAIL)** | `EMPTOKQA-MSJ1R7MT` |
| **Stamp (retest PASS)** | **`EMPTOKQA-MSJ290VB`** |
| **U65** | zero-seed · **browser-only** Settings DOC/ET → assert merge-tokens |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **LOCKED** · DENY module EMP UAT / Phase1 · `C-SLICE-≠-MODULE` |
| **ack_status** | **PASS_TO_PM** (retest after DEVOPS-01) |
| **overall** | **PASS** · AC-PLT-EMP-TOK-01..03+05 · stale=OK · CLOSED `D-EMP-TOK-STALE-DIST` |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| `qc:fe-be-health` | **ALL PASS** |
| Unauth `GET /merge-tokens?domain=EMP` | **401** (route mounted — not 404) |
| Unauth `POST /merge-tokens/resolve-preview` | **400** (route mounted — validation) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-merge-token-emp-qa-01/` |
| BE ref | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md` |
| DATA ref | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md` |

**Seed:** none. **Flip honesty / invent EMP UAT / printable / custom.emp LIVE:** none. **EMP-QC-01/02:** not reopened.

---

## 2. Stale-dist probe (EMP/DEC pattern class)

| Artifact | Expected (src BE-01) | Runtime `dist/` | Verdict |
|----------|----------------------|-----------------|--------|
| `merge-tokens.controller.js` | present | **present** | OK (routes live) |
| `emp-merge-token-register.js` | present | **MISSING** | 🔴 |
| `MERGE_TOKEN_ORIGINS` incl. `emp_catalog` | src has it | dist has `allowance_catalog` only — **no `emp_catalog`** | 🔴 |
| `emp-document-type.service.js` register hook / `withTransaction` | src imports register | **no** register / `emp.doc.` / `withTransaction` | 🔴 |
| `emp-employment-type.service.js` same | src wired | **no** hook in dist | 🔴 |

**Class:** same as `D-EMP-PLT-STALE-DIST` / `D-DEC-PLT-STALE-DIST` — **source newer than runtime dist** (src register ~21:23–21:26; dist merge-tokens ~21:21). Routes exist but **EMP register side-effect is not live**.

Residual: **`D-EMP-TOK-STALE-DIST` P0** → **devops** rebuild+restart hrm-api → QA retest this WI.

---

## 3. Click path (U65 · HDSD)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok · L0 PASS |
| 1 | **Settings** → tab **Loại giấy tờ EMP** (`settings-tab-emp-document-types`) | 🟢 |
| 2 | DOC key `hr_doc_tok_msj1r7mt` · nhãn · **Tạo** | Network **PUT** `/api/hrm/employees/document-types` → **200** `HRM-EMP-DOC-200` id=`cb1dc2b9-…` |
| 3 | **F5** → assert `GET /api/hrm/merge-tokens?domain=EMP` | List **200** `items=[]` · **missing** `emp.doc.hr_doc_tok_msj1r7mt` |
| 4 | **Settings** → **Loại hình thuê EMP** | 🟢 |
| 5 | ET `seasonal_tok_msj1r7mt` → **200**; `full-time` → persist **`full_time`** | PUT **200** `HRM-EMP-ET-200` · normalize PASS |
| 6 | Assert `emp.et.seasonal_tok_msj1r7mt` + `emp.et.full_time` | **missing** (list empty / no hit) |
| 7 | Retire seasonal ET | Catalog retire attempted; token never registered → retire proof **blocked** (catalog retire HTTP 500 on probe body — non-blocking vs TOK register) |
| 8 | resolve-preview (auth supplemental) | **201** — created DOC/ET tokens **missing**; CCCD/FULL_TIME → `source=missing` (no invent labels) |
| 9 | must_keep | contracts-insurance list **200**; builtin `employee.full_name` resolve **builtin**; EMP-QC seals untouched; `custom.emp.*` **HOLD** |

**HDSD ids:** `settings-tab-emp-document-types` · `settings-tab-emp-employment-types` · `hdsd-emp-document-type-key|name|save` · `hdsd-emp-employment-type-key|name|save`

---

## 4. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-EMP-TOK-01** | DOC Lưu → F5 GET merge-tokens?domain=EMP has `emp.doc.<key>` `origin=emp_catalog` | DOC **PUT 200** · merge-tokens list **200** empty · token **absent** | 🔴 **FAIL** |
| **AC-PLT-EMP-TOK-02** | ET create/normalize → `emp.et.<key>`; retire → token retired | ET create+normalize **PASS**; tokens **absent**; retire token N/A | 🔴 **FAIL** |
| **AC-PLT-EMP-TOK-03** | resolve-preview `name_vi` from effective catalog; no invent CCCD/FULL_TIME | Auth probe: CCCD/FULL_TIME = **missing** (no invent) ✅; created DOC/ET keys also **missing** (no catalog label bag) ❌ | 🔴 **FAIL** |
| **AC-PLT-EMP-TOK-05** | must_keep seals/XBOS/contracts/keyword_map fallback | EMP-QC not reopened · `custom.emp` not claimed LIVE · contracts-insurance **200** · builtin resolve **OK** · catalog-sync **200** | 🟢 **PASS** (narrow; does not lift overall) |
| **STALE-DIST-PROBE** | dist carries BE-01 register | register.js missing · no `emp_catalog` in dist constants | 🔴 **FAIL** |

**Runner rollup:** PASS 7 · FAIL 7 · stamp `EMPTOKQA-MSJ1R7MT`  
(Note: runner TOK-05 initially FAIL due to wrong `/contracts` path + SI `page_size`; corrected supplemental probes → must_keep surfaces OK — overall still **FAIL** on TOK-01/02/stale.)

---

## 5. Key network stamps

```text
PUT  /api/hrm/employees/document-types
     → 200 HRM-EMP-DOC-200 key=hr_doc_tok_msj1r7mt id=cb1dc2b9-…

GET  /api/hrm/merge-tokens?domain=EMP&company_id=holding&status=active
     → 200 HRM-PLT-TOK-200 items=[] total=0
     (expect emp.doc.hr_doc_tok_msj1r7mt origin=emp_catalog — ABSENT)

PUT  /api/hrm/employees/employment-types
     → 200 HRM-EMP-ET-200 key=seasonal_tok_msj1r7mt
PUT  … (full-time) → 200 employmentTypeKey=full_time

GET  merge-tokens?domain=EMP → no emp.et.seasonal_tok_msj1r7mt / emp.et.full_time

POST /api/hrm/merge-tokens/resolve-preview
     → 201 HRM-PLT-TOK-200
     employee.full_name → source=builtin
     emp.doc.hr_doc_tok_msj1r7mt → missing HRM-PLT-TOKEN-UNKNOWN
     emp.doc.cccd / emp.et.full_time → missing (no invent labels)
```

---

## 6. Defect register

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| **D-EMP-TOK-STALE-DIST** | **P0** | **devops** | Runtime dist missing `emp-merge-token-register.js`; `MERGE_TOKEN_ORIGINS` lacks `emp_catalog`; DOC/ET dist services lack register hooks. Browser DOC/ET 2xx but merge-tokens never upserted. Peer EMP/DEC rebuild pattern. |
| **R-EMP-TOK-EXT** | P2 | hold | `custom.emp.*` LIVE — **HOLD** (not claimed) |
| OBS | — | qa | Runner first pass used `/api/hrm/contracts` (404) — correct path `/api/hrm/contracts-insurance/contracts`. resolve-preview rejects unknown body keys (`tokens`) → 400; correct body → 201. |

---

## 7. Honesty locks

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** — FAIL slice ≠ invent ready |
| `employees_e2e_linkage_ready` | **false** |
| `contracts_printable_ready` | **false** |
| Module EMP UAT / Phase1 DONE | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| Seed | **none** |
| EMP-QC-01/02 | **SEAL retained** — not reopened |
| `custom.emp.*` LIVE | **DENIED** (R-EMP-TOK-EXT HOLD) |

---

## 8. Handoff (historical FAIL — superseded by §9)

| Field | Value |
|-------|--------|
| **completion_report** | *(historical)* Closed QA U65 browser for MERGE-TOKEN-EMP: L0 PASS; merge-tokens routes mounted (401/400 not 404); **stale dist P0** — register/`emp_catalog` absent from runtime; Settings DOC PUT 200 + ET PUT 200/normalize PASS but **F5 GET merge-tokens?domain=EMP empty**. Stamp `EMPTOKQA-MSJ1R7MT`. |
| **next_owner** | **devops** *(historical — completed)* |
| **ack_status** | **FAIL_TO_PM** *(historical)* → see **§9 PASS_TO_PM** |

### next_dispatch_prompt (copy-ready) — **SUPERSEDED by §9 retest PASS**

```text
(historical FAIL path → DEVOPS-01 — closed EMPTOKDEVOPS-6A75EE71)
```

---

## 9. RETEST after DEVOPS-01 — stamp `EMPTOKQA-MSJ290VB`

| Field | Value |
|-------|--------|
| **change_mode** | RETEST |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DEVOPS-01` · stamp `EMPTOKDEVOPS-6A75EE71` |
| **prior FAIL** | `EMPTOKQA-MSJ1R7MT` · residual `D-EMP-TOK-STALE-DIST` |
| **stamp** | **`EMPTOKQA-MSJ290VB`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (14/14 · FAIL 0 · stale=OK) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01-browser.json` |
| **Runner** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-qa-01.mjs` (probe hygiene: no `tokens` body · retire `?company_id=` · contracts-insurance · SI no page_size) |
| **U65** | zero-seed · browser Settings DOC/ET → merge-tokens |
| **Honesty** | personnel/e2e/printable **false LOCKED** · DENY EMP UAT · DENY `custom.emp` LIVE · EMP-QC **not reopened** |

### 9.1 Entry criteria

| Check | Result |
|-------|--------|
| Unauth `GET /merge-tokens?domain=EMP&company_id=holding` | **401** (not 404) |
| Dist `emp-merge-token-register.js` + `emp_catalog` + DOC/ET `upsertEmpCatalogMergeToken` | **PRESENT** (mtime 21:39:15) |
| `qc:fe-be-health` | **ALL PASS** |
| `qc:dev-stack` | HRM/XBOS/portal **200** (UV_HANDLE noise ignore) |
| Seed | **none** |

### 9.2 AC retest map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC-PLT-EMP-TOK-01** | DOC Lưu → F5 GET merge-tokens?domain=EMP has `emp.doc.<key>` `origin=emp_catalog` | PUT **200** `HRM-EMP-DOC-200` key=`hr_doc_tok_msj290vb` · GET **200** hit `emp.doc.hr_doc_tok_msj290vb` origin=`emp_catalog` labelVi=`GT MergeTok QA msj290vb` | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-02** | ET create/normalize → `emp.et.<key>`; retire → token retired | ET PUT **200** `seasonal_tok_msj290vb` + normalize `full-time`→`full_time` · tokens `emp.et.seasonal_tok_msj290vb` + `emp.et.full_time` origin=`emp_catalog` · retire **201** → seasonal **hidden from active** | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-03** | resolve-preview `name_vi` from effective; no invent CCCD | Preview **201** · DOC/ET `source=registry` + catalog labels · `emp.doc.cccd` `source=missing` (no invent) · `full_time` registry OK (not invent) | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-05** | must_keep seals/XBOS/contracts/keyword_map | contracts-insurance **200** `HRM-CON-200` · SI **200** `HRM-EINS-200` · catalog-sync **200** · builtin `employee.full_name` `source=builtin` · EMP-QC not reopened · `custom.emp` HOLD | 🟢 **PASS** |
| **STALE-DIST-PROBE** | register + emp_catalog live | **OK** | 🟢 **PASS** |

### 9.3 Key network stamps (retest)

```text
PUT  /api/hrm/employees/document-types
     → 200 HRM-EMP-DOC-200 key=hr_doc_tok_msj290vb id=5a17b7d8-…

GET  /api/hrm/merge-tokens?domain=EMP&company_id=holding&status=active
     → 200 HRM-PLT-TOK-200 · hit emp.doc.hr_doc_tok_msj290vb origin=emp_catalog

PUT  /api/hrm/employees/employment-types
     → 200 HRM-EMP-ET-200 key=seasonal_tok_msj290vb
     → 200 employmentTypeKey=full_time (normalize)

GET  merge-tokens?domain=EMP → emp.et.seasonal_tok_msj290vb + emp.et.full_time origin=emp_catalog

POST /api/hrm/employees/employment-types/{id}/retire?company_id=main
     → 201 HRM-EMP-ET-200 · seasonal token hidden from active list

POST /api/hrm/merge-tokens/resolve-preview { companyId, tokenKeys }
     → 201 HRM-PLT-TOK-200
     emp.doc.hr_doc_tok_msj290vb → registry "GT MergeTok QA msj290vb"
     emp.et.full_time → registry catalog label
     emp.doc.cccd → missing HRM-PLT-TOKEN-UNKNOWN (no invent)
     employee.full_name → builtin
```

### 9.4 Defect register (retest)

| ID | Status | Note |
|----|--------|------|
| **D-EMP-TOK-STALE-DIST** | **CLOSED** | DEVOPS-01 rebuild+restart · QA retest PASS |
| **R-EMP-TOK-EXT** | P2 HOLD | `custom.emp.*` LIVE — **not claimed** |
| OBS (runner) | fixed in-seat | Prior false FAIL: body `tokens` → VAL-001; retire without `?company_id=`; `/contracts` 404; SI `page_size` 400 — corrected before verdict |

### 9.5 Honesty locks (unchanged)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** — PASS slice ≠ invent ready |
| `employees_e2e_linkage_ready` | **false** |
| `contracts_printable_ready` | **false** |
| Module EMP UAT / Phase1 DONE | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| Seed | **none** |
| EMP-QC-01/02 | **SEAL retained** |
| `custom.emp.*` LIVE | **DENIED** |

### 9.6 Handoff (retest)

| Field | Value |
|-------|--------|
| **completion_report** | Closed QA retest after DEVOPS-01: `D-EMP-TOK-STALE-DIST` **CLOSED**; L0+dist OK; U65 browser Settings DOC/ET → merge-tokens **AC-PLT-EMP-TOK-01..03+05 all PASS** (stamp `EMPTOKQA-MSJ290VB`); DOC/ET register `origin=emp_catalog`; retire hides seasonal token; resolve-preview catalog labels + CCCD missing (no invent); must_keep contracts/SI/catalog/builtin retained. Honesty false LOCKED. DENY EMP UAT / printable / custom.emp LIVE / reopen EMP-QC. |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready — retest PASS)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01 PASS_TO_PM
program: PO-HRM-CONTINUOUS-W8-20260807
stamp_ref: EMPTOKQA-MSJ290VB · closed D-EMP-TOK-STALE-DIST via EMPTOKDEVOPS-6A75EE71
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md §9
ref_devops: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-devops-01.md

entry_criteria: QA PASS AC-PLT-EMP-TOK-01..03+05; U65 browser Settings DOC/ET→merge-tokens; honesty LOCKED false
task: Gate GWC/GO for MERGE-TOKEN-EMP slice only — audit evidence §9 stamps; must_keep seals/XBOS/contracts/keyword_map; DENY invent EMP UAT / printable / custom.emp LIVE / reopen EMP-QC; C-SLICE-≠-MODULE.
exit: GO | GWC | NO-GO with residual · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md
cấm: seed · flip hrm_personnel_uat_ready / employees_e2e / printable · claim module EMP UAT DONE
```
