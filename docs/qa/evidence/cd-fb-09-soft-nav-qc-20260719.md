# QC Gate Decision — CD-FB-09-SOFT-NAV-QC (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-09-SOFT-NAV-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **residual_auto_fix** | `true` |
| **closes** | **C-CD-FB-09-01** (soft-nav iframe stall) |
| **parent_gate** | `CD-FB-09-RECRUIT` — `docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md` (**GO WITH CONDITIONS**) |
| **qa_evidence** | `docs/qa/evidence/cd-fb-09-soft-nav-qa-20260719.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/cd-fb-09-soft-nav-20260719.md` (**READY_FOR_QA**) |
| **executed_at** | `2026-07-19` |
| **decision** | **GO WITH CONDITIONS** — residual **C-CD-FB-09-01 CLOSED**; parent F6 GWC retained |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited soft-nav residual after FE UPGRADE + QA browser U65 **PASS**. Soft click Attendance → Tuyển dụng remounts iframe `/hr/recruitment` without hard browser reload; Att↔Rec repeats OK; hard-nav **P-CC-06** 6-stage funnel must_keep **PASS**. Original stall (portal URL recruitment + iframe stuck on Attendance) **not reproduced**.

**C-CD-FB-09-01** → **CLOSED**.

Parent **CD-FB-09-RECRUIT** remains **GO WITH CONDITIONS**. F6 product ACs **AC-CD-F6-01..04** are **not reopened** (no mutate regression this wave; visual smoke OK). Standing / deferred conditions **C-CD-FB-09-02**, **C-CD-FB-09-03**, **C-CD-FB-09-04** remain **OPEN**.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY. **Do not** require **J-REC-WF** / XBOS WF / seed.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc | `cd-fb-09-recruit-qc-20260719.md` | GWC — C-01 was OPEN soft-nav |
| dev-fe | `cd-fb-09-soft-nav-20260719.md` | READY_FOR_QA — pending catch-up + src fallback + Outlet key |
| qa | `cd-fb-09-soft-nav-qa-20260719.md` | **PASS_TO_PM** — soft-nav + P-CC-06 hard must_keep |
| qc (this) | `cd-fb-09-soft-nav-qc-20260719.md` | **C-CD-FB-09-01 CLOSED**; parent GWC retained |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-09-soft-nav-qa-20260719.md` | **1** | **1/8** | **PROCESS GWC** — missing `command_table` regex only; browser click-path + L0 + exit matrix present in prose. **Not** product NO-GO for residual close (precedent: JWT freshness / residual-03 pack format). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-09-soft-nav-qa-20260719.md
# FAIL: QC evidence pack incomplete (1/8 checks) — command_table
```

**QC rule applied:** Product residual adjudicated from readable QA MD (exit criteria matrix, CDP iframe spaPath rounds, screenshots, U65 zero-seed). Pack format gap → condition process note only — **does not** keep **C-CD-FB-09-01** OPEN.

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| Soft-nav QA pack `command_table` 1/8 | P3 process | qa (optional polish) | **Noted** — not blocking C-01 close |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 hrm/xbos/portal **200** | ENV | **PASS** (QA pack) |
| Soft Att → Rec iframe `/hr/recruitment` without hard reload | PRODUCT | **PASS** |
| Soft Att ↔ Rec ×3 remount | PRODUCT | **PASS** |
| Hard-nav P-CC-06 6-stage funnel | PRODUCT must_keep | **PASS** |
| F6 AC-CD-F6-01..04 mutate | OUT OF SLICE this residual | **Not reopened** — no regression proof required; smoke OK |
| J-REC-WF / XBOS WF | OUT OF SLICE | **Not required** (= C-03 standing) |
| Seed | PROCESS U65 | **PASS** — none |
| evidence-pack command_table | PROCESS | **GWC format** — not product reopen |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** |

---

## Condition adjudication (vs parent GWC)

| ID | Parent status | This wave | QC status now |
|----|---------------|-----------|---------------|
| **C-CD-FB-09-01** | OPEN — soft-nav stall | QA soft-nav PASS + FE fix audited | **CLOSED** |
| **C-CD-FB-09-02** | OPEN — AC-F6-06 deferred | Out of scope | **OPEN** (unchanged) |
| **C-CD-FB-09-03** | OPEN — XBOS WF deferred | **cấm require** | **OPEN** (unchanged) |
| **C-CD-FB-09-04** | OPEN — NOT Phase1/PROD | Standing | **OPEN** (unchanged) |

### C-CD-FB-09-01 close criteria (met)

| # | Expect | QA evidence | QC |
|---|--------|-------------|-----|
| 1 | Soft Att → Tuyển dụng → `/hr/recruitment` without hard reload | portal URL + iframe spaPath aligned; `navCount=1`; `_v` stable | **PASS** |
| 2 | Soft Att ↔ Rec repeat | Rounds 1–3 remount recruitment; not stuck Attendance | **PASS** |
| 3 | Hard-nav P-CC-06 funnel must_keep | Pipeline 6 giai đoạn labels visible | **PASS** |
| 4 | No F6 AC reopen without regression | Smoke only; no JD/requisition mutate | **PASS** |
| 5 | No seed / no J-REC-WF | None | **PASS** |

---

## L2.5 / journey scope (U19 — narrow)

| Journey | In this residual? | Status |
|---------|-------------------|--------|
| Soft-nav Att → Tuyển dụng (C-01 AC) | **Yes** | **PASS** — CLOSED |
| **P-CC-06** hard path | must_keep regression | **PASS** (not reopened as product AC) |
| **J-HRM-05** | Parent F6 only | **Not retested** — must_keep prior PASS; not reopened |
| **J-REC-WF-*** | No | Deferred — **C-03**; **do not require** |

**NO-GO trigger not met:** in-scope soft-nav residual has browser click-path PASS; mandatory parent journeys not revoked.

---

## Forbidden claims (reaffirmed)

- Phase 1 DONE / PROD-READY / F-DELIVERY exit
- Reopen **AC-CD-F6-01..04** without regression proof
- Require **J-REC-WF** / XBOS recruitment WF / seed for this close
- Promote unrelated UF/J-* from this residual alone
- Claim parent gate upgraded to unconditional **GO** (C-02/C-03/C-04 still open)

---

## Parent gate status after this residual

| Gate | Decision |
|------|----------|
| **CD-FB-09-RECRUIT** | Still **GO WITH CONDITIONS** — F6 MVP hard-path PASS retained; **C-01 CLOSED**; **C-02 / C-03 / C-04 OPEN** |
| **CD-FB-09-SOFT-NAV-QC** | Residual close **PASS** — soft-nav product condition closed |

---

## completion_report

QC closed **C-CD-FB-09-01** after soft-nav QA **PASS_TO_PM** (U65 browser: Att→Rec without hard reload; Att↔Rec OK; P-CC-06 hard funnel must_keep). FE root-cause (pending soft-nav + src fallback + Outlet key) audited. F6 **AC-CD-F6-01..04** **not reopened**. Parent F6 remains **GO WITH CONDITIONS** with **C-02 / C-03 / C-04** still open. Evidence-pack soft-nav QA **1/8** (`command_table`) classified **PROCESS** — does not keep C-01 open. **NOT** Phase1 / PROD / F-DELIVERY. No XBOS WF / seed required.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: CD-FB-09-SOFT-NAV-QC
from_role: pm
to_role: pm
lane: governance
residual_auto_fix: true

INTAKE QC residual close — C-CD-FB-09-01 CLOSED.
entry: docs/qa/evidence/cd-fb-09-soft-nav-qc-20260719.md PASS_TO_PM
actions:
  1) Bus INTAKE: C-CD-FB-09-01 CLOSED; parent CD-FB-09-RECRUIT still GWC (C-02/C-03/C-04 OPEN)
  2) Continue customer-demo backlog next CD-FB-* — do NOT claim Phase1/PROD/F-DELIVERY
  3) Do NOT dispatch XBOS WF / J-REC-WF as blocker for F6
  4) Optional later: CD-FB-09-AC-F6-06 when scheduled (C-CD-FB-09-02)
cấm: seed · reopen AC-CD-F6-01..04 without regression · require J-REC-WF · Phase1/PROD claim
```

**ack_status:** **PASS_TO_PM**  
**evidence_path:** `docs/qa/evidence/cd-fb-09-soft-nav-qc-20260719.md`
