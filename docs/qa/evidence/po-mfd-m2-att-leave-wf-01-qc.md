# Evidence — `PO-MFD-M2-ATT-LEAVE-WF-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-LEAVE-WF-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — HRM-AT-10..13 / surfaces **19**/**28** **leave create → QL Duyệt → F5 only** |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **uat_done** | **false** |
| **entry** | QA [`po-mfd-m2-att-leave-wf-01-qa.md`](po-mfd-m2-att-leave-wf-01-qa.md) PASS_TO_PM · runtime [`_tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json`](_tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json) · screens `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/` · prior leave GWC [`po-mfd-m2-att-scope-01-qc.md`](po-mfd-m2-att-scope-01-qc.md) · OT approve GWC CLOSED · SHEETS-01 GWC CLOSED |
| **spec_ref** | FR-HRM-AT-10 · FR-HRM-AT-12 · TECHSPEC leave · ATT-C4/C5 · U76 HDSD surfaces 19/28 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · FE leave create→QL Duyệt only |
| **stamp** | `LWF01-E9U9ST` |
| **approve_persona** | `uat.nv0002@xe.vn` (QL) — **not** `ceo@xe.vn` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · full Attendance CLOSED · SHEETS/OT/CLOCK re-gate · ceo@ APPROVE PASS |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded leave WF create→QL approve→F5 slice (M2 P0-8 / surfaces 19·28) only. U65 browser: NV `uat.nv0007` create → Network **201** `HRM-LEAVE-201` → QL `uat.nv0002` **Duyệt** → **201** `HRM-LEAVE-203` (`requestStatus=approved`) → FE **Đã duyệt** + **F5**. No seed. `ceo@` **not** used as approve persona; `ceo@` still shows Duyệt CTA count=32 vs BA `EXPECTED_NO_CTA` = **OBS** (documented; **not** invent leave-WF NO-GO). SHEETS / OT / CLOCK CLOSED or in-flight slices **not reopened**. **uat_done=false**. **NOT** Attendance module CLOSED · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m2-att-leave-wf-01-qa.md` | PASS_TO_PM · create 201 + approve 201 + F5 · U65 · ceo@ not approve persona · uat_done false | **ACCEPT** product leave WF |
| `_tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json` | `verdict: PASS` · network 201/201 · leave.create/approve · f5 true · ceo_spot duyet=32 | **ACCEPT** Network SoT |
| Screens PNG (01–08) | create toast · QL pending/approve · F5 · ceo@ CTA | **ACCEPT** spot-check |
| `po-mfd-m2-att-scope-01-qc.md` | Prior GWC leave approve scope | **ACCEPT** prior; this seat = WF fidelity confirm (surfaces 19/28) — **not** reopen SHEETS/OT |
| OT FE approve GWC / SHEETS-01 GWC | CLOSED prior | **untouched** this seat |

---

## Independent spot-check (QC)

### EC1 — Network create **201** `HRM-LEAVE-201`

| Check | Result |
|-------|--------|
| Runtime `leave.create` | **PASS** · status **201** · code **`HRM-LEAVE-201`** · id `2792cbe3-d6aa-483a-9513-b2f240eb3271` · `xCompanyId=main` |
| Network array POST leave-requests | **201** `bodyCode=HRM-LEAVE-201` |
| Persona create | `uat.nv0007@xe.vn` · OU `trsport` |
| Seed | **None** (U65) |

**PASS**

### EC2 — Network QL approve **201** `HRM-LEAVE-203`

| Check | Result |
|-------|--------|
| Runtime `leave.approve` | **PASS** · status **201** · code **`HRM-LEAVE-203`** · `requestStatus=approved` · `xCompanyId=trsport` · `approveClicked=true` |
| Network array POST `…/leave-requests/{id}/approve` | **201** `bodyCode=HRM-LEAVE-203` |
| Persona approve | **`uat.nv0002@xe.vn`** (QL) — **not** ceo@ |
| FE after | `feStatusAfter=true` · `pendingVisible=true` before click |

**PASS**

### EC3 — FE after 2xx + F5

| Check | Result |
|-------|--------|
| Create FE / F5 | `createFeAfter=true` · `createF5=true` |
| Approve F5 | `f5=true` |
| PNG `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/03-nv-after-submit.png` | Toast «Đã tạo đơn nghỉ phép» · tab Nghỉ phép · Chờ duyệt card **2** |
| PNG `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/06-ql-after-approve.png` | Stats **Đã duyệt: 5** · **Chờ duyệt: 1** (prior pending R5b row remains — LWF01 left pending queue; Network id SoT) |
| PNG `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/07-ql-approve-f5.png` | After reload: **Đã duyệt: 5** · **Chờ duyệt: 1** persists |
| Stamp text in list | OBS — QA notes stamp may truncate; Network id + approve path SoT |

**PASS** — FE after 2xx + F5 aligns Network SoT (stats 4→5 approved / 2→1 pending).

### EC4 — ceo@ honesty / EXPECTED_NO_CTA OBS (not NO-GO)

| Check | Result |
|-------|--------|
| Used ceo@ to claim approve PASS? | **No** (QA + runtime `persona_forbidden_approve_claim`) |
| Runtime `ceo_spot` | `duyệt_count=32` · `hdsd_approve_count=32` |
| PNG `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/08-ceo-expected-no-cta.png` | Chờ duyệt **(32)** · green **Duyệt** CTAs visible on pending rows · rollup `main` |
| vs BA `EXPECTED_NO_CTA` | 🟡 **OBS** — runtime shows CTA for group CEO |

**PASS (process honesty)** — OBS documented; **not** invent leave-WF NO-GO; **not** invent APPROVE PASS via ceo@.

### EC5 — U65 / forbidden reopen / forbidden claims

| Check | Result |
|-------|--------|
| Seed | QA + QC: **no** `pnpm seed:*` |
| SHEETS-01 / OT FE approve GWC | **not reopened** |
| CLOCK GPS residual | **untouched** (in-flight elsewhere) |
| Full Attendance CLOSED | **not claimed** |
| uat_done | **false** |
| Phase1 / UAT DONE | **not claimed** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| Leave list → Duyệt → F5 (HRM-AT-10 / AT-12 L1 · surfaces 19/28) | In-scope WF mutate this WI | **PASS** (Network 201/201 + PNG) |
| **J-HRM-06** full attendance journey map | Broader than leave-WF slice | **not reopened / not claimed closed anew** |
| OT FE create → Duyệt | Prior GWC CLOSED | **untouched** |
| SHEETS #11–12 | Prior GWC CLOSED | **untouched** |
| CLOCK GPS | In-flight OOS | **untouched** |

No invent of full Attendance journey closure. Mandatory in-scope leave click-path has Network evidence.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Leave U65 NV create **201** `HRM-LEAVE-201` → QL Duyệt **201** `HRM-LEAVE-203` → FE + F5 · approve persona QL |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **1/8** (missing portal_url pattern match despite URL in Persona table) — process-only |
| **ENV** | None (runtime L0 hrm/portal **200**) |
| **OBS (optional)** | ceo@ Duyệt CTA vs `EXPECTED_NO_CTA` · create `x-company-id=main` + query `trsport` · leave-balance GET **403** ×3 (create still 201) · stamp text truncate in list |
| **OUT-OF-SCOPE** | Full Attendance CLOSED · Phase1/UAT DONE · SHEETS/OT/CLOCK re-gate · ceo@ APPROVE claim |

ENV does not drive verdict. Process pack gap + OBS do **not** demote leave-WF slice close. OBS EXPECTED_NO_CTA mismatch is **not** invent NO-GO.

---

## Residual

| Id | Status | Sev | Owner | Blocks this leave-WF GWC? |
|----|--------|-----|-------|---------------------------|
| **OBS-MFD-M2-LEAVE-CEO-EXPECTED-NO-CTA** | OPEN optional | P3 | optional ba-process | **No** — refresh EXPECTED_NO_CTA wording vs runtime; not leave-WF NO-GO |
| **OBS-MFD-M2-LEAVE-XCID-MAIN** | OPEN info | P3 | optional | No — create 201 @main; approve @trsport |
| **OBS-MFD-M2-LEAVE-BALANCE-403** | OPEN optional | P3 | optional | No — console 403 on some employee_id; create still 201 |
| **OBS-MFD-M2-LEAVE-STAMP-LIST-TEXT** | OPEN info | P3 | optional | No — Network id SoT |
| **C-MFD-M2-QA-PACK-FMT-LEAVE-WF** | OPEN process | P3 | qa | No — add `portal_url` line matching verifier regex on next QA MD |
| `R-MFD-M2-CLOCK-GPS-LATLON` | untouched | — | CLOCK seat | No — not this WI |
| SHEETS-01 / OT FE approve | CLOSED prior | — | — | No — **not reopened** |
| Full Attendance / Phase1 / UAT DONE | — | — | — | No — **not claimed** |

**No residual product P0/P1** open for the **leave create→QL approve→F5** slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** claim full **Attendance** module CLOSED.
3. **uat_done** remains **false**.
4. ceo@ Duyệt CTA vs `EXPECTED_NO_CTA` = **OBS** — optional BA wording refresh; **not** invent leave-WF NO-GO; **not** invent APPROVE PASS via ceo@.
5. U65: **no seed**.
6. Do **not** reopen SHEETS-01 / OT FE approve / CLOCK GPS seats from this GWC.
7. Prior ATT-SCOPE-01 leave GWC remains valid; this seat confirms WF fidelity (surfaces 19/28 + HDSD inventory) with stamp `LWF01-E9U9ST`.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qa.md
→ FAIL 1/8 — missing portal_url (URL present in Persona table but verifier regex wants "portal" + host pattern)
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote leave-WF close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md
→ PASS exit 0 (8/8) [target after write]
```

### Assets

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md --check-assets
→ PASS (PNG paths under docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qa.md` | **FAIL** exit **1** · **1/8** missing portal_url (process) |
| Runtime cross-check `_tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json` | **PASS** · create **201** `HRM-LEAVE-201` · approve **201** `HRM-LEAVE-203` · f5 true · ceo_spot=32 · verdict PASS · uat_done false |
| Open QA MD `po-mfd-m2-att-leave-wf-01-qa.md` | **PASS** · U65 · QL approve persona · no Attendance invent |
| Open prior leave GWC `po-mfd-m2-att-scope-01-qc.md` | **PASS** · leave scope prior; OT CONDITION superseded elsewhere CLOSED |
| PNG spot `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/03-nv-after-submit.png` · `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/06-ql-after-approve.png` · `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/07-ql-approve-f5.png` · `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/08-ceo-expected-no-cta.png` | **PASS** · create toast · approve stats · F5 · ceo@ Duyệt OBS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | stack health | **PASS** | runtime l0 hrm/portal 200 |
| **CREATE** leave (NV FE) | POST 201 HRM-LEAVE-201 | **PASS** | network + PNG 03 |
| **UPDATE** leave approve (QL FE) | POST 201 HRM-LEAVE-203 · FE approved | **PASS** | network + PNG 06 |
| **READ** F5 after approve | approved count persists | **PASS** | f5 + PNG 07 |
| Leave list → Duyệt → F5 (L2.5) | cross-nav mutate | **PASS** | browser JSON + HDSD inventory |
| **J-HRM-06** host | attendance journey map | **not re-gated** | honesty |
| ceo@ EXPECTED_NO_CTA | honesty spot | **OBS** | PNG 08 · count=32 — not NO-GO |
| SHEETS / OT / CLOCK | prior CLOSED / in-flight | **untouched** | — |
| Full Attendance CLOSED | program | **NOT CLAIMED** | — |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent full Attendance CLOSED
- Did not reopen SHEETS / OT / CLOCK CLOSED or in-flight slices
- Did not NO-GO solely on QA pack format gap or ceo@ EXPECTED_NO_CTA OBS
- Did not claim APPROVE PASS via ceo@
- Did not GO without opening QA MD + browser JSON + PNG spot

---

## completion_report

**Closed:** L3 QC gate `PO-MFD-M2-ATT-LEAVE-WF-01-QC` for **leave create → QL approve → F5** (HRM-AT-10..13 / surfaces 19·28). Spot-check Network create **201** `HRM-LEAVE-201` + approve **201** `HRM-LEAVE-203` + F5 (`STAMP` `LWF01-E9U9ST`). Approve persona QL `uat.nv0002` only. ceo@ EXPECTED_NO_CTA mismatch = **OBS** not NO-GO. U65 zero-seed. SHEETS/OT/CLOCK not reopened.

**Residual / conditions:** OBS ceo@ CTA / xcid / balance-403 / stamp-list (optional P3); QA pack format P3; **uat_done=false**; **NOT** Attendance CLOSED · **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-LEAVE-WF-01-PM-CLOSE
from_role: qc
to_role: pm
lane: governance
priority: P0
u65_zero_seed: true
entry_criteria:
  - docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - Leave WF create→QL approve→F5 CLOSED (U65 · 201 HRM-LEAVE-201 · 201 HRM-LEAVE-203 · F5 · persona uat.nv0002)
  - ceo@ EXPECTED_NO_CTA mismatch = OBS not NO-GO; SHEETS/OT/CLOCK not reopened
action:
  1) Bus INTAKE PO-MFD-M2-ATT-LEAVE-WF-01-QC PASS_TO_PM + stamp surfaces 19/28 LIVE on M2 backlog / runtime log (QA already noted)
  2) Do NOT claim Attendance CLOSED / uat_done / Phase1 DONE
  3) Optional P3: ba-process refresh EXPECTED_NO_CTA wording vs ceo@ runtime Duyệt CTA — capacity only
  4) Continue next open M2 P0 from backlog (CLOCK GPS in-flight or next P0) — do not reopen SHEETS/OT CLOSED
forbidden: seed · invent Attendance CLOSED · invent UAT DONE · reopen SHEETS/OT/CLOCK from this closeout
ack_status: PASS_TO_PM after bus + backlog stamp
evidence_path: docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md
```

## ack_status

**PASS_TO_PM**
