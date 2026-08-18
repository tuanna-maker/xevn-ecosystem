# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01 (ba-process AC pack)

| Field | Value |
|-------|--------|
| **work_item_id** | PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01 |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | PASS_TO_PM · CONFIRMED |
| **date** | 2026-08-08 |
| **spec_file** | docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md |
| **spec_bytes** | 16047 |
| **evidence_file** | docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-ba-01.md |
| **evidence_bytes** | (self — see Shell verify below) |
| **prior_seat** | 3d3136ea turn_ended ZERO files — this RE-DISPATCH writes + Shell-verifies both files |

## HARD EXIT GATE — byte verification
- Spec file bytes (Shell-measured): **16047** (gate ≥ 5120)
- Evidence file bytes: Shell-verified in final step of this seat (gate ≥ 3072)
- Both files confirmed on disk via `Get-Item .Length` under canonical NFD repo path.

## spec_read_ack
- **SA:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md` — §4 Decision Option B LOCKED (RETAIN+narrow) · §4.1 gates (ba-data HOLD conditional · ba-process UNLOCK · BE/FE HOLD) · §5 L-CTR-CL-01..10 · §8 OUT · §9 ba-data HOLD · §10 draft stubs AC-PLT-CTR-CL-01..06 + VAL-CTR-CL-01..03
- **BA platform:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` — §3.3 clause library · AC-PLT-CTR-02 · BR-CTR-CL-01..04
- **Code (LIVE, grep-verified):**
  - `contract-legal-print.service.ts` — createClause L1343 · updateClause L1412 (soft-block L1423-1441) · clauseHasIssuedSnapshot L1473 · body_vi TEXT NOT NULL L375 · clauses_snapshot_json JSONB L427
  - `contracts-insurance.controller.ts` — GET/POST/GET:id/PATCH/POST:activate `contract-clauses` L549-617
  - `ContractLegalPrintSettingsPanel.tsx` — body_vi form + create/update/activate/retire clause LIVE
- **change_mode:** ADD (AC wording) · **no_code:** true · **must_keep:** snapshot immutable · version-bump guard · UF-HRM-02 nullable template · ATT L1 seals

## Deliverables authored
| Item | Result |
|------|--------|
| AC-PLT-CTR-CL-01 edit draft body_vi 2xx→F5 | authored (measurable, U65) |
| AC-PLT-CTR-CL-02 issued → soft-block → version bump | authored |
| AC-PLT-CTR-CL-03 snapshot immutable on later edit | authored |
| AC-PLT-CTR-CL-04 admin CREATE N+1 · {{token}} | authored |
| AC-PLT-CTR-CL-05 FE resolve not hardcode (BR-CTR-CL-03) | authored |
| AC-PLT-CTR-CL-06 soft-retire · snapshot safe | authored |
| AC-PLT-CTR-CL-H honesty (no flip · no reopen · C-SLICE) | authored |
| VAL-CTR-CL-01..05 | authored |
| Token syntax {{x}} LOCK (Q-PLT-01) | confirmed |
| Conditional ba-data trigger | evaluated → **NO** (snapshot serves; HOLD) |
| GAP analysis BE/FE | **NO build GAP** → HOLD |

## Decisions
1. **ba-data HOLD confirmed** — no `hrm_contract_clause_versions`; snapshot + version cột đủ. Future trigger = admin body-history audit screen only.
2. **BE/FE HOLD** — routes + Settings panel + freeze all LIVE; no dev dispatch unless QA finds concrete wiring gap.
3. **DENY** DOCX GĐ2 · DnD reorder (cite peer AC-PLT-CTR-03) · flip printable · mega-EAV · seed.

## Honesty flags (unchanged — retained)
- contracts_printable_ready = **false**
- payroll_e2e_ready = **false**
- Module CTR UAT / Phase1 = **DENIED**
- C-SLICE-≠-MODULE = **RETAIN**
- Seals reopened = **NONE** (leave-balance CNS-WIRE/FE-01g · ATT-CODE/WS/SHIFT · EMP/SI/PAY/DEC/MergeToken)

## FORBIDDEN respected
apps/** untouched · no seed · no flip ready · no reopen ATT · no invented FE HOLDs · no module CTR UAT claim · no Phase1 claim · not an empty seat.

## Next dispatch (copy-ready → PM)
```
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01   # OPTIONAL — only if PM opens browser slice
from_role: pm
to_role: qa
lane: execution
change_mode: verify (no code)
entry_criteria:
  - Read AC pack docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md §4
  - U65 browser zero-seed; login HCNS/Settings admin; Settings → Hợp đồng → thư viện điều khoản
task:
  - Run AC-PLT-CTR-CL-01..06 + VAL-CTR-CL-01..05 in browser
  - AC-01 edit body_vi draft → PATCH 200 HRM-CTR-CL-200 → F5 body mới
  - AC-02 issued clause edit → soft-block HRM-CTR-CL-CODE-CONFLICT → activate/version bump → old issued keeps body
  - AC-03 issue version → later edit → issued snapshot body unchanged
  - AC-04 CREATE N+1 clause {{token}} → 201 → F5 row
  - AC-05 grep FE no hardcoded legal body; render resolves from row/snapshot
  - AC-06 soft-retire → picker hides → snapshot/issued still OK
  - VAL-02 scope parity jest (list↔get-by-id)
forbidden: seed · flip contracts_printable_ready · reopen ATT/leave-balance seals · DnD/DOCX
exit: verdict per AC (URL+click path+Network 2xx+F5) · honesty flags stay false · ack_status PASS_TO_PM
```

ba-data & dev-be/dev-fe remain **HOLD** (no GAP). PM may also simply seal this governance seat and continue the U88 pipeline to the next vertical if no browser slice is desired now.

## Completion contract
- **completion_report:** AC pack + VAL matrix authored from SA Option B; token {{x}} locked; ba-data HOLD (no history trigger); BE/FE HOLD (no GAP); DnD/DOCX/printable-flip OUT; seals retained; no apps/**; U65.
- **next_owner:** pm (optional qa browser slice; ba-data/BE/FE HOLD)
- **ack_status:** PASS_TO_PM