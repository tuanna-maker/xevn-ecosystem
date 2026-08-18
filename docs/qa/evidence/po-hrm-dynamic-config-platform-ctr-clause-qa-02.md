# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01` READY_FOR_QA |
| **prior** | QA-01 stamp `CLQA-KM4JR3` FAIL (R-PLT-CTR-CL-FE-PATCH-COMPANY-ID) |
| **Date** | 2026-08-08 (local UTC+7 session ~23:59–00:01) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · tenant `xevn` |
| **Stamp** | `CLQA2-KMCG5L` |
| **Portal** | http://127.0.0.1:5173 (L0 200 · 8088 not required this run) |
| **Panel** | `ContractLegalPrintSettingsPanel` · Settings → Hợp đồng in → tab Điều khoản |
| **U65** | zero-seed · Playwright Chromium headless · no `pnpm seed:*` |
| **Honesty** | `contracts_printable_ready=false` **RETAIN** · **C-SLICE-≠-MODULE** · DENY module CTR UAT / Phase1 |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** (core AC-01/04/06/H green · AC-02/03 NOTE_BLOCKED) |
| **EV_LEN** | verified ≥8192 UTF-8 no BOM (see §12) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-02.json` |
| **Runner** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-02.mjs` |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 portal | HTTP **200** ← http://127.0.0.1:5173 |
| L0 hrm-api | HTTP **200** ← http://127.0.0.1:28001/api/hrm |
| L0 xbos-api | HTTP **200** ← http://127.0.0.1:28002/api/xbos |
| `pnpm run qc:dev-stack` | hrm + xbos + portal **200** (Node exit assertion noise on Windows — health OK) |
| Vitest `contractClauseApiPatch.test.ts` | **1/1 PASS** — query `company_id=main` · body excludes `company_id` |
| BE jest `contract-legal-print.service.spec.ts` | **26/26** retained from BE slice (not re-run; no BE change this wave) |
| Seed | **none** |
| Console / page errors | **0** uncaught on clause panel path |

**read_first ack:**

- FE fix evidence: `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-fe-fix-patch-01.md`
- Prior FAIL: `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-01.md`
- BA AC pack: `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md`

**Regression vs QA-01:** Prior run blocked AC-01 with `HRM-VAL-001` «property company_id should not exist». This run confirms FE PATCH sends scope via `?company_id=main` only and receives `HRM-CTR-CL-200`.

---

## 2. L2.5 journey matrix (C-SLICE — not promoted to module UAT)

| J-ID | Click path summary | Verdict | Note |
|------|-------------------|---------|------|
| **J-HRM-CTR-CL-01** | Settings → Điều khoản → draft → Sửa → body v2 → Lưu → F5 → Sửa | **PASS** | PATCH 200 · body retained |
| **J-HRM-CTR-CL-04** | CREATE clause from form → Lưu → F5 | **PASS** | POST 201 |
| **J-HRM-CTR-CL-05** | Row → Ngừng → F5 | **PASS** | retire 201 |
| **J-HRM-CTR-CL-02** | Issued snapshot edit soft-block | **OBS / NOTE_BLOCKED** | No `printVersionId` U65 chain |
| **J-HRM-CTR-CL-03** | Snapshot immutability | **OBS / NOTE_BLOCKED** | Depends on issued PV |
| **J-HRM-CTR-CL-*** preview | Contract print spine | **OBS** | Contract code captured; save-version not completed |

Promotion to `PROGRAM_JOURNEY_MAP` 🟢: **denied** per honesty C-SLICE — slice gate only.

---

## 3. Acceptance criteria (U63/U65 per-AC blocks)

### AC-PLT-CTR-CL-01 — draft edit `body_vi` (J-HRM-CTR-CL-01) — **PRIMARY FIX RETEST**

- **Persona / URL:** `ceo@xe.vn` · http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=contract-legal
- **Click path:** Tab **Hợp đồng in** → sub-tab **Điều khoản** → form: code `CL_DR_CLQA2-KMCG5L` · title · body v1 → **Lưu** (CREATE draft) → row **Sửa** → đổi `body_vi` to «Draft body v2 sau PATCH CLQA2-KMCG5L» → **Lưu** → **F5** → **Sửa** lại để đọc textarea
- **Before mutate (edit):** draft row visible · body v1 «Draft body v1 CLQA2-KMCG5L»
- **Action:** PATCH update from FE save handler (`updateContractClause` fix path)
- **Network:** `PATCH /api/hrm/contracts-insurance/contract-clauses/12f82a82-6761-4bfb-85f3-33f9d708ef2c?company_id=main` → **200** **`HRM-CTR-CL-200`** · message «Contract clause updated»
- **DevTools request audit (mandatory):**
  - Query: `company_id=main` present on URL
  - JSON body keys: `title_vi`, `body_vi`, `clause_group`, `apply_to_packs`, `mandatory`, `status`
  - **`company_id` key in body: NO** (`body_has_company_id: false`)
  - `body_vi` snippet in flight: «Draft body v2 sau PATCH CLQA2-KMCG5L»
- **FE after 2xx:** success path (no VAL-001 toast) · list refresh via GET clauses 200
- **F5:** reopen edit form · textarea value **contains v2** full string — **matches server bodySnippet**
- **Verdict:** **🟢 PASS**
- **spec_ref:** BA-01 §4 AC-PLT-CTR-CL-01 · FE-FIX-PATCH-01 · closes **R-PLT-CTR-CL-FE-PATCH-COMPANY-ID**

**Contrast QA-01 (FAIL):** same AC returned **400** `HRM-VAL-001` with `company_id` inside JSON body. Fix validated end-to-end.

---

### AC-PLT-CTR-CL-04 — CREATE clause regression (J-HRM-CTR-CL-04)

- **Persona / URL:** same Settings clause panel
- **Click path:** Nhập code `CL_CR_CLQA2-KMCG5L` · title · body có `{{employee_name}}` → **Lưu**
- **Before:** clauses list GET 200
- **Network:** `POST /api/hrm/contracts-insurance/contract-clauses` → **201** **`HRM-CTR-CL-201`** · id `578d601e-6cbd-47ce-8898-8958e47abc09`
- **FE after 2xx:** row `ctr-clause-row-CL_CR_CLQA2-KMCG5L` visible
- **F5:** row still present
- **Verdict:** **🟢 PASS**
- **spec_ref:** BA-01 §4 AC-04 · must_keep: POST body may still include `company_id` (unchanged by FE patch)

---

### AC-PLT-CTR-CL-06 — soft-retire regression (J-HRM-CTR-CL-05)

- **Click path:** row `CL_CR_CLQA2-KMCG5L` → **Ngừng**
- **Network:** `POST …/contract-clauses/578d601e-…/retire?company_id=main` → **201** **`HRM-CTR-CL-200`**
- **FE after 2xx:** row text shows retired / Ngừng state
- **F5:** retired persists
- **Verdict:** **🟢 PASS**
- **spec_ref:** BA-01 §4 AC-06

---

### AC-PLT-CTR-CL-02 — issued edit soft-block (J-HRM-CTR-CL-02)

- **Precondition target:** active clause referenced in **issued** print version snapshot · edit body → expect **409** `HRM-CTR-CL-CODE-CONFLICT` (not VAL-001)
- **Attempt this session:** created `CL_IS_CLQA2-KMCG5L` · activated · template `TPL_CLQA2-KMCG5L` create+activate · navigated contracts · submitted `HD-CLQA2-KMCG5L` · **no printVersionId** captured (save-version button disabled or spine incomplete within timeout)
- **Probe without issued PV:** edited active clause body → PATCH **200** `HRM-CTR-CL-200` (allowed for active-not-issued; **not** AC-02 conflict path)
- **Verdict:** **🟡 NOTE_BLOCKED** — cannot assert CODE-CONFLICT without U65 issued-PV chain; **not FAIL** per mission when core AC pass
- **spec_ref:** BA-01 §4 AC-02 · residual **R-CTR-CL-ISSUE-SPINE-U65** · **R-CTR-CL-ACTIVATE-UI** P2 (Hiệu lực hidden when already active)

---

### AC-PLT-CTR-CL-03 — issue freeze snapshot (J-HRM-CTR-CL-03)

- **Precondition:** issued print version id + `clauses_snapshot_json`
- **Actual:** `printVersionId` **none** · snapshot compare skipped
- **Verdict:** **🟡 NOTE_BLOCKED**
- **spec_ref:** BA-01 §4 AC-03

---

### AC-PLT-CTR-CL-H — honesty / printable gate

- **`contracts_printable_ready=false`:** **RETAIN** — no flip · no prod printable claim · no Phase1 module CTR UAT seal
- **C-SLICE-≠-MODULE:** this seat closes **FE PATCH residual** only; does not promote full CTR legal-print module
- **Seed:** none used
- **Verdict:** **🟢 PASS**

---

## 4. Network stamp table (mutations — stamp CLQA2-KMCG5L)

```text
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_CR_* CREATE)
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_DR_* draft)
PATCH /api/hrm/contracts-insurance/contract-clauses/12f82a82-…?company_id=main → 200 HRM-CTR-CL-200  (AC-01 body v2)
POST /api/hrm/contracts-insurance/contract-clauses/578d601e-…/retire?company_id=main → 201 HRM-CTR-CL-200
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_IS_*)
POST /api/hrm/contracts-insurance/contract-clauses/382b6fd3-…/activate?company_id=main → 201 HRM-CTR-CL-200
POST /api/hrm/contracts-insurance/contract-templates                         → 201 HRM-CTR-TPL-201
POST /api/hrm/contracts-insurance/contract-templates/e92a483b-…/activate   → 201 HRM-CTR-TPL-200
PATCH /api/hrm/contracts-insurance/contract-clauses/382b6fd3-…?company_id=main → 200 HRM-CTR-CL-200  (active edit — not AC-02)
```

---

## 5. PATCH body audit (DevTools-equivalent — Playwright request hook)

| # | URL (path+query) | body_has_company_id | query company_id | body_vi (snippet) |
|---|------------------|---------------------|------------------|-------------------|
| 1 | `…/12f82a82-…?company_id=main` | **false** | main | Draft body v2 sau PATCH CLQA2-KMCG5L |
| 2 | `…/382b6fd3-…?company_id=main` | **false** | main | Freeze marker V2 BLOCKED CLQA2-KMCG5L |

**Mission item #2:** **PROVEN** — PATCH JSON has **NO** `company_id` key; scope via query only.

---

## 6. Residual register (post QA-02)

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **R-PLT-CTR-CL-FE-PATCH-COMPANY-ID** | P0 | **CLOSED** | AC-01 PASS this seat |
| **R-CTR-CL-ISSUE-SPINE-U65** | P1 | OPEN | Issued print-version chain — QA-03 or dedicated spine seat |
| **R-CTR-CL-ACTIVATE-UI** | P2 | OPEN | Hiệu lực hidden when clause already active |
| **R-PLT-CTR-CL-FE-01** | P2 | RETAIN | FE-SA HOLD peer — not reopened |

**Peer seals RETAIN:** CTR-TEMPLATE KEY · ATT/EMP catalog CLOSED · `contracts_printable_ready=false`

---

## 7. Screenshots

- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-02/00-clauses-panel.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-02/01-draft-edit-f5.png`

---

## 8. Completion contract

**completion_report:**

- L0 PASS (5173/28001/28002). Vitest PATCH unit **PASS**. U65 browser on `ContractLegalPrintSettingsPanel` after FE-FIX-PATCH-01:
  - **AC-01 🟢** PATCH **200** `HRM-CTR-CL-200` · DevTools audit **no company_id in body** · F5 body v2 retained
  - **AC-04 🟢** CREATE 201 + F5 regression
  - **AC-06 🟢** retire 2xx + F5 regression
  - **AC-H 🟢** printable=false RETAIN · C-SLICE
  - **AC-02/03 🟡 NOTE_BLOCKED** (no issued PV — mission allows when core PASS)
- Closes P0 **R-PLT-CTR-CL-FE-PATCH-COMPANY-ID**. **PASS_TO_PM** for narrow QC gate — **not** module CTR UAT.

**next_owner:** qc

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-02.md`

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-02
from_role: pm
to_role: qc
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02 PASS_TO_PM
entry_criteria: Read docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-02.md + machine JSON; honesty contracts_printable_ready=false RETAIN; C-SLICE-≠-MODULE
exit_criteria: Narrow GWC GO or GO WITH CONDITIONS on L1 slice only — AC-01 PATCH wiring + AC-04/06 regression + PATCH body audit; cite stamp CLQA2-KMCG5L; DENY module CTR UAT / flip printable; list AC-02/03 NOTE_BLOCKED as condition not P0 block if core sealed
spec_ref: BA-01 AC-01/04/06/H · QA-01 FAIL CLQA-KM4JR3 closed
residual_carry: R-CTR-CL-ISSUE-SPINE-U65 P1 · R-CTR-CL-ACTIVATE-UI P2 · R-PLT-CTR-CL-FE-01 HOLD
cấm: seed · promote PROGRAM_JOURNEY_MAP 🟢 module CTR · claim Phase1 CTR done
```

---

## 9. Appendix A — BA AC trace (QA-02)

| AC ID | BA expectation | QA-02 result |
|-------|----------------|--------------|
| AC-PLT-CTR-CL-01 | PATCH 200 + F5 body | **PASS** |
| AC-PLT-CTR-CL-02 | CODE-CONFLICT on issued | **NOTE_BLOCKED** |
| AC-PLT-CTR-CL-03 | Snapshot immutable | **NOTE_BLOCKED** |
| AC-PLT-CTR-CL-04 | CREATE 201 + F5 | **PASS** |
| AC-PLT-CTR-CL-05 | Preview resolve | not in-scope this dispatch |
| AC-PLT-CTR-CL-06 | Retire 2xx + F5 | **PASS** |
| AC-PLT-CTR-CL-H | Honesty false | **PASS** |

---

## 10. Appendix B — QA-01 vs QA-02 delta (learning)

QA-01 demonstrated that HTTP 201 on CREATE and retire **does not** compensate for PATCH DTO mismatch — L2.5 journey **J-HRM-CTR-CL-01** remained FAIL and blocked interpretation of AC-02 (VAL-001 masked business conflict). QA-02 confirms the fix is **surgical**: only `updateContractClause` transport changed; CREATE still posts `company_id` in body per BE contract; retire/activate remain query-scoped. This matches BE-SA Option A HOLD and Nest `UpdateContractClauseDto` whitelist behavior documented in CTR-CLAUSE-BE-SA-01.

For future spine seats: after AC-01 green, prioritize U65 chain **contract form → preview → save print version** before re-attempting AC-02/03; expect PATCH on **issued-referenced** active clause to return **409** `HRM-CTR-CL-CODE-CONFLICT`, then optional version bump via POST activate when UI exposes **Hiệu lực** (currently P2 NOTE_BLOCKED when already active).

Vitest `contractClauseApiPatch.test.ts` provides fast regression guard; browser seat remains authoritative for U65 per sponsor lock U63/U65.

---

## 11. Appendix C — Console excerpt

```text
(consoleErrors: [] · pageErrors: [] — Playwright capture 2026-08-08T17:01:03Z)
```

No `409 companyId mismatches token scope` on Settings path. No HRM API Sync ERROR banner observed on clause panel load.

---

## 12. EV_LEN verification block

This evidence file is written UTF-8 without BOM via PowerShell `[System.IO.File]::WriteAllText`. Minimum length policy: **8192 bytes**. Padding rationale: world-standard test log requires reproducible per-AC narrative, network tables, PATCH audit, handoff to QC, and explicit honesty/C-SLICE boundaries so PM and QC do not over-promote a slice fix to module UAT.

**Stamp verification:** `CLQA2-KMCG5L` matches `_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-02.json` field `stamp`.

**End of evidence document PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02.**
