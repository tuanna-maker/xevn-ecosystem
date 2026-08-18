# QC Gate — QC-HRM-G-AT10-02-LEAVE-OVERLAP-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-G-AT10-02-LEAVE-OVERLAP-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-21` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — TM C4 / **G-AT10-02** Diễn biến **#5** CLOSED; **#6** SKIP untracked accepted as Condition |
| **scope_claim** | Leave create overlap reject + VI toast only (FR-HRM-AT-10 #5; #6 policy SKIP) |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser FE chain only; no seed in DevOps / BE / FE / QA / QC |

---

## Scope (bounded — NARROW)

| In scope | Explicitly out (cấm expand) |
|----------|------------------------------|
| Audit TM C4 / G-AT10-02 leave overlap (`HRM-LEAVE-VAL-OVERLAP` 409) | Attendance sheet / AC-ATT-SHEET / J-HRM-06b reopen |
| Audit FE VI toast «trùng» live on `:8088` | Hire bind G-DB-01 / J-HRM-INT-01 |
| must_keep non-overlap CREATE **201** + list/F5 | Seed / API-only UF / Phase1 / PROD |
| Accept #6 SKIP (untracked balance) as Condition | Claim BALANCE toast live without tracked data |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/be-hrm-g-at10-02-leave-overlap-01-20260721.md` | Dev-BE | `assertNoLeaveOverlap` + `assertSufficientLeaveBalance`; jest **17/17**; codes OVERLAP 409 / BALANCE 400; untracked → allow |
| `docs/qa/evidence/fe-hrm-g-at10-02-toast-01-20260721.md` | Dev-FE | `friendlyByCode` OVERLAP/BALANCE; vitest **12/12**; happy createSuccess must_keep |
| `docs/qa/evidence/d-do-sync-8088-g-at10-02-01-20260721.md` | DevOps BE | VPS dist markers OVERLAP/BALANCE; hrm-be×3 restart; health **200** |
| `docs/qa/evidence/d-do-sync-8088-fe-at10-02-01-20260721.md` | DevOps FE | `apiError.ts` + `useLeaveRequests.ts` markers via `:8088/hr/src/…`; hrm-fe restart |
| `docs/qa/evidence/qa-hrm-g-at10-02-leave-overlap-01-20260721.md` | QA primary | Browser U65: **201** + F5; overlap **409** + toast «trùng»; #6 **SKIP** untracked |
| `docs/hrm/TECHSPEC.md` §14.5 / §14.9 | Spec | G-AT10-02 CLOSED (BE) — QA/QC verify |

---

## Evidence pack gate (Layer B)

### command_table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-g-at10-02-leave-overlap-01-20260721.md` | **FAIL** exit **1** (4/8) — missing `command_table` + `portal_url` token + `journey_l25` J-* + `crud_or_matrix` | **PROCESS** — format-only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-g-at10-02-leave-overlap-01-20260721.md` | **PASS** exit **0** (8/8) | This gate file |
| BE jest (cited) `leave-requests.service.spec` | **17 PASS** | PRODUCT — BE regression |
| FE vitest (cited) leaveVal + useLeaveRequests + abort | **12 PASS** | PRODUCT — FE regression |
| QC L0 spot `curl.exe` `http://14.225.217.232:8088/` | **200** | ENV |
| QC L0 spot `curl.exe` `http://14.225.217.232:8088/hr/` | **200** | ENV |
| QC L0 spot `curl.exe` `http://14.225.217.232:3101/api/hrm/` | **200** | ENV |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` (not localhost-only).

**QC adjudication:** PROCESS gap on QA pack is **format-only** (precedent leave-create / hire-bind / C-CONV-AS GWC). Browser substance — click path, Network **201**/**409**, VI toast «trùng», counters + F5, U65, #6 SKIP rationale — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Non-overlap POST **201** `HRM-LEAVE-201`; totals 88→89 / F5 89/31 | PRODUCT | **PASS** — must_keep CREATE |
| Overlap POST **409** `HRM-LEAVE-VAL-OVERLAP` + `conflicting_id` / `pending` | PRODUCT | **PASS** — Diễn biến **#5** |
| Toast VI contains «trùng»; totals stay 89/31 (no duplicate) | PRODUCT | **PASS** — FE map live |
| Balance probe 61d → still **201** (not 400) for HLD-0006 annual | PRODUCT / policy | **SKIP #6** — untracked by design (SRS «nếu theo dõi số dư») |
| BALANCE toast live path | PRODUCT deferred | **NOT exercised** — accepted Condition |
| Dev8088 BE+FE sync + health | ENV | **PASS** — DevOps + QC spot 200 |
| Seed / API fake / sheet | PROCESS U65 | **PASS** — none / not run |
| QA pack Layer B 4/8 | PROCESS | **OPEN P3** — non-blocking |
| Soft stale `setFormData` LeaveTab | P3 UX | **DEFER OK** |
| Phase1 / PROD / sheet reopen | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (narrow — TM C4 / G-AT10-02)

| AC | Pass criteria | QA evidence | QC |
|----|---------------|-------------|-----|
| **#5 Overlap** | Network **409** `HRM-LEAVE-VAL-OVERLAP` + VI «trùng»; no duplicate row | POST 409 + toast + totals 89/31 | **PASS / CLOSED** |
| **must_keep #1** | Non-overlap **201** + FE list + F5 | 88→89; F5 89/31; id `a06cdc4e-…` | **PASS** |
| **#6 Balance** | **400** + toast «số dư» **or** SKIP with untracked reason | 61d still **201**; documented untracked | **SKIP → Condition** |
| U65 | Browser-only; no seed | Explicit QA + DevOps | **PASS** |
| Sheet / hire | Out of scope | Not run | **RESPECTED** |

---

## L2.5 — leave overlap journey (this slice)

| J-ID / path | Journey | Evidence | Verdict | Promotable |
|-------------|---------|----------|---------|------------|
| **J-HRM-06** (leave create / overlap slice) | Login → Chấm công → Nghỉ phép → create non-overlap → overlap reject | `qa-hrm-g-at10-02-leave-overlap-01-20260721.md` | **PASS** (#5) | Yes within G-AT10-02 only — **not** full UF matrix promote |
| Leave CREATE must_keep (prior GWC) | Happy 201 path intact | Same QA + prior leave-create GWC | **PASS** | Prior residual CLOSED — no reopen |
| **J-HRM-06b** / attendance sheet | Sheet create→weekly | — | **NOT TESTED** | Out of scope (cấm) |
| Hire G-DB-01 / J-HRM-INT-01 | Hire bind | — | **NOT TESTED** | Out of scope (cấm) |

**Mandatory for this QC slice:** J-HRM-06 leave create overlap (#5) + must_keep happy create. Sheet / hire **deferred by PM NARROW**.

**#6 balance live path:** deferred Condition — not FAIL.

---

## Residual / Conditions (GWC register)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-AT10-02-BAL-SKIP-01** | P2 CONDITION | pm / optional ba+qa | **OPEN** | Diễn biến #6 BALANCE toast **not** live-proven on `:8088` (HLD-0006 annual untracked). Accept SKIP per PM entry + BE must_keep. Reopen only if sponsor wants tracked-balance persona **without seed** (catalog density / real FE balance setup) |
| **C-AT10-02-PACK-01** | P3 PROCESS | qa | **OPEN** | Patch QA evidence: `command_table` + `PORTAL_DEV_URL=` + J-HRM-06 PASS row → verify **8/8** |
| Soft `setFormData` LeaveTab | P3 | fe optional | **DEFER OK** | Rapid automation sibling-field drop — not UF fail this wave |
| Extra pending leave rows from QA | Info | — | **ACK** | Real FE creates (`a06cdc4e-…`, `26e383f0-…`) — not seed |
| Sheet / hire / Phase1 / PROD | OUT | — | **FORBIDDEN** | Not claimed |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| GO/GWC; accept #6 SKIP if product #5 CLOSED | **GWC** — #5 CLOSED; #6 SKIP = Condition |
| Evidence this path | **PASS** |
| cấm seed · sheet reopen · Phase1/PROD | **RESPECTED** |

---

## Decision

**GO WITH CONDITIONS** for bounded slice **TM C4 / G-AT10-02 leave overlap (#5)** on Dev8088 (`PORTAL_DEV_URL=http://14.225.217.232:8088`).

- Product Diễn biến **#5** (overlap 409 + VI «trùng» + must_keep 201/F5): **CLOSED**.
- Diễn biến **#6** untracked SKIP: **accepted Condition** (`C-AT10-02-BAL-SKIP-01`).
- Process pack polish: **OPEN P3** (non-blocking).
- **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** sheet / hire reopen · **NOT** UF matrix full promote.

---

## completion_report

### Closed
- QC audit of BE + FE + DevOps BE/FE sync + QA browser U65 for G-AT10-02.
- **#5:** POST **409** `HRM-LEAVE-VAL-OVERLAP` + toast «trùng»; no duplicate; must_keep **201** + F5.
- FE toast map live post DevOps FE sync; BE jest 17 + FE vitest 12 cited.
- L0 spot portal `/` + `/hr/` + HRM LB **200**.
- U65 zero-seed; sheet/hire/Phase1/PROD not claimed.
- QC evidence pack verify target **8/8** on this file.

### Open (conditions)
- **C-AT10-02-BAL-SKIP-01** — #6 BALANCE live toast deferred (untracked env).
- **C-AT10-02-PACK-01** — QA pack format 4/8 → polish to 8/8 (P3 PROCESS).
- Soft LeaveTab `setFormData` P3 defer OK.
- Program Phase1/PROD / sheet / hire — standing out of scope.

### next_owner
`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-G-AT10-02-GWC-01
from_role: qc
to_role: pm
lane: governance
priority: P1

## Entry
QC GWC: docs/qa/evidence/qc-hrm-g-at10-02-leave-overlap-01-20260721.md
Product #5 CLOSED (overlap 409 + VI trùng + must_keep 201/F5 on :8088 U65)
Condition C-AT10-02-BAL-SKIP-01 OPEN (#6 untracked SKIP by design)
Condition C-AT10-02-PACK-01 OPEN P3 (QA pack 4/8 format)

## Job
1. Bus INTAKE GWC — mark TM C4 / G-AT10-02 #5 CLOSED; do NOT claim Phase1/PROD
2. Optional P3: Task qa polish pack C-AT10-02-PACK-01 (command_table + PORTAL_DEV_URL + J-HRM-06 row) — do NOT retest product #5 unless polish reveals gap
3. Do NOT seed employee_leave_balances to force #6; only reopen #6 if sponsor explicitly wants tracked-balance persona via real FE/catalog density
4. Scan PM_OPEN_BACKLOG / TODO — dispatch next P0/P1 wave (cấm sheet reopen unless new residual)

entry_criteria: QC GWC evidence
exit_criteria: bus updated + next Task OR idle only if backlog empty after idle:check
cấm: seed · sheet · Phase1/PROD claim · force #6 via DB seed
```

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/qc-hrm-g-at10-02-leave-overlap-01-20260721.md`
