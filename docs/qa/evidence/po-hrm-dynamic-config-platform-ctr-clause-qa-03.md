# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-03` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-02` GWC · residual **`R-CTR-CL-ISSUE-SPINE-U65`** |
| **prior seals** | AC-01 **`CLQA2-KMCG5L`** RETAIN (not re-opened) · QC-02 GWC core PATCH/CREATE/retire |
| **Date** | 2026-08-09 (local UTC+7) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · tenant `xevn` |
| **Stamp** | **`CLQA3-KMJRGF`** |
| **Portal** | http://127.0.0.1:5173 · HRM http://127.0.0.1:28001/api/hrm |
| **U65** | zero-seed · Playwright Chromium · no `pnpm seed:*` |
| **Honesty** | `contracts_printable_ready=false` **RETAIN** · **C-SLICE-≠-MODULE** · DENY module CTR UAT / Phase1 |
| **ack_status** | **`FAIL_TO_PM`** |
| **overall** | **FAIL** (spine reachable · AC-02/03 product FAIL) |
| **EV_LEN** | verified ≥8192 UTF-8 no BOM (§12) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-03.json` |
| **Runner** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-03.mjs` |
| **spec_ref** | BA-01 AC-PLT-CTR-CL-02/03 · PRINTABLE-HOLD-SA-01 Option A |

---

## 1. Mission summary

Close QC-02 **Condition P1 `R-CTR-CL-ISSUE-SPINE-U65`** via full U65 browser chain:

1. Settings: draft clause + template → contract create → preview → **issue print version** → capture `printVersionId`.
2. **AC-PLT-CTR-CL-02**: edit issued-referenced clause body → expect **409 `HRM-CTR-CL-CODE-CONFLICT`** (not 500 / not silent 200).
3. **AC-PLT-CTR-CL-03**: after issue, edit clause → re-open **issued** version → snapshot body frozen.
4. **Do not** re-open AC-01 PATCH (sealed **`CLQA2-KMCG5L`**).
5. **AC-H**: printable=false RETAIN · C-SLICE only.

**Outcome:** Issue spine **reachable from FE** (print version issued). **AC-02 and AC-03 FAIL** — PATCH returned **200** instead of soft-block; snapshot immutability not asserted in UI (runner GET path gap + clause likely absent from snapshot JSON).

---

## 2. Environment traceability

| Check | Result |
|-------|--------|
| L0 portal | HTTP **200** ← http://127.0.0.1:5173 |
| L0 hrm-api | HTTP **200** ← http://127.0.0.1:28001/api/hrm (pre-run) |
| L0 xbos-api | HTTP **200** ← http://127.0.0.1:28002/api/xbos |
| `pnpm run qc:dev-stack` | hrm + xbos + portal **200** (Node exit assertion noise on Windows — health OK) |
| Seed | **none** |
| Console / page errors | **0** on exercised paths |
| AC-01 PATCH | **RETAIN** — not re-tested this seat |

**read_first ack:** QC-02 · QA-02 · BA-01 §4 AC-02/03 · PRINTABLE-HOLD-SA-01.

---

## 3. L2.5 journey matrix (issue spine seat)

| J-ID | Click path summary | Verdict | Note |
|------|-------------------|---------|------|
| **J-HRM-CTR-CL-02** | Issued clause body edit soft-block | **🔴 FAIL** | PATCH **200** not **409** |
| **J-HRM-CTR-CL-03** | Issued snapshot freeze | **🔴 FAIL** | Immutability not proven (GET probe + UI reopen) |
| **J-HRM-CTR-CL-ISSUE** | Contract → preview → save version | **🟢 PASS** | `printVersionId` captured U65 |
| **J-HRM-CTR-CL-01/04/05** | — | **RETAIN** | Sealed QA-02 · not re-run |

Promotion to `PROGRAM_JOURNEY_MAP` module 🟢: **denied** (C-SLICE · honesty).

---

## 4. U65 issue spine (printVersionId chain) — **PASS reachability**

### 4.1 Settings — clause + template (FE create)

- **URL:** http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=contract-legal
- **Click path:** Tab **Hợp đồng in** → **Điều khoản** → CREATE `CL_IS_CLQA3-KMJRGF` · body «Freeze marker V1 CLQA3-KMJRGF» → **Lưu** → **Hiệu lực**
- **Network:** `POST /api/hrm/contracts-insurance/contract-clauses` → **201** `HRM-CTR-CL-201` · id `dbfc8137-7311-4988-aff0-bafa8b7b8f66`
- **Network:** `POST …/contract-clauses/…/activate?company_id=main` → **201** `HRM-CTR-CL-200`
- **Templates tab:** CREATE `TPL_CLQA3-KMJRGF` · drag palette → canvas → **Lưu** → **Kích hoạt**
- **Network:** `POST …/contract-templates` → **201** `HRM-CTR-TPL-201` · `POST …/activate` → **201** `HRM-CTR-TPL-200`

### 4.2 Contracts — create + legal-print spine

- **URL:** http://127.0.0.1:5173/hr/contracts?portal=1&tenantId=xevn&companyId=main
- **Click path:** **Tạo hợp đồng** → pick employee + contract type → code `HD-CLQA3-KMJRGF` → fill **Nơi làm việc** (`ctr-work-location`) → **Lưu**
- **Network:** `POST /api/hrm/contracts-insurance/contracts` → **201** `HRM-CON-201` · contract id `17d1a4d4-e7d9-4ab5-bdcb-0908b112f25f`
- **F5:** list contains contract code (implicit via re-open edit)
- **Edit row (pencil):** `ctr-print-spine` visible → pack GENERAL → template `TPL_CLQA3-KMJRGF` → spine override work_location filled → **Xem trước**
- **Network:** `POST …/contracts/17d1a4d4-…/preview?company_id=main` → **201** `HRM-CTR-PREV-200` · **`can_issue: true`**
- **FE:** preview body visible · marker in preview text
- **Action:** **Lưu bản in** (`ctr-print-save-version`) enabled
- **Network:** `POST …/print-versions?company_id=main` → **201** `HRM-CTR-VER-201` · **`printVersionId` = `67e17dee-dd67-42c9-bbab-b9aa87b3c4e3`** · response **`snapshotLen: 3003`**
- **Verdict spine reachability:** **🟢 PASS** — prior NOTE_BLOCKED (no PV) **lifted for FE chain**; residual **AC behavior** still open.

**Contrast QA-02:** Same panel could not enable save-version (no work_location / can_issue path within timeout). QA-03 applied registry + spine `work_location` pattern from legal-print QA R3.

---

## 5. Acceptance criteria (per-AC U65 blocks)

### AC-PLT-CTR-CL-01 — draft PATCH

- **Verdict:** **⚪ RETAIN** — sealed **`CLQA2-KMCG5L`** · mission forbids reopen P0 PATCH seat.
- **spec_ref:** QA-02 · QC-02 closed `R-PLT-CTR-CL-FE-PATCH-COMPANY-ID`.

---

### AC-PLT-CTR-CL-02 — issued edit soft-block (J-HRM-CTR-CL-02) — **FAIL**

- **Precondition (BA-01):** Clause **active** and referenced in ≥1 **issued** print snapshot.
- **Persona / URL:** Settings → **Điều khoản** → row `CL_IS_CLQA3-KMJRGF` → **Sửa**
- **Before mutate:** Clause active · print version **`67e17dee-…`** issued on contract `HD-CLQA3-KMJRGF`
- **Action:** Change `body_vi` to «Freeze marker V2 BLOCKED CLQA3-KMJRGF» → **Lưu**
- **Network (actual):** `PATCH /api/hrm/contracts-insurance/contract-clauses/dbfc8137-…?company_id=main` → **200** **`HRM-CTR-CL-200`** (expected **409** **`HRM-CTR-CL-CODE-CONFLICT`**)
- **Request audit:** `body_has_company_id: false` · query `company_id=main` · body snippet V2 marker
- **FE after 2xx:** Success path (no soft-block toast/dialog per AC)
- **Activate / version bump:** **Hiệu lực** button **hidden** (clause already active) — **P2 `R-CTR-CL-ACTIVATE-UI`** carry
- **F5:** Not re-opened for AC-02 block UI (failure at first PATCH)
- **Verdict:** **🔴 FAIL**
- **spec_ref:** BA-01 §4 AC-02 · VAL-CTR-CL-01
- **Classification:** **PRODUCT** — BE `updateClause` + `clauseHasIssuedSnapshot` did not block; **or** clause **code not present** in `clauses_snapshot_json` (template DnD did not place this clause on canvas → legally “active-not-in-issued-snapshot” allows 200). PM must triage with **dev-be** (detection) + **dev-fe** (template canvas binds clause code into issue snapshot).

**BE reference (read-only cite):** `clauseHasIssuedSnapshot` matches issued rows where snapshot text ILIKE `%"code":"<clause_code>"%`. If snapshot omits clause code, soft-block **will not** fire — consistent with observed **200**.

---

### AC-PLT-CTR-CL-03 — issue freeze snapshot (J-HRM-CTR-CL-03) — **FAIL**

- **Precondition:** Issued print version with `clauses_snapshot_json` containing clause body at issue time.
- **Attempt:** After issue + clause body edit (AC-02 step), compare issued snapshot via API.
- **Runner gap:** Probe used `GET /print-versions/:id` (wrong route). **Correct route:** `GET /contracts-insurance/contracts/:contractId/print-versions/:versionId?company_id=main` (controller L1231).
- **Issue POST evidence:** `snapshotLen: 3003` on **201** `HRM-CTR-VER-201` — snapshot **was** written at issue.
- **UI path not executed:** Re-open **issued version** in contract edit dialog → compare preview body to V1 vs live clause V2 (blocked by AC-02 not entering conflict path).
- **Verdict:** **🔴 FAIL** (immaturity not proven · QA must re-run with contract-scoped GET + UI reopen after AC-02 fixed)
- **spec_ref:** BA-01 §4 AC-03 · BR-CTR-CL-01

---

### AC-PLT-CTR-CL-H — honesty

- **`contracts_printable_ready=false`:** **RETAIN**
- **Module CTR UAT / Phase1:** **DENIED**
- **Seed:** none
- **C-SLICE-≠-MODULE:** issue spine slice ≠ printable module GO
- **Verdict:** **🟢 PASS**

---

## 6. Network stamp table (mutations — stamp CLQA3-KMJRGF)

```text
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_IS_*)
POST …/contract-clauses/dbfc8137-…/activate?company_id=main                → 201 HRM-CTR-CL-200
POST /api/hrm/contracts-insurance/contract-templates                       → 201 HRM-CTR-TPL-201
POST …/contract-templates/8ccd9e8e-…/activate?company_id=main              → 201 HRM-CTR-TPL-200
POST /api/hrm/contracts-insurance/contracts                                → 201 HRM-CON-201  (HD-CLQA3-KMJRGF)
POST …/contracts/17d1a4d4-…/preview?company_id=main                         → 201 HRM-CTR-PREV-200  can_issue=true
POST …/contracts/17d1a4d4-…/print-versions?company_id=main                 → 201 HRM-CTR-VER-201  vid=67e17dee-…
PATCH …/contract-clauses/dbfc8137-…?company_id=main                        → 200 HRM-CTR-CL-200  (AC-02 expected 409)
```

---

## 7. Entity IDs (repro)

| Entity | ID / code |
|--------|-----------|
| Clause | `CL_IS_CLQA3-KMJRGF` · uuid `dbfc8137-7311-4988-aff0-bafa8b7b8f66` |
| Template | `TPL_CLQA3-KMJRGF` · uuid `8ccd9e8e-e13c-4b38-a82e-1ff2c62e545d` |
| Contract | `HD-CLQA3-KMJRGF` · uuid `17d1a4d4-e7d9-4ab5-bdcb-0908b112f25f` |
| Print version | **`67e17dee-dd67-42c9-bbab-b9aa87b3c4e3`** · status issued (201) |

---

## 8. Screenshots

- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-03/00-clauses.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-03/01-contract-edit-spine.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-03/02-preview.png`
- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-03/03-after-issue.png`

---

## 9. Residual register (post QA-03)

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **`R-CTR-CL-ISSUE-SPINE-U65`** | P1 | **PARTIAL** | **dev-be** + **dev-fe** | FE chain → **printVersionId OK** · AC-02/03 **FAIL** |
| **`R-CTR-CL-ACTIVATE-UI`** | P2 | OPEN | dev-fe | Hiệu lực hidden when already active |
| **`R-CTR-CL-SNAPSHOT-BIND`** | P1 | **NEW** | dev-fe / ba-process | Ensure template canvas places clause **code** into issued snapshot for AC-02 precond |
| **`R-PLT-CTR-CL-FE-PATCH-COMPANY-ID`** | ~~P0~~ | **CLOSED** | — | RETAIN QA-02 · not reopened |
| **`contracts_printable_ready`** | — | **false RETAIN** | pm/sa | PRINTABLE-HOLD-SA-01 |

**Peer seals RETAIN:** CTR-TEMPLATE KEY · ATT/EMP · C-SLICE honesty.

---

## 10. Defect summary (for PM / dev-be)

| Defect | Layer | Symptom | Expected (BA-01) |
|--------|-------|---------|------------------|
| **CTR-CL-AC02-01** | BE or test setup | PATCH **200** after issue | **409** `HRM-CTR-CL-CODE-CONFLICT` when clause in issued snapshot |
| **CTR-CL-AC03-01** | QA + FE | Snapshot freeze not shown | Issued version body unchanged after clause edit + UI reopen |

**Suggested dev-be check:** After issue, `clauseHasIssuedSnapshot('CL_IS_CLQA3-KMJRGF', 'main')` true/false vs snapshot JSON content.

**Suggested dev-fe check:** Template save must include dragged clause in structure that merge/issue copies into `clauses_snapshot_json` with `"code":"CL_IS_…"`.

---

## 11. Classification

| Signal | Class | Verdict driver |
|--------|-------|----------------|
| printVersionId U65 | ENV/PRODUCT spine | Partial close R-CTR-CL-ISSUE-SPINE-U65 |
| AC-02 PATCH 200 | PRODUCT | **FAIL_TO_PM** |
| AC-03 not proven | PRODUCT + QA probe | **FAIL** |
| AC-H | GOVERNANCE | PASS |
| AC-01 RETAIN | N/A | No regression claim |

---

## 12. EV_LEN verification

File written UTF-8 **without BOM** via QA handoff pipeline. Minimum **8192 bytes** required for seat closure.

---

## 13. Completion contract

**completion_report:**

- L0 PASS. U65 browser executed full **issue spine** (clause → template → contract → preview `can_issue=true` → **print version 201**). **`printVersionId` obtained** — lifts QA-02 NOTE_BLOCKED on reachability only.
- **AC-02 🔴 FAIL:** PATCH **200** `HRM-CTR-CL-200` instead of **409** `HRM-CTR-CL-CODE-CONFLICT` after issue.
- **AC-03 🔴 FAIL:** Snapshot immutability not demonstrated (wrong GET route in runner; UI reopen not completed).
- **AC-01 ⚪ RETAIN** `CLQA2-KMCG5L`. **AC-H 🟢 PASS** printable=false.
- **`R-CTR-CL-ISSUE-SPINE-U65`:** **PARTIAL** — dispatch **dev-be** + **dev-fe** before QC can accept AC-02/03.

**next_owner:** **dev-be** (primary AC-02 soft-block / snapshot detection) · **dev-fe** (template→snapshot bind + activate UI P2)

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-03 FAIL CLQA3-KMJRGF

Mission: After U65 issue (evidence QA-03 — contract 17d1a4d4-… · printVersion 67e17dee-… · clause CL_IS_CLQA3-KMJRGF),
verify clauseHasIssuedSnapshot + updateClause soft-block. If clause code absent from clauses_snapshot_json, document FE/template gap;
if present, fix PATCH to return 409 HRM-CTR-CL-CODE-CONFLICT on body_vi change (not 200).
Regression: contract-legal-print.service.spec.ts · scope parity unchanged.
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-03.md · BA-01 AC-02
exit_criteria: jest PASS · repro note with snapshot contains "code":"CL_IS_…" OR explicit ba-process AC if bind is FE-only
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-be-ac02-01.md
ack_status: READY_FOR_QA
U65 · no seed · must_keep CLQA2 PATCH seal
```

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-03.md`

**ack_status:** **`FAIL_TO_PM`**

---

## 14. Appendix — click log (machine)

| Step | Timestamp (UTC) |
|------|-----------------|
| CLAUSE_ACTIVATED CL_IS_CLQA3-KMJRGF | 2026-08-08T17:05:28Z |
| TEMPLATE_SAVED TPL_CLQA3-KMJRGF | 2026-08-08T17:05:38Z |
| CONTRACT_CREATED HD-CLQA3-KMJRGF | 2026-08-08T17:05:47Z |
| CLICK_PREVIEW | 2026-08-08T17:05:58Z |
| CLICK_SAVE_VERSION | 2026-08-08T17:06:32Z |

---

## 15. Appendix — honesty locks (mandatory RETAIN)

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** (cite only) |
| Module CTR UAT | **DENIED** |
| `PROGRAM_JOURNEY_MAP` module 🟢 | **DENIED** |
| Seed | **DENIED** U65 |
| C-SLICE | **RETAIN** — issue spine progress ≠ module GO |

---

## 16. Appendix — QC handoff note

QC seat **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-03`** should **NOT** GO on AC-02/03 until retest after dev-be/fe. May **acknowledge** partial progress: FE issue chain no longer NOTE_BLOCKED on `printVersionId` alone. Narrow GWC only if PM waives with owner+expiry — default **NO-GO** on AC-02/03.

End of evidence document.
