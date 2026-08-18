# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01` CONFIRMED · EXT-SA-01 Option **B′ LOCKED** |
| **change_mode** | **ADD** |
| **ref_ba** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BA-01.md` |
| **ref_sa** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-SA-01.md` |
| **ref_qc_peer** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qc-01.md` · stamp **`EMPTOKQA-MSJ290VB`** · GĐ1 DOC/ET SEAL **retain** |
| **ack_status** | **READY_FOR_QA** |

### Honesty locks (LOCKED false — DENIED invent LIVE)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `contracts_printable_ready` | **false** |
| **`custom.emp.*` LIVE** | **DENIED** until QA AC-04 PASS + narrow QC |
| Module EMP UAT / Phase1 | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| MERGE-TOKEN-EMP GWC / EMP-QC | **SEAL RETAIN** — not reopened |
| ba-data EXPAND | **HOLD** — no seat |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ba** | EXT-BA-01 §3 BR-PLT-EMP-TOK-01..06 · §4 allow-list · §6 AC-04/04b/04c · §7 VAL-EMP-TOK-05* |
| **sa** | EXT-SA-01 Option **B′** §5.1–§5.2 · §6 F-EMP-TOK-03 · L-EMP-EXT-01..09 |
| **api** | PLATFORM-API-01 **F-PLT-TOK-02** · BR-PLT-01 shape `custom.emp.<code>` |
| **gđ1 peer** | MERGE-TOKEN-EMP-BE-01 DOC/ET `emp_catalog` SEAL · `emp-merge-token-register.ts` |
| **sponsor_confirm** | EXT-BA CONFIRMED · EXT-SA B′ LOCKED · PM unlock EXT-BE-01 |

---

## Delivered

| # | Item | Stamp |
|---|------|-------|
| 1 | Allow-list helpers + core-column skip | `emp-merge-token-register.ts` — `EMP_EXTENSION_FIELD_CATALOG_KEYS` · `upsertEmpExtensionFieldMergeToken` |
| 2 | **F-EMP-TOK-03** same-TX on Settings extension create/upsert | `SettingsCatalogsService.appendExtensionItems` when catalog ∈ basic\|personal\|work\|finance (+aliases) |
| 3 | Retire → soft-retire `custom.emp.<code>` | `deleteCatalogItem` allow-list path |
| 4 | Token fail → TX rollback | `withTransaction` throw path · VAL-EMP-TOK-05t |
| 5 | Non-allow-list **no** token | leave_types / job_titles / contact fields · VAL-05b |
| 6 | Employee `custom_fields` PATCH **no** register | VAL-05c static proof (no import) |
| 7 | Jest | `emp-extension-merge-token.spec.ts` + settings-catalogs `withTransaction` mock |
| 8 | No ba-data EXPAND · no dual table · no seed · DOC/ET untouched | verified |

**Token row (active):** `token_key=custom.emp.<code>` · `origin=extension_field` · `domain=EMP` · `ring=custom` · `extension_field_ref=<code>` · `status=active`

---

## Verification

```text
pnpm exec jest --testPathPatterns="emp-extension-merge-token|settings-catalogs.service.spec|emp-merge-token-register" --no-coverage
→ Test Suites: 3 passed · Tests: 38 passed
```

| VAL | Result |
|-----|--------|
| **VAL-EMP-TOK-05** allow-list → `custom.emp.*` · `origin=extension_field` | PASS |
| **VAL-EMP-TOK-05** alias `employee_work_fields` | PASS |
| **VAL-EMP-TOK-05r** retire soft-retire | PASS |
| **VAL-EMP-TOK-05** core `full_name` skip | PASS |
| **VAL-EMP-TOK-05b** non-allow-list zero token | PASS |
| **VAL-EMP-TOK-05t** token fail → TX throw | PASS |
| **VAL-EMP-TOK-05c** employee PATCH alone no register | PASS |
| GĐ1 DOC/ET register suite (emp-merge-token-register) | PASS (regression) |

---

## QA matrix (AC to retest — U65 browser-first)

| AC | Focus |
|----|--------|
| **AC-PLT-EMP-TOK-04** | Settings EMP field catalog allow-list → append extension → 2xx → F5 `GET merge-tokens?domain=EMP` has `custom.emp.<code>` · origin=extension_field · ring=custom · retire hide |
| **AC-PLT-EMP-TOK-04b** | Non-allow-list extension save → **no** new `custom.emp.*` |
| **AC-PLT-EMP-TOK-04c** | Employee PATCH `custom_fields` alone → **no** new token |
| **Honesty** | Keep ready flags **false** · **DENIED** LIVE / personnel UAT / Phase1 · **cấm** reopen GĐ1 GWC |

**cấm evidence:** `pnpm seed:*` · invent LIVE · reopen EMPTOKQA-MSJ290VB DOC/ET

---

## Residuals

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **R-EMP-TOK-EXT** | P2 | qa → qc | Product close after AC-04* PASS + narrow QC — still DENIED personnel UAT |
| **C-SLICE-≠-MODULE** | — | pm | Keep honesty false |
| Dist stale risk | P2 | devops if QA sees 2xx item + empty tokens | Peer D-EMP-TOK-STALE-DIST — rebuild `:28001` if needed |

---

## must_keep check

| Item | Status |
|------|--------|
| Single `hrm_merge_tokens` | PASS |
| GĐ1 DOC/ET `emp_catalog` SEAL · stamp EMPTOKQA-MSJ290VB | not reopened |
| F-PLT-TOK-01..03 · keyword_map fallback | untouched |
| Soft-delete only | PASS |
| DEC · CTR · LIST-TOTALS seals | untouched |
| `ready=false` · `printable=false` | LOCKED |
| ba-data HOLD | no EXPAND |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | F-EMP-TOK-03 wired: SettingsCatalogs extension-items on EMP field allow-list same-TX upsert/retire `custom.emp.<code>` origin=extension_field ring=custom via F-PLT-TOK-02 columns; negatives 05b/05c; jest 38 PASS; honesty false; GĐ1 seals retained; READY_FOR_QA AC-04* |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-be-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-BE-01 READY_FOR_QA
entry_criteria: L0 qc:dev-stack; hrm-api dist includes emp-merge-token-register + SettingsCatalogs F-EMP-TOK-03; U65 zero-seed; stamp EMPTOKQA-MSJ290VB DOC/ET SEAL retain
task: Browser U65 AC-PLT-EMP-TOK-04 / 04b / 04c — Settings allow-list EMP field catalog append extension → 2xx → F5 GET merge-tokens?domain=EMP custom.emp.<code> origin=extension_field ring=custom; retire hide; non-allow-list no custom.emp; employee custom_fields PATCH alone no token; probe L1 phụ only
cấm: seed; invent LIVE; reopen MERGE-TOKEN-EMP GWC / EMP-QC; claim personnel UAT / printable / Phase1
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md · honesty false
```
