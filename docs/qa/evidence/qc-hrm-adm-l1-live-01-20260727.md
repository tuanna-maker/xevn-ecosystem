# QC Gate — QC-HRM-ADM-L1-LIVE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ADM-L1-LIVE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · Info-condition clear · HOLD_DEPLOY · U65 |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — formal **CLEAR** Info **L1-live-404-wire** + **L1-live-scope-wire**; keep **L1-live-audit-row** + **G-ADM-01-READ** Info **OPEN**; **do not** reopen CLOSED G-ADM |
| **scope_claim** | L1-live HTTP wires on L0-up stack only — **not** UF browser mutate · **not** Phase1/PROD/:8088 |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed · no invent admin mutate · no invent GET audit DONE |

---

## Scope (bounded — Info clear only)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal **CLEAR** `L1-live-404-wire` after live **404** `HRM-ERR-USER-NOT-FOUND` | Reopen **G-ADM-05** without FAIL |
| Formal **CLEAR** `L1-live-scope-wire` after live **401**/`HRM-AUTH-001` + **403**/`HRM-AUTH-002` Option A | Reopen **G-ADM-SCOPE-01** / **G-ADM-01** without FAIL |
| Keep `L1-live-audit-row` Info **OPEN** (QA honest SKIP privileged reset) | Invent live audit INSERT PASS / password mutate |
| Keep `G-ADM-01-READ` Info **OPEN** | Invent GET `/admin/audit*` DONE |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | Admin UF browser claim · seed · `:8088` |

**Prior GWC (must_keep CLOSED):** `qc-hrm-adm-05-01` · `qc-hrm-adm-scope-01` · `qc-hrm-adm-audit-01`  
**QA entry:** `docs/qa/evidence/qa-hrm-adm-l1-live-01-20260727.md`  
**L0 entry:** `docs/qa/evidence/do-hrm-l0-stack-01-20260727.md`

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Formal CLEAR L1-live-404-wire (live 404 `HRM-ERR-USER-NOT-FOUND`) | **PASS** — QA + QC independent spot |
| 2 | Formal CLEAR L1-live-scope-wire (live 401/403 Option A) | **PASS** — QA + QC independent spot |
| 3 | Keep L1-live-audit-row Info OPEN (honest skip — no G-ADM-01 reopen) | **PASS** — remains OPEN |
| 4 | Keep G-ADM-01-READ Info OPEN — no invent GET audit | **PASS** — remains OPEN |
| 5 | Do NOT reopen G-ADM-05 / G-ADM-SCOPE-01 / G-ADM-01 without FAIL | **PASS** — stay CLOSED |
| 6 | Evidence this file → PASS_TO_PM · HOLD_DEPLOY · NOT Phase1/PROD/:8088 | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `do-hrm-l0-stack-01-20260727.md` | L0 hrm/xbos/portal 200 · `qc:dev-stack` EXIT 0 | **PASS** | ENV stack |
| `qa-hrm-adm-l1-live-01-20260727.md` | Live 404 + 401/403 · audit SKIP honest | **PASS** · PASS_TO_PM | Info wires A+B |
| `qc-hrm-adm-05-01-20260727.md` | G-ADM-05 CLOSED; L1-live-404 Info was OPEN | **GWC prior** | G-ADM-05 must_keep |
| `qc-hrm-adm-scope-01-20260727.md` | G-ADM-SCOPE-01 CLOSED Option A; L1-live-scope Info was OPEN | **GWC prior** | SCOPE must_keep |
| `qc-hrm-adm-audit-01-20260727.md` | G-ADM-01 write CLOSED; L1-live-audit-row Info OPEN | **GWC prior** | audit write must_keep |

**must_keep:** G-ADM-01 write CLOSED · G-ADM-05 CLOSED · G-ADM-SCOPE-01 Option A CLOSED · U65 · HOLD_DEPLOY · no invent GET audit · no invent privileged password mutate · no reopen CLOSED G-ADM without FAIL.

---

## Spot verify (QC independent)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-adm-l1-live-01-20260727.md` | **FAIL** 3/8 (`command_table`, `portal_url`, `journey_l25`) | PROCESS — L1 API-wire QA pack (expected P3; not product NO-GO) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-adm-l1-live-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| `node -e "fetch('http://127.0.0.1:28001/api/hrm').then(r=>console.log(r.status))"` | **PASS** **200** | ENV (L0) |
| `node -e "fetch('http://127.0.0.1:28002/api/xbos').then(r=>console.log(r.status))"` | **PASS** **200** | ENV (L0) |
| QC spot `POST …/reset-user-password` no Bearer | **401** `HRM-AUTH-001` | PRODUCT wire |
| QC spot `POST …/company-admin` no Bearer | **401** `HRM-AUTH-001` | PRODUCT wire |
| QC spot `POST …/reset-user-password` Bearer `group_ceo` + missing UUID | **404** `HRM-ERR-USER-NOT-FOUND` | PRODUCT wire |
| QC spot `POST …/company-admin` Bearer `subsidiary_ceo` + valid DTO (gate-only) | **403** `HRM-AUTH-002` | PRODUCT wire |
| QC spot `POST …/reset-user-password` Bearer `subsidiary_ceo` | **403** `HRM-AUTH-002` | PRODUCT wire |
| Privileged reset mutate / live audit INSERT | **SKIPPED** — U65 honesty (same as QA) | ENV/ops optional — Info remains OPEN |

**Portal URL / PORTAL_DEV_URL:** `http://127.0.0.1:5173/` (L0 portal health from `DO-HRM-L0-STACK-01`; this WI is L1 API-wire only — no browser UF mutate). `PORTAL_DEV_URL` not required for admin mutate claim (none claimed).

### Read-only / wire matrix (L1-live)

| Wire / AC | HTTP | Code | Verdict | Spec |
|-----------|------|------|---------|------|
| Missing UUID reset (platform) | **404** | `HRM-ERR-USER-NOT-FOUND` | **PASS** | API_DESIGN §D Errors · G-ADM-05 Info clear |
| Unauth reset / company-admin | **401** | `HRM-AUTH-001` | **PASS** | Option A gate |
| Non-platform company-admin | **403** | `HRM-AUTH-002` | **PASS** | G-ADM-SCOPE-01 Option A |
| Non-platform reset | **403** | `HRM-AUTH-002` | **PASS** | G-ADM-SCOPE-01 Option A |
| Live audit INSERT row | — | — | **SKIPPED** Info OPEN | G-ADM-01 write already CLOSED |
| GET `/admin/audit*` | — | — | **NOT claimed** | G-ADM-01-READ Info OPEN |

### Classification (ENV vs PRODUCT)

| Signal | Type | Finding |
|--------|------|---------|
| Live 404 `HRM-ERR-USER-NOT-FOUND` (was ENV Info when L0 DOWN) | PRODUCT wire observed | **L1-live-404-wire CLEARED** |
| Live 401/403 Option A (was ENV Info when L0 DOWN) | PRODUCT wire observed | **L1-live-scope-wire CLEARED** |
| Live audit INSERT skipped (password-break risk) | ENV/ops optional honesty | **L1-live-audit-row remains Info OPEN** — **not** product FAIL |
| G-ADM-01 / G-ADM-05 / G-ADM-SCOPE-01 | PRODUCT must_keep | **CLOSED unchanged** — no reopen |
| G-ADM-01-READ | Info non-goal | **OPEN** — not invented |
| QA pack 3/8 Layer B | PROCESS P3 | Expected for L1 API-wire packet; QC pack 8/8 gates GO |
| Seed / invent mutate / Phase1 / PROD / `:8088` | OUT | **NOT claimed** · HOLD_DEPLOY |

### L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Admin UF / FR-03..05 browser journey | **N/A** this packet | L1 API-wire Info clear — L2.5 browser **not in entry criteria** |
| J-HRM-ADMIN mutate (if mapped later) | **not claimed** | Live 404/401/403 PASS ≠ UF browser PASS (U65) |
| L1-live-404-wire + L1-live-scope-wire | **PASS** | Cross-nav browser N/A; API privilege/error wires PASS |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this Info-condition clear. Do **not** promote admin UF mutate or invent GET audit from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| ~~**L1-live-404-wire**~~ | Info | **CLEARED** this QC | — (was OPEN on `qc-hrm-adm-05-01`) |
| ~~**L1-live-scope-wire**~~ | Info | **CLEARED** this QC | — (was OPEN on `qc-hrm-adm-scope-01`) |
| **L1-live-audit-row** | Info | **OPEN** (honest SKIP) | optional later safe-restore UF — **do NOT** reopen G-ADM-01 without FAIL |
| **G-ADM-01-READ** | Info | **OPEN** | `dev-be` optional — **cấm** invent DONE |
| ~~**G-ADM-01**~~ (write) | — | **CLOSED** | must_keep `qc-hrm-adm-audit-01` |
| ~~**G-ADM-05**~~ | — | **CLOSED** | must_keep `qc-hrm-adm-05-01` |
| ~~**G-ADM-SCOPE-01**~~ | — | **CLOSED** Option A | must_keep `qc-hrm-adm-scope-01` |
| **Option B** membership admin | HOLD | OPEN | Sponsor CR only |
| **C-ADM-L1-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich L1-live packs for Layer B 8/8 |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Cleared Info:** **L1-live-404-wire** (live **404** `HRM-ERR-USER-NOT-FOUND`) · **L1-live-scope-wire** (live **401** `HRM-AUTH-001` + **403** `HRM-AUTH-002` Option A on company-admin + reset). Corroborated by QA pack + QC independent spot on L0-up `:28001`/`:28002`.
- **Remain OPEN (conditions):** **L1-live-audit-row** Info (honest privileged-reset SKIP — OK) · **G-ADM-01-READ** Info · Option B HOLD · HOLD_DEPLOY · **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088`.
- **Must_keep CLOSED (not reopened):** G-ADM-01 write · G-ADM-05 · G-ADM-SCOPE-01 Option A.
- **cấm honored:** no seed · no invent admin mutate · no invent GET audit · no reopen CLOSED G-ADM without FAIL · no Phase1/PROD/:8088 · no UF admin claim.

**Admin wave:** Info ENV wires that blocked “live observation” are cleared for 404 + scope; remaining admin Info is optional (audit-row / GET list) — **Admin wave idle** unless PM prioritizes next program residual.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-ADM-L1-LIVE-01`. Formal **CLEAR** Info conditions **L1-live-404-wire** and **L1-live-scope-wire** after L0-up live HTTP: platform missing UUID → **404** `HRM-ERR-USER-NOT-FOUND`; unauth → **401** `HRM-AUTH-001`; `subsidiary_ceo` → **403** `HRM-AUTH-002` (company-admin + reset). QA + QC independent spot agree. **L1-live-audit-row** remains Info OPEN (honest SKIP — **no** G-ADM-01 reopen). **G-ADM-01-READ** remains Info OPEN (not invented). G-ADM-01 / G-ADM-05 / G-ADM-SCOPE-01 stay CLOSED. QC evidence-pack **8/8**. U65 · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 · no seed · no invent admin mutate.

**Residual:** L1-live-audit-row Info; G-ADM-01-READ Info; Option B HOLD; C-ADM-L1-QA-PACK-01 P3; Admin wave idle / next program residual per PM.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-ADM-L1-LIVE-01
from_role: qc
to_role: pm
lane: governance intake · Admin L1-live Info clear · HOLD_DEPLOY
priority: P2

entry_criteria:
- QC-HRM-ADM-L1-LIVE-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-adm-l1-live-01-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-adm-l1-live-01-20260727.md
- L0: docs/qa/evidence/do-hrm-l0-stack-01-20260727.md

action:
1. Bus INTAKE: mark L1-live-404-wire + L1-live-scope-wire Info CLEARED (do NOT reopen G-ADM-05 / G-ADM-SCOPE-01)
2. Keep L1-live-audit-row Info OPEN — do NOT reopen G-ADM-01 without FAIL
3. Keep G-ADM-01-READ Info OPEN — do NOT invent GET audit DONE
4. Admin wave idle unless prioritizing optional audit-row safe-restore UF or next program residual (pm:idle:check / PM_OPEN_BACKLOG)
5. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
cấm: seed · invent admin mutate · invent GET audit · reopen CLOSED G-ADM without FAIL · Phase1/PROD/:8088 · treat L1 wire PASS as UF browser PASS
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-adm-l1-live-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — CLEAR L1-live-404 + L1-live-scope Info only; audit-row + G-ADM-01-READ remain OPEN; G-ADM-01/05/SCOPE stay CLOSED; Admin wave idle or next program residual; HOLD_DEPLOY · NOT Phase1/PROD/:8088.
