# QC Gate Decision — CD-FB-06-ROLE-SWITCH (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-06-ROLE-SWITCH` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **environment** | `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **accounts** | `ceo@xe.vn` · `du-lich.ceo@xe.vn` / `Xevn@2026` |
| **executed_at** | `2026-07-19` |
| **program** | Customer demo HRM delta F3 (role / company switch) |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §3 F3 · AC-CD-F3-01..06 · `J-HRM-INT-05` · ADR-HRM-RBAC-SCOPE-LADDER §5.3 |
| **decision** | **GO WITH CONDITIONS** — F3 single-hat + OU filter + member isolation + **J-HRM-INT-05** PASS |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited QA `cd-fb-06-role-switch-qa-20260719.md` (**PASS_TO_PM**) after FE READY_FOR_QA. Evidence pack **8/8 exit 0**. L0 spot: hrm/xbos/portal **200**. Product AC for demo F3 on pilot personas: chips, OU refetch with JWT `main` stable, member isolation (no rollup + `holding` **409**), and **J-HRM-INT-05** 4-tab slug sweep **0×409** — all **PASS**.

**AC-CD-F3-04** multi-hat `select-membership` JWT re-issue is **N/A** (single membership on both pilot accounts; U65 forbids seed). Residual **R-CD-FB-06-01** / **C-CD-FB-06-02** P2 English `subsidiary ceo` label — **CLOSED** 2026-07-19 via `CD-FB-06-ROLE-LABEL-P2` (`docs/qa/evidence/cd-fb-06-role-label-p2-qc-20260719.md`).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY / customer-demo program exit.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-fe | `docs/qa/evidence/cd-fb-06-role-switch-fe-20260719.md` | READY_FOR_QA — chips mounted; OU banner; select-membership path; vitest |
| qa | `docs/qa/evidence/cd-fb-06-role-switch-qa-20260719.md` | **PASS_TO_PM** — browser U65 L2 + L2.5 |
| qc (this) | `docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md` | **GO WITH CONDITIONS** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-06-role-switch-qa-20260719.md` | **0** | **8/8** | **PASS** — gate open for QC product adjudication |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-06-role-switch-qa-20260719.md
# PASS: QC evidence pack ready (8/8)
```

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 HTTP 200 hrm/xbos/portal (QC spot 2026-07-19) | ENV | **PASS** — healthy lines printed; Windows libuv assert after exit (known flake) — **not** product NO-GO |
| `verify:qc:evidence-pack` 8/8 | PROCESS | **PASS** |
| AC-CD-F3-01 chips legal name + role (not UUID) | PRODUCT | **PASS** (QA browser) |
| AC-CD-F3-02 OU filter refetch + «Đang xem» | PRODUCT | **PASS** — 1107→220 · `company_id=trsport` |
| AC-CD-F3-03 JWT `companyId=main` stable after OU | PRODUCT | **PASS** |
| AC-CD-F3-04 multi-hat select-membership | PRODUCT | **N/A** → condition **C-CD-FB-06-01** (not FAIL) |
| AC-CD-F3-05 / F3-06 member static + isolation | PRODUCT | **PASS** — 18 NV; `holding` **409** |
| **J-HRM-INT-05** 4-tab `trsport`+`holding` 0×409 | PRODUCT L2.5 | **PASS** |
| Seed in evidence | PROCESS U65 | **PASS** — none |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-19) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert (exit −1073740791) | **ENV flake** — treat as PASS (same pattern as L0 resume) |

Concurs QA L0 in pack.

---

## AC matrix adjudication

| AC (delta §3.5 / QA pack) | Expect | QA | QC |
|---------------------------|--------|----|----|
| **AC-CD-F3-01** | Context chips ĐVTV + role | PASS | **PASS** |
| **AC-CD-F3-02** | OU filter refetch + banner | PASS | **PASS** |
| **AC-CD-F3-03** | JWT stable on embed filter | PASS | **PASS** |
| **AC-CD-F3-04** | Membership → select-membership JWT | N/A single-hat | **N/A** → **C-CD-FB-06-01** |
| **AC-CD-F3-05** | Member static / journey L2.5* | PASS (member) + J listed | **PASS** substance |
| **AC-CD-F3-06** | Member no group rollup | PASS | **PASS** |
| **J-HRM-INT-05** | 4-tab slug sweep 0×409 | PASS | **PASS** |

\*Note (process): delta maps **AC-CD-F3-05** = journey **J-HRM-INT-05**; QA pack maps F3-05 to member static and lists **J-HRM-INT-05** as its own row. QC accepts **substance coverage** (journey + member isolation both evidenced). PM may align AC labels on next BA delta polish — **not** product NO-GO.

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-HRM-INT-05** | **Yes** (mandatory for F3) | **PASS** — QA: employees/contracts/insurance/attendance for `trsport` + `holding`; **count409=0**; soft-nav kept OU banner |
| Soft-nav portal HRM tabs post-OU filter | Yes (supporting) | **PASS** (QA click path B) |
| Multi-hat membership switch → JWT remount | No (no persona) | **Deferred** — **C-CD-FB-06-01** |
| Full J-HRM-01..07 / Phase1 matrix | Out of slice | Not claimed |

**NO-GO trigger not met:** in-scope mandatory **J-HRM-INT-05** has browser + session API evidence PASS; not left ⏳ against a blind PASS claim.

**Trace note:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` still shows **J-HRM-INT-05** as ⏳ — PM should promote to PASS citing this QA/QC pack (governance hygiene; not product reopen).

---

## Conditions

| ID | Severity | Owner | Expiry / trigger | Status |
|----|----------|-------|------------------|--------|
| **C-CD-FB-06-01** | Process / AC gap | pm → qa when multi-hat persona exists (no seed) | Retest AC-CD-F3-04 select-membership → JWT → iframe remount | **OPEN** |
| **C-CD-FB-06-02** | P2 UX | closed by `CD-FB-06-ROLE-LABEL-P2` | Map `subsidiary_ceo` → VI — see `docs/qa/evidence/cd-fb-06-role-label-p2-qc-20260719.md` | **CLOSED** (2026-07-19) |
| **C-CD-FB-06-03** | Standing | pm | Forever for this gate | **OPEN** — **NOT** Phase1 DONE · **NOT** PROD · **NOT** F-DELIVERY exit |
| **C-CD-FB-06-04** | Process | pm / ba | Promote BA_TRACE **J-HRM-INT-05** ⏳ → PASS | **OPEN** (hygiene) |

---

## Residual (concur QA)

| ID | Severity | Note | QC |
|----|----------|------|-----|
| **R-CD-FB-06-01** | P2 | Member chip `subsidiary ceo` English fallback | = **C-CD-FB-06-02** — **CLOSED** (`cd-fb-06-role-label-p2-qc-20260719.md`) |
| **R-CD-FB-06-02** | Info | Multi-hat not exercised | = **C-CD-FB-06-01** |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY AC-CD-DEL-* closure from this slice alone
- Waive F3–F6 sponsor lock
- Seed to create multi-hat for AC-CD-F3-04
- Promote unrelated UF/J-* rows

---

## completion_report

QC **GO WITH CONDITIONS** for `CD-FB-06-ROLE-SWITCH` (customer demo F3). Closed: AC-CD-F3-01..03 + 05..06 + **J-HRM-INT-05** on pilot personas; evidence-pack **8/8**; L0 **200×3**. **Later CLOSED (2026-07-19):** P2 VI label **C-CD-FB-06-02** / **R-CD-FB-06-01** via `CD-FB-06-ROLE-LABEL-P2`. Still open: multi-hat AC-F3-04 N/A (**C-CD-FB-06-01**), standing no Phase1/PROD (**C-CD-FB-06-03**), BA_TRACE promote (**C-CD-FB-06-04**). No seed. No Phase1/PROD claim.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-SWITCH
from_role: pm
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md GO WITH CONDITIONS
actions:
  1) Bus INTAKE + promote CD-FB-06 F3 slice status (chips/OU/member/J-HRM-INT-05)
  2) Update docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md J-HRM-INT-05 ⏳ → PASS (cite QA+QC 20260719)
  3) Continue customer-demo backlog (CD-FB-07 / F4…) — do NOT claim Phase1/PROD/F-DELIVERY
optional_parallel (non-blocking):
  work_item_id: CD-FB-06-ROLE-LABEL-VI
  to_role: dev-fe
  entry: C-CD-FB-06-02 / R-CD-FB-06-01 — subsidiary_ceo → «TGĐ công ty thành viên» in scopeRoleLabels.ts + vitest
  exit: READY_FOR_QA smoke du-lich.ceo chip VI
  evidence: docs/qa/evidence/cd-fb-06-role-label-vi-fe-20260719.md
cấm: seed multi-hat · reopen AC already PASS without regression · Phase1/PROD claim
```

**ack_status:** **PASS_TO_PM**
