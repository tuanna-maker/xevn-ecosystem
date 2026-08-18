# Evidence — `PO-UC-TC-W4-QC-IM03-AU-MEMBER-MAIN-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QC-IM03-AU-MEMBER-MAIN-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — TC-HRM-IM-03-SCOPE-AU (member `main` bucket vs vượt scope) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173` (API scope seat; HRM `:28001` employees list) |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-im03-au-member-main-01.md`](po-uc-tc-w4-qa-im03-au-member-main-01.md) PASS_TO_PM · BE ADR-WAIVER [`po-uc-tc-w4-be-au-member-main-scope-01.md`](po-uc-tc-w4-be-au-member-main-scope-01.md) |
| **spec_ref** | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` **§5** · `ADR-HRM-RBAC-SCOPE-LADDER` · `TC-HRM-IM-03-SCOPE-AU-001` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no invent Leave L2 |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · IM-01/02/04 retest · Leave L2 PASS · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: **TC-HRM-IM-03-SCOPE-AU** after BE ADR-WAIVER + QA retest. ADR §5: subsidiary CEO JWT `companyId=main` on member tenant (`xe-du-lich`) is the **operating bucket** (expect **200**), **not** a holding/group rollup leak. Vượt scope = `company_id=holding` **or** forged `x-tenant-id=xevn` → **409**. Live matrix (QA + QC independent spot): **AU-1/2 → 409**; **AU-3 → 200 total=0 ≠ group 59**; **must_keep** `ceo@xe.vn` **200 total=59**. Residual **`R-W4-B1-AU-MEMBER-MAIN-200` CLOSED**. IM-01/02/04 **untouched**. Leave L2 **not invented**. **NOT** Phase 1 / UAT DONE.

**Conditions:** QA narrative pack process gap (3/8) does not demote product close · host journeys J-HRM-02 / J-HRM-IM-01 not re-closed this seat · **NOT** Phase 1 / UAT DONE from this gate alone.

---

## ADR §5 interpretation (QC audit)

| ADR §5 claim | Spec says | Live / evidence | QC |
|--------------|-----------|-----------------|----|
| Member CEO JWT `companyId=main` | List SQL `company_id=main` only; **never** `main`→`holding` | JWT `tenantId=xe-du-lich` `companyId=main` `subsidiary_ceo`; AU-3 **200** `HRM-EMP-200` total=0; companies=[] | **ACCEPT** |
| Group CEO JWT `companyId=main` | `GROUP_MEMBER_SLUGS` when query=`main` | must_keep **200** total=**59**; sample companies include `holding` | **ACCEPT** must_keep |
| Collision of slug `main` | Same slug, **different tenant** | Member 0 ≠ group 59 proves no holding leak | **ACCEPT** |
| Prior wrong expect (member own main → 403/409) | Would **break** subsidiary list | BE ADR-WAIVER + QA residual CLOSED | **ACCEPT** — prior PARTIAL superseded |

> Rejecting member own `main` with 409 is **anti-ADR**. SCOPE-AU «vượt scope» = holding **or** xevn headers — not own bucket.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-uc-tc-w4-be-au-member-main-scope-01.md` | READY_FOR_QA; ADR-WAIVER intentional 200 own bucket; Jest 51/51; corrected AU matrix | **ACCEPT** |
| `docs/qa/evidence/po-uc-tc-w4-qa-im03-au-member-main-01.md` | PASS_TO_PM; AU matrix PASS; residual CLOSED; uat_done false | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-im03-au-member-main-01.json` | matrix_verdict PASS; AU-1/2 409; AU-3 total=0; must_keep 59; residual CLOSED | **ACCEPT** |
| `docs/qa/professional/by-uc/HRM-IM-03.md` | execution **UI_PASS**; **uat_done false**; SCOPE-AU-001 expected text updated | **ACCEPT** |
| Prior W4-B1 AU false-negative (expect 403/409 on own main) | superseded by ADR §5 matrix | **SUPERSEDED** — do not reopen without holding leak proof |

---

## Independent spot-check (QC — live 2026-08-04)

### L0

| Probe | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm / xbos / portal **HTTP 200** (Windows UV close noise after PASS — health lines green) |
| Seed | **không** chạy `pnpm seed:*` |

### Corrected AU matrix (QC re-probe GET `/api/hrm/employees`)

| Case | Request | Expect | Actual | Verdict |
|------|---------|--------|--------|---------|
| **AU-1** | Bearer member · `company_id=holding` · `x-company-id=holding` · `x-tenant-id=xe-du-lich` | **409** | **409** `SCOPE_CONTEXT_MISMATCH` · `companyId mismatches token scope` | 🟢 PASS |
| **AU-2** | Bearer member · `company_id=main` · `x-company-id=main` · `x-tenant-id=xevn` | **409** | **409** `SCOPE_CONTEXT_MISMATCH` · `tenantId mismatches token scope` | 🟢 PASS |
| **AU-3** | Bearer member · `company_id=main` · `x-company-id=main` · `x-tenant-id=xe-du-lich` | **200** · no holding leak · total ≠ group | **200** `HRM-EMP-200` · **total=0** · `holdingLeak=false` · companies=[] | 🟢 PASS |
| **must_keep** | Bearer `ceo@xe.vn` · `company_id=main` · `x-tenant-id=xevn` | **200** rollup | **200** `HRM-EMP-200` · **total=59** · sample `holding`/`finance`/`trsport` | 🟢 PASS |

JWT (no secrets): `du-lich.ceo` → `xe-du-lich`/`main`/`subsidiary_ceo`; `ceo@xe.vn` → `xevn`/`main`/`group_ceo`. Matches QA runtime JSON.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **TC-HRM-IM-03-SCOPE-AU** (export scope via GET employees) | **In-scope** this gate | **PASS** (AU matrix) |
| **J-HRM-02** host employees list | Related host; not full browser L2.5 retest this seat | **prior/context** · must_keep group rollup API PASS; **not** claimed full journey re-close |
| **J-HRM-IM-01** Import preview | Out of this P1 (IM-01 untouched) | **untouched** · must_keep prior |
| IM-02 / IM-04 | Out of this P1 | **untouched** |
| Leave L2 | Out of this P1 | **SPEC_GAP** · **not invented** |

Mandatory in-scope for this gate: **SCOPE-AU corrected matrix** **PASS**. No untested mandatory J-* claimed PASS beyond this slice. Full Phase1 journey closure **not** claimed.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | AU-1/2 **409**; AU-3 **200** total=0 ≠ 59; must_keep group CEO **200**/59; **R-W4-B1-AU-MEMBER-MAIN-200 CLOSED**; ADR §5 own-bucket interpretation |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **3/8** (missing command_table · portal_url · journey_l25) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0 200; Windows UV close noise after stack PASS) |
| **OUT-OF-SCOPE / CONDITION** | Leave L2 · IM-01/02/04 UI retest · full J-HRM-02/IM-01 browser · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote SCOPE-AU close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| **R-W4-B1-AU-MEMBER-MAIN-200** | **CLOSED** | — | — | No — do not reopen without holding/group leak proof (member total ≈ group or holding rows on member page) |
| Leave L2 | SPEC_GAP HOLD | — | ba / program | No — **not invented PASS** |
| IM-01 / IM-02 / IM-04 | prior UI_PASS | — | — | No — **untouched** this seat |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |
| **C-IM03-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + portal_url + J-* on next QA MD |

**No residual product P0/P1** open for this SCOPE-AU slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone (`uat_done` stays **false** on HRM-IM-03).
2. Do **not** reopen **R-W4-B1-AU-MEMBER-MAIN-200** without leak proof (member total ≈ group rollup or holding/trsport rows under member tenant).
3. Do **not** invent Leave L2 PASS from this gate.
4. Do **not** treat member own `company_id=main` **200** as FAIL — ADR §5 operating bucket.
5. Do **not** retest/overwrite IM-01 / IM-02 / IM-04 UI_PASS without new defect.
6. Do **not** seed to inflate member employee total.
7. Prior W4-B1 AU PARTIAL (wrong expect) is **superseded**.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-im03-au-member-main-01.md
→ FAIL 3/8 — missing command_table, portal_url, journey_l25
```

**PROCESS GWC** — product API matrix + ADR independently verified; does not demote P1 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-im03-au-member-main-01.md
→ PASS exit 0 (8/8)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-im03-au-member-main-01.md` | **FAIL** exit **1** · **3/8** missing command_table / portal_url / journey_l25 (process) |
| `pnpm run qc:dev-stack` | **PASS** · hrm/xbos/portal **200** (UV close noise after) |
| QC live node probe GET `/api/hrm/employees` AU-1..3 + must_keep | **PASS** exit **0** · 409/409/200/200 · totals 0 vs 59 |
| Runtime cross-check `_tmp-po-uc-tc-w4-qa-im03-au-member-main-01.json` | **PASS** · matrix_verdict PASS · residual CLOSED · uat_done false |
| ADR read `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §5 | **PASS** · member main bucket; never main→holding |
| by-uc `HRM-IM-03.md` | **PASS** · UI_PASS · uat_done **false** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-im03-au-member-main-01.md` | **PASS** exit **0** (8/8) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | qc:dev-stack 200 |
| **LOGIN** member | `du-lich.ceo@xe.vn` · xe-du-lich/main | **PASS** | login 201 · JWT claims |
| **LOGIN** group | `ceo@xe.vn` · xevn/main | **PASS** | login 201 · must_keep |
| **AU-1** READ deny | holding headers → 409 | **PASS** | QC spot + QA JSON |
| **AU-2** READ deny | xevn+main headers → 409 | **PASS** | QC spot + QA JSON |
| **AU-3** READ own bucket | xe-du-lich+main → 200 · no leak | **PASS** | total=0 · holdingLeak=false |
| **must_keep** group rollup | ceo@ main → 200 · total≫member | **PASS** | total=59 |
| **J-HRM-02** host | scope parity context | **prior/context** | not full browser re-close |
| **J-HRM-IM-01** | Import preview | **untouched** | must_keep prior |
| Leave L2 | ladder | **SPEC_GAP** | not invented |
| IM-01/02/04 | UI_PASS prior | **untouched** | QA + by-uc |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent Leave L2 PASS
- Did not FAIL member own `main` 200 against ADR §5
- Did not reopen IM-01/02/04
- Did not GO without opening QA MD + BE waiver + runtime JSON + live spot-check + ADR §5
- Did not NO-GO solely on QA pack format gap
- Did not log/store secrets in this evidence (tokens omitted)

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QC-IM03-AU-MEMBER-MAIN-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-im03-au-member-main-01.md
next_owner: pm
verdict: GO WITH CONDITIONS
slice: TC-HRM-IM-03-SCOPE-AU only
residual_closed: R-W4-B1-AU-MEMBER-MAIN-200
uat_done: false
phase1_done: false
```

### next_dispatch_prompt

```
work_item_id: PO-UC-TC-W4-PM-IM03-AU-MEMBER-MAIN-INTAKE-01
from_role: pm
to_role: pm
lane: governance
ack_status_target: DISPATCHED (next open P0/P1 from PM_OPEN_BACKLOG)
priority: P1
u65_zero_seed: true

INTAKE QC GWC: docs/qa/evidence/po-uc-tc-w4-qc-im03-au-member-main-01.md
CLOSED: R-W4-B1-AU-MEMBER-MAIN-200 · TC-HRM-IM-03-SCOPE-AU (ADR §5 member main bucket)
BOUNDED: NOT Phase1/UAT DONE · uat_done false · Leave L2 SPEC_GAP · IM-01/02/04 untouched
Run pnpm run pm:idle:check → Task top dispatchRequired (do not re-open AU-MEMBER-MAIN without leak proof).
CẤM: seed · invent Leave L2 · claim UAT DONE
```

### completion_report

Closed L3 QC audit for IM-03 SCOPE-AU: ADR §5 interpretation ACCEPT; live AU matrix PASS (409/409/200≠59/must_keep 59); residual R-W4-B1-AU-MEMBER-MAIN-200 CLOSED; GWC bounded — not Phase1/UAT DONE. Residual open: process pack format P3 on QA MD; Leave L2 SPEC_GAP; program UAT/Phase1.
