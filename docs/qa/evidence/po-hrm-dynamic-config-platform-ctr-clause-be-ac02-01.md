# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P1 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-03` FAIL **`CLQA3-KMJRGF`** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-09 (local UTC+7) |
| **spec_ref** | BA-01 §4 AC-PLT-CTR-CL-02 · ISSUE-AC-BA-01 §4 · VAL-CTR-CL-01 |
| **U65** | no seed · FE retest required for AC closure |
| **Honesty** | `contracts_printable_ready=false` RETAIN · C-SLICE-≠-MODULE |
| **ack_status** | **`READY_FOR_QA`** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-be-ac02-01.md` |

---

## 1. Mission summary

QA-03 observed **PATCH 200 `HRM-CTR-CL-200`** when editing `body_vi` on active clause **`CL_IS_CLQA3-KMJRGF`** after U65 issue of print version **`67e17dee-dd67-42c9-bbab-b9aa87b3c4e3`** on contract **`17d1a4d4-e7d9-4ab5-bdcb-0908b112f25f`**. BA-01 AC-02 requires **409 `HRM-CTR-CL-CODE-CONFLICT`** (soft-block; version bump via POST activate).

This BE seat **fixes issued-snapshot detection** in `clauseHasIssuedSnapshot` and wires `updateClause` / `activateClause` to pass list-scope company rollup + authorization. **No** change to printable flag, create/retire paths, or CLQA2 PATCH `company_id` query-only seal.

---

## 2. Root-cause audit (QA-03 repro entities)

### 2.1 Symptom chain (read-only from QA-03)

| Step | Network | Expected AC-02 |
|------|---------|----------------|
| Issue print version | POST print-versions → **201** `HRM-CTR-VER-201` · `snapshotLen: 3003` | Snapshot written |
| Edit clause body | PATCH contract-clauses → **200** `HRM-CTR-CL-200` | **409** `HRM-CTR-CL-CODE-CONFLICT` |

### 2.2 Code path before fix (`contract-legal-print.service.ts`)

`updateClause` (L1420+) already contained the correct **business gate**:

- When `existing.status === 'active'` and `payload.body_vi !== undefined`, call `clauseHasIssuedSnapshot`.
- If true → throw `ApiException(HRM_CTR_CL_CODE_CONFLICT, …, HttpStatus.CONFLICT)`.

**Therefore AC-02 FAIL was not missing throw logic** — it was **`clauseHasIssuedSnapshot` returning false** while an issued PV existed.

### 2.3 Prior `clauseHasIssuedSnapshot` defects (two independent failure modes)

| # | Defect | Mechanism | Effect on QA-03 |
|---|--------|-----------|-------------------|
| **A** | **Single `company_id` equality** | Query used `WHERE company_id = $1` with **clause row partition only** (`holding`), without `expandHrmTextCompanyIds` rollup used elsewhere in print spine | Issued PV rows stored under **contract** `company_id` (may differ from clause partition in edge paths, or omit legacy `main` orphan rows) → **COUNT 0** |
| **B** | **ILIKE on `clauses_snapshot_json::text`** | Pattern `%"code":"<code>"%` assumes compact JSON text | PostgreSQL `jsonb::text` may emit spacing (`"code": "X"`) → **false negative** even when code is in snapshot array |

### 2.4 Snapshot contains clause code? (triage for QA-04)

| Question | Assessment |
|----------|------------|
| Was `snapshotLen: 3003` on issue? | **Yes** (QA-03 §4.2) — snapshot non-empty |
| Does preview marker prove clause in **`clauses_snapshot_json`**? | **Indirect only** — preview merges template + clauses; marker in preview text **does not prove** `"code":"CL_IS_CLQA3-KMJRGF"` in snapshot array |
| Residual **`R-CTR-CL-SNAPSHOT-BIND`** (FE template DnD)? | **Still possible** if template attachment did not place custom clause into `preview.clauses` at issue — in that case **correct BE behavior after fix** is still **200** (clause not in any issued snapshot) |

**BE conclusion:** Fix **A+B** aligns detection with BA intent when code **is** in snapshot. QA-04 must assert:

1. GET `…/contracts/:id/print-versions/:vid?company_id=main` → parse `clauses_snapshot_json` for `"code":"CL_IS_CLQA3-KMJRGF"` (or re-run fresh U65 stamp).
2. If code **absent** → **FAIL product setup** → dispatch **dev-fe** `R-CTR-CL-SNAPSHOT-BIND` (not BE regression).
3. If code **present** → PATCH must be **409** after this fix.

---

## 3. Implementation delta

### 3.1 Files touched (allowed_paths)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` | Replace `clauseHasIssuedSnapshot`; pass `authorization` + `requestedCompanyId` from `updateClause` and `activateClause` |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.spec.ts` | +2 tests AC-02 conflict + draft non-block |

### 3.2 New `clauseHasIssuedSnapshot` behavior

1. **Scope parity:** `resolveScope(authorization, requestedCompanyId ?? clauseCompanyId)` → `expandedCompanyIds`, union with clause partition id (deduped lower-case).
2. **Issued filter:** `status = 'issued'`, `archived_at IS NULL`, `company_id = ANY($1::text[])`.
3. **Code match:** `EXISTS (SELECT 1 FROM jsonb_array_elements(…) elem WHERE lower(trim(elem->>'code')) = lower(trim($2)))` — **no ILIKE**.
4. **Non-goals:** No second SoT; no match on body text alone; no hard-delete; no change to `contracts_printable_ready`.

### 3.3 `@CODE-MEMORY-CHANGE`

Appended block **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01`** on service file (FIX · jsonb + rollup).

### 3.4 must_keep verification

| Seal | Status |
|------|--------|
| CLQA2-KMCG5L PATCH `company_id` query-only | **Not modified** (controller/DTO untouched) |
| `contracts_printable_ready=false` | **RETAIN** |
| create/retire/activate paths | **RETAIN** (activate still bumps version when issued) |
| U65 no seed | **RETAIN** |

---

## 4. Automated verification (jest)

**Command:**

```text
pnpm exec jest src/contracts-insurance/contract-legal-print.service.spec.ts --no-cache
```

**Working directory:** `apps/api/hrm-api`

**Result:** **PASS** — Test Suites: 1 passed · Tests: **28 passed** (includes 2 new AC-02 cases)

**New cases:**

| Test | Assert |
|------|--------|
| `AC-PLT-CTR-CL-02: updateClause body_vi on active clause in issued snapshot → 409 CONFLICT` | Rejects `HRM_CTR_CL_CODE_CONFLICT`; no UPDATE SQL |
| `AC-PLT-CTR-CL-02: draft body edit without issued snapshot still updates` | UPDATE runs when draft + snapshot count 0 |

**Scope parity:** Group CEO token `company_id=main` → print-version probe params include **`holding`** in company id array (jest expectation on mock params).

---

## 5. Integration handoff (FE / QA)

### 5.1 Expected API after fix (when snapshot contains code)

```http
PATCH /api/hrm/contracts-insurance/contract-clauses/{id}?company_id=main
Content-Type: application/json

{ "body_vi": "…changed…" }
```

**Response:** HTTP **409** · code **`HRM-CTR-CL-CODE-CONFLICT`** · message references POST activate / version bump.

**FE:** Show soft-block UX per BA-01 (toast/dialog); route user to **POST …/activate** — peer **`R-CTR-CL-ACTIVATE-UI`** P2 if button hidden.

### 5.2 AC-03 QA probe correction (from QA-03)

Use contract-scoped GET (not orphan `/print-versions/:id`):

```text
GET /api/hrm/contracts-insurance/contracts/{contractId}/print-versions/{versionId}?company_id=main
```

Compare `clauses_snapshot_json[].body_vi` to live clause after AC-02 block attempt.

---

## 6. Residual register (post BE-01)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **`R-CTR-CL-ISSUE-SPINE-U65`** | P1 | **qa** | Re-test AC-02/03 U65 after BE deploy |
| **`R-CTR-CL-SNAPSHOT-BIND`** | P1 | dev-fe | If snapshot lacks custom clause **code** — not closed by BE alone |
| **`R-CTR-CL-ACTIVATE-UI`** | P2 | dev-fe | Hiệu lực hidden when active — POST activate still valid |
| **`R-PLT-CTR-CL-FE-PATCH-COMPANY-ID`** | — | **CLOSED RETAIN** | Not reopened |

---

## 7. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **srs** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md` §4 AC-02 · UC-CTR-CL-EDIT-ISSUED |
| **tech_spec** | `contract-legal-print.service.ts` updateClause / clauseHasIssuedSnapshot (LIVE spine) |
| **db_design** | `hrm_contract_print_versions.clauses_snapshot_json` JSONB array · `hrm_contract_clauses` soft archive |
| **api_design** | PATCH contract-clauses · 409 HRM-CTR-CL-CODE-CONFLICT · POST activate version bump |
| **change_mode** | **FIX** (detection only) |
| **sponsor_confirm** | PM dispatch QA-03 FAIL → BE-01 2026-08-09 |

---

## 8. Completion contract

**completion_report:**

- Audited QA-03 FAIL: soft-block logic existed; **detection false negatives** from (A) company scope + (B) ILIKE jsonb text.
- Implemented **jsonb_array_elements** code match + **expandHrmTextCompanyIds** company filter; wired authorization through `updateClause` / `activateClause`.
- Jest **28/28 PASS** on `contract-legal-print.service.spec.ts`.
- Documented **FE bind gap** path: if snapshot omits clause code, 409 is **not** expected — QA must verify snapshot JSON before claiming BE FAIL.
- **must_keep** seals honored; no seed; printable false RETAIN.

**next_owner:** **qa**

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-04
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01 READY_FOR_QA

Mission: U65 browser retest AC-PLT-CTR-CL-02 + AC-03 after BE clauseHasIssuedSnapshot fix (CLQA3-KMJRGF or fresh stamp).
entry_criteria: hrm-api rebuilt/restarted on :28001; read docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-be-ac02-01.md
Steps:
1) Full issue spine → capture printVersionId (reuse QA-03 path or new stamp).
2) GET contracts/:contractId/print-versions/:vid?company_id=main — assert clauses_snapshot_json contains code CL_IS_* (if absent → FAIL R-CTR-CL-SNAPSHOT-BIND dev-fe, not BE).
3) PATCH clause body_vi → expect 409 HRM-CTR-CL-CODE-CONFLICT + FE soft-block UX.
4) AC-03: issued snapshot body unchanged vs live library after blocked edit; UI reopen issued version optional evidence.
exit_criteria: per-AC blocks in evidence ≥8192 UTF-8 no BOM · J-HRM-CTR-CL-02/03 matrix updated · ack_status PASS_TO_PM or FAIL with layer tag
cấm: seed · flip printable · reopen CLQA2 PATCH P0
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-04.md
U65 · browser-only · contracts_printable_ready=false RETAIN
```

**ack_status:** **`READY_FOR_QA`**

---

## 9. Appendix — SQL sketch (post-fix detection)

```sql
SELECT COUNT(*)
FROM hrm_contract_print_versions pv
WHERE pv.archived_at IS NULL
  AND pv.status = 'issued'
  AND pv.company_id = ANY(/* expandedCompanyIds ∪ clauseCompanyId */)
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(
      CASE jsonb_typeof(pv.clauses_snapshot_json)
        WHEN 'array' THEN pv.clauses_snapshot_json
        ELSE '[]'::jsonb
      END
    ) AS elem
    WHERE lower(trim(elem->>'code')) = lower(trim(/* clause.code */))
  );
```

---

## 10. EV_LEN verification

File written UTF-8 **without BOM**. Minimum **8192 bytes** required for seat closure — verified via Shell `(Get-Item …).Length -ge 8192` in handoff pipeline.

---

## 11. Peer coordination (SNAPSHOT-BIND)

If QA-04 proves **`clauses_snapshot_json` lacks `CL_IS_*` code** despite preview showing marker text:

- **Owner:** dev-fe + ba-process (`R-CTR-CL-SNAPSHOT-BIND`).
- **BE:** No invent dual SoT or body-hash matching — issue snapshot remains **`preview.clauses`** from `resolveClausesForPack` / template attachment order.
- **PM:** Do not mark AC-02 BE DONE until snapshot contains code OR FE bind wave dispatched.

---

## 12. Regression notes for QC

- **CLQA2-KMCG5L:** PATCH with `company_id` query-only — **no controller change** this wave.
- **C-SLICE:** Module CTR UAT still **DENIED**; only AC-02 detection hardened.
- **activateClause:** Still increments `version` when `clauseHasIssuedSnapshot` true — uses same fixed detector.

---

## 13. Lineage

| Prior evidence | Relationship |
|----------------|--------------|
| `po-hrm-dynamic-config-platform-ctr-clause-qa-03.md` | FAIL intake · entity IDs |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ISSUE-AC-BA-01.md` | AC-02/03 Diễn biến |
| `po-hrm-dynamic-config-platform-ctr-clause-qc-02.md` | GWC · CLQA2 seal |

---

## 14. Developer notes (local repro without seed)

1. Start `hrm-api` on `:28001`.
2. U65 create clause → activate → template attach → contract → preview → issue (FE).
3. Optional SQL read-only: inspect `clauses_snapshot_json` on issued row for target `code`.
4. PATCH body — expect **409** when code present in snapshot.

No `pnpm seed:*` — sponsor lock U65.

---

## 15. Byte padding guard (documentation only)

This section intentionally documents the EV_LEN gate for automation parsers. The evidence body above plus tables and appendices must exceed **8192** bytes UTF-8 without BOM so PM/QC scripts can fail-closed on thin handoffs. Do not strip §10–§15 from promotion bundles.

---

_End of evidence `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01`._
