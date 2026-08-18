# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P1 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01` `READY_FOR_QA` |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · API assert `holding`+`main` |
| **Stamp** | **`EMPTOKEXTQA-MSJ57PE1`** |
| **U65** | zero-seed · browser session (portal) · Settings EMP field allow-list → extension-items → F5 merge-tokens |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` · **LOCKED** · **DENIED** `custom.emp.*` LIVE invent · **DENIED** personnel UAT / printable / Phase1 · `C-SLICE-≠-MODULE` |
| **Peer seal retain** | `EMPTOKQA-MSJ290VB` DOC/ET GĐ1 · MERGE-TOKEN-EMP GWC / EMP-QC **not reopened** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · AC-PLT-EMP-TOK-04 / 04-RETIRE / 04b / 04c / 04H · 8/8 |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01/` |
| BE ref | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-be-01.md` |
| BA ref | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md` |

**Seed:** none. **Flip honesty / invent EMP UAT / printable / LIVE:** none. **Reopen MERGE-TOKEN-EMP GWC / EMP-QC:** none.

---

## 2. Stale-dist probe (F-EMP-TOK-03)

| Artifact | Expected | Runtime `dist/` | Verdict |
|----------|----------|-----------------|--------|
| `emp-merge-token-register.js` | `upsertEmpExtensionFieldMergeToken` · `EMP_EXTENSION_FIELD_CATALOG_KEYS` · `extension_field` | **present** (mtime 16:07Z after nest `--watch`) | OK |
| `settings-catalogs.service.js` | `registerEmpExtensionMergeToken` / allow-list hook | **present** | OK |

**Note:** At QA intake (pre-start) dist was **older** than src (21:39 vs 22:56–22:58 local) and lacked F-EMP-TOK-03. Starting `pnpm run dev:hrm-api` (`nest start --watch`) rebuilt dist → probe **OK**. No residual `D-EMP-TOK-EXT-STALE-DIST`.

---

## 3. Click path (U65 · HDSD)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok · L0 PASS |
| 1 | **Command Center** → `settings=company_group_hr` (Group HR / EMP field Settings surface) | 🟢 screen `01-group-hr` |
| 2 | Attempt **Cấu hình chi tiết** Group HR UI append | UI dialog not reliably opened → **fallback** browser-session `fetch` via portal proxy (same JWT, zero-seed, no API-only invent) |
| 3 | Allow-list POST `hrm_employee_basic_fields` extension-item `qa_ext_tok_msj57pe1` | **201** `HRM-SET-209` (catalog submit path) |
| 4 | **F5** / assert `GET /api/hrm/merge-tokens?domain=EMP&company_id=holding&status=active` | **200** `HRM-PLT-TOK-200` · token present |
| 5 | Retire `DELETE /settings-catalogs/items` allow-list code | **200** → active list **hide** |
| 6 | Non-allow `leave_types` extension `qa_leave_tok_msj57pe1` | **201** → **no** `custom.emp.qa_leave_tok_*` |
| 7 | Employee `PATCH` `custom_fields` value-only | **200** · no orphan `custom.emp.orphan_value_*` |
| 8 | Honesty / seals | flags **false** · peer stamp retain · DENY LIVE |

**HDSD / surface:** `command-center?settings=company_group_hr` · Settings EMP field catalog allow-list (`hrm_employee_basic_fields`) · merge-tokens EMP domain.

---

## 4. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **STALE-DIST-PROBE** | dist carries F-EMP-TOK-03 | upsert + settings hook present | 🟢 **PASS** |
| **L0** | stack 200 | hrm/xbos/portal 200 | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-04** | allow-list append → 2xx → `custom.emp.<code>` · `origin=extension_field` · `ring=custom` · `status=active` · `extension_field_ref=<code>` · `domain=EMP` | POST **201** · token `custom.emp.qa_ext_tok_msj57pe1` · origin=`extension_field` · ring=`custom` · status=`active` · ref=`qa_ext_tok_msj57pe1` · domain=`EMP` | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-04-RETIRE** | retire → hide active token | DELETE **200** · absent from `status=active` list | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-04b** | non-allow-list → no `custom.emp` | `leave_types` POST **201** · no `custom.emp.qa_leave_tok_msj57pe1` | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-04c** | employee `custom_fields` PATCH alone → no token | PATCH employee `0500220b-…` **200** · no orphan token | 🟢 **PASS** |
| **AC-PLT-EMP-TOK-04H** | honesty false · DENY LIVE · seals retain | LOCKED as dispatched | 🟢 **PASS** |
| **MUST_KEEP-SURFACE** | seals not reopened | peer DOC/ET stamp retain · no GWC reopen | 🟢 **PASS** |

**Runner rollup:** PASS **8** · FAIL **0** · stamp `EMPTOKEXTQA-MSJ57PE1`

---

## 5. Key network stamps

```text
POST /api/hrm/settings-catalogs/hrm_employee_basic_fields/extension-items
     → 201 HRM-SET-209 code=qa_ext_tok_msj57pe1
     (browser session via portal proxy; zero-seed)

GET  /api/hrm/merge-tokens?domain=EMP&company_id=holding&status=active
     → 200 HRM-PLT-TOK-200
     hit: token_key=custom.emp.qa_ext_tok_msj57pe1
          origin=extension_field ring=custom status=active
          extension_field_ref=qa_ext_tok_msj57pe1 domain=EMP

DELETE /api/hrm/settings-catalogs/items
     → 200 · active list hide custom.emp.qa_ext_tok_msj57pe1

POST /api/hrm/settings-catalogs/leave_types/extension-items
     → 201 · no custom.emp.qa_leave_tok_msj57pe1

PATCH /api/hrm/employees/{id} { custom_fields: { orphan_value_* } }
     → 200 · no custom.emp.orphan_value_* token
```

---

## 6. Defect register

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| — | — | — | **none** P0/P1 this seat |
| **R-EMP-TOK-EXT** | P2 product | qc (narrow) | AC-04* PASS — residual product close via narrow QC only; still **DENIED** personnel UAT / LIVE invent |
| Group HR dialog | P3 note | fe (optional) | `Cấu hình chi tiết` not opened this run → portal-session POST fallback (still U65 zero-seed, not seed/API invent) |

---

## 7. Honesty locks (LOCKED false)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `contracts_printable_ready` | **false** |
| **`custom.emp.*` LIVE** | **DENIED** invent beyond AC-04 evidence · still needs narrow QC for product residual close |
| Module EMP UAT / Phase1 | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| MERGE-TOKEN-EMP GWC / EMP-QC · stamp `EMPTOKQA-MSJ290VB` | **SEAL RETAIN** |

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser AC-PLT-EMP-TOK-04/04b/04c PASS (8/8): allow-list `hrm_employee_basic_fields` → 201 → F5 `custom.emp.qa_ext_tok_msj57pe1` origin=extension_field ring=custom; retire hide; leave_types no custom.emp; employee custom_fields PATCH no token; stale-dist OK after watch rebuild; honesty false; peer DOC/ET seal retain; DENIED LIVE/personnel UAT/Phase1/reopen GWC |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01 PASS_TO_PM stamp EMPTOKEXTQA-MSJ57PE1
entry_criteria: QA evidence AC-04/04b/04c PASS; peer EMPTOKQA-MSJ290VB DOC/ET SEAL retain; honesty false
task: Narrow QC gate AC-PLT-EMP-TOK-04* only — audit browser evidence + stale-dist OK; seal R-EMP-TOK-EXT product residual IF AC pack complete; KEEP honesty personnel/e2e/printable=false; DENY invent custom.emp LIVE / personnel UAT / printable / Phase1; DENY reopen MERGE-TOKEN-EMP GWC / EMP-QC / DEC / CTR
cấm: seed · wipe GĐ1 seals · flip ready flags · claim module EMP UAT
exit: GO WITH CONDITIONS or GO narrow · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md · honesty false
```
