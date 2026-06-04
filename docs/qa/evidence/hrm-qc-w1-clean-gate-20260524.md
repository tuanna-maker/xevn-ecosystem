# W1-HRM-QC-CLEAN-GATE — HRM embed W1 slice (Group CEO Command Center)

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-HRM-QC-CLEAN-GATE` |
| **date** | 2026-05-24 |
| **owner** | QC |
| **scope** | UAT embed slice — Group CEO (`ceo@xe.vn`) Command Center HRM embed + **J-HRM-01..07** L2.5 |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `x-tenant-id: xevn` · `company_id=main` |
| **not in scope** | Phase 1 G1–G9 closure · Production cutover · 119 UC G2 · member CEO / HRBP persona · full HRM standalone app |

## Evidence audited

| Artifact | Role | QC read |
|----------|------|---------|
| `hrm-be-w1-clean-gate-20260524.md` | Dev-BE | Yes — 139/139 jest; P0 audit closed for wave; P1-01..06 deferred |
| `hrm-fe-w1-clean-gate-20260524.md` | Dev-FE | Yes — vitest 83/83; `useDecisions` API mode; `EmbedGuardedTab` on profile |
| `hrm-qa-w1-clean-gate-20260524.md` | QA | Yes — L0 + G-FID 7/7 + L2 9/9 + **L2.5 J-HRM 7/7** + decisions 200 |
| `hrm-tm-review-20260524.md` | TM (context) | Yes — prior **NO-GO** / GWC deferred post-W1; conditions mapped below |

**QC L0 reproduce (2026-05-24):** `pnpm run qc:dev-stack` → **exit 0** (HRM `:28001`, XBOS `:28002`, portal `:5175` HTTP 200).

---

## L2.5 journey coverage (U19 — mandatory)

| J-ID | Journey | QA verdict | QC |
|------|---------|------------|-----|
| **J-HRM-01** | Hợp đồng → Hồ sơ NV | PASS (list → GET employee 200) | **Concurs** |
| **J-HRM-02** | Nhân sự list → Hồ sơ | PASS | **Concurs** |
| **J-HRM-03** | Hợp đồng → chi tiết HĐ | PASS | **Concurs** |
| **J-HRM-04** | Bảo hiểm → NV linked | PASS | **Concurs** |
| **J-HRM-05** | Tuyển dụng → ứng viên (`company_id=main`) | PASS (retest; was VAL-001) | **Concurs** |
| **J-HRM-06** | Chấm công → bản ghi | PASS | **Concurs** |
| **J-HRM-07** | Lương → phiếu → GET employee | PASS (retest; was 404) | **Concurs** |

**L2.5 audit:** QA evidence is **authenticated API smoke** (list → GET-by-id / row presence), not full browser click-through on every tab. Sufficient for **UAT embed slice** gate per `PROGRAM_JOURNEY_MAP.md` and `business-flow-zero-defect-gate.mdc` — **not** a substitute for sponsor demo script without `qc:fe-be-health` (see condition C-W1-06).

**Mandatory J-* untested:** **None** for in-scope J-HRM-01..07.

---

## Business-flow gate (L0–L2.5)

| Layer | Requirement | Status | Evidence |
|-------|-------------|--------|----------|
| **L0** | `pnpm run qc:dev-stack` | **PASS** | QA-01 + **QC reproduced** |
| **G-FID** | `verify:hrm:menu-density` 7/7 | **PASS** | QA-01 |
| **L2** | `test:hrm-embed:audit` P-CC-03..08 | **PASS** **9/9** | QA-01 → `hrm-embed-fe-audit-20260524.md` |
| **L2.5** | J-HRM-01..07 | **PASS** **7/7** | QA-01 §Journeys |
| **Decisions** | `GET /api/hrm/decisions?company_id=main` | **PASS** 200 | QA-01 (empty `total=0` acceptable) |
| **L1** | Full system UAT 37/37 | **Carry-forward** | `system-integration-uat-report.json` (not re-run this gate) |
| **L3** | This QC packet | **Issued** | This file |

### Instant FAIL checks (in-scope embed)

| Check | Status |
|-------|--------|
| Required `:54321` on P-CC-03..08 / decisions load | **None observed** (QA + FE guard audit) |
| **409** scope mismatch on probed routes | **None** |
| HRM API Sync ERROR on proxy | **None** |
| J-HRM-07 scope_parity 404 on GET employee | **Closed** (QA retest 200) |

---

## Options considered

| Option | Rationale | QC decision |
|--------|-----------|-------------|
| **GO** (unconditional UAT embed) | L0–L2.5 all PASS; P0 BE closed for wave | **Rejected** — BE P1 mutate/rollup gaps; TM §1 checklist unsigned; dual Supabase debt; no production NFR |
| **NO-GO** | TM prior NO-GO same date | **Rejected for embed slice** — W1 closed TM P0 blockers (J-HRM-05/07, performance rollup, decisions route, embed guards); QA L2.5 bundle complete |
| **GO WITH CONDITIONS** | Matches S0/S3/G-FID-08 program precedent; honest UAT-READY for group CEO embed only | **Selected** |

---

## Verdict

| Decision | **GO WITH CONDITIONS** |
|----------|-------------------------|
| **UAT embed slice** (Group CEO CC HRM + J-HRM-01..07) | **Approved** for local/pilot UAT on routes proven in QA W1 evidence |
| **Unconditional GO** | **Not approved** |
| **UAT-PASS (full HRM program)** | **Not approved** |
| **Phase 1 / G1–G9 program closure** | **Not approved** |
| **Production GO** | **Not approved** |

**ack_status:** `PASS_TO_PM`

---

## Explicit out-of-scope

| Item | Rationale |
|------|-----------|
| **Full HRM web app** (non-embed routes, ~90 Supabase modules) | ADR dual-mode; only pilot guard + P-CC paths in scope |
| **Employee Profile sub-tabs** (Skills, Resume, Family, Contract tab inside profile, etc.) | `EmbedGuardedTab` placeholder — not API-backed data in embed |
| **Mobile advanced** (15 UC subset, HRBP flows) | Not in W1 slice |
| **P1 BE backlog** (mutate-by-id scope, fleet rollup, operations UUID DTOs, notifications, write DTO slug alignment, missing jest modules) | Documented `hrm-be-w1-clean-gate-20260524.md` §Residual |
| **Member CEO** (`du-lich.ceo@xe.vn`) / **HRBP** persona | Group CEO `main` only |
| **HRM-OP-* operations UAT step 6** | S3-D-01 deferral unchanged |
| **119 UC / G2 e2e_pass matrix** | Program honesty — ~35–45% class evidence per TM audit |
| **Platform NFR / `verify:production-env`** | Production cutover lane |
| **Tenant-isolation e2e** | Not run in BE W1 handoff |

---

## Mandatory conditions (GWC)

| ID | Condition | Owner | Trigger if violated |
|----|-----------|-------|---------------------|
| **C-W1-01** | **Scope cap:** UAT claims only for `ceo@xe.vn` + `company_id=main` on CC HRM embed (P-CC-03..08 + decisions + J-HRM-01..07) | PM / QA | Downgrade to NO-GO if marketed for member CEO or full HRM app |
| **C-W1-02** | **P1-01 mutate-by-id scope:** No production or write-heavy sign-off until `assertResourceInHrmScope` (or equivalent) on employees, payroll, attendance, operations, employee-metadata mutations — recruitment/contracts partial only | Dev-BE | NO-GO production; TM IDOR class |
| **C-W1-03** | **P1-02..06** (operations list UUID DTO, fleet rollup, notifications, write `company_id` UUID bodies, jest gaps) — track W2+; block only if in-scope embed tab regresses | Dev-BE | Re-open defect + NO-GO on affected P-CC row |
| **C-W1-04** | **TM scope parity checklist:** File TM addendum or update `hrm-tm-review-20260524.md` §1 → signed after W1 (mutate path + any new GET-by-id) | PM → technical-manager | Required before **Production** GO on HRM |
| **C-W1-05** | **FE date display:** Zero `Invalid time value` on Contracts / Decisions / recruitment in browser for pilot persona (TM-R3) | Dev-FE | Condition for external sponsor demo |
| **C-W1-06** | **Stack discipline:** Before demo — `pnpm run qc:dev-stack` + `pnpm run qc:fe-be-health` (or `:pilot`) exit 0 | DevOps / QA | L0 FAIL → hold demo |
| **C-W1-07** | **Honesty:** Do not conflate this gate with `P1-S5-QC-01`, `P1-U18-QC-EOD`, or Phase 1 DONE | PM / QC | Escalate over-claim |
| **C-W1-08** | **User P0 on J-*** after this GO:** PM updates `PROGRAM_JOURNEY_MAP.md` + matrix same day; QA retest before re-GO same slice | PM / QA | U19 governance |

### Residual risk register

| ID | Sev | Item | Owner |
|----|-----|------|-------|
| QC-W1-R1 | High | Mutate paths without rollup scope (P1-01) | dev-be |
| QC-W1-R2 | Medium | Dual Supabase/API SoT outside pilot guard | dev-fe |
| QC-W1-R3 | Medium | L2.5 API smoke vs full browser click path | qa |
| QC-W1-R4 | Low | Decisions empty table (`total=0`) | dev-be / seed |
| QC-W1-R5 | Low | `page_size` → 400 on some list DTOs (QA noted) | dev-be |

---

## Pre-merge quality checklist

Reference: `.cursor/rules/pre-merge-quality-gate.mdc`

| Section | W1 embed slice status | Evidence |
|---------|----------------------|----------|
| Senior engineering / SOLID | **PASS (scoped)** | BE list↔get parity pattern on employees; decisions module wired to `resolveHrmListScope` |
| Security / information safety | **GWC** | P1-01 mutate scope open — condition C-W1-02; no secrets in evidence |
| Performance / reliability | **PASS (dev)** | L0 stack; density 7/7; no unbounded probe failures |
| Business correctness / acceptance | **PASS (scoped)** | QA L2.5 7/7 + P-CC embed audit |
| UI/UX / accessibility | **GWC** | Profile tabs guarded (placeholder UX); C-W1-05 date display |
| Test / build / release | **PASS (dev)** | hrm-api jest 139/139; HRM vitest 83/83; web-portal build PASS |
| Platform NFR (production) | **NOT MET** | Out of scope — requires `verify:production-env`, metrics, runbook |

Missing **critical** sections for **Production** → **NOT-READY** (expected). For **UAT embed slice**, checklist satisfied with conditions above.

---

## Traceability

| Requirement | Implementation | Test |
|-------------|----------------|------|
| ADR group CEO `main` rollup | `hrm-list-scope.ts`, employees/recruitment/payroll/decisions | `hrm-list-scope.spec.ts`, QA J-HRM-05/07 |
| J-HRM list→detail | BE getEmployeeById parity | QA API smoke |
| Embed Supabase guard | `useDecisions`, `EmbedGuardedTab` | `hrmEmbedPilotGuardAudit.test.ts` |
| Decisions route | `decisions/*` module | QA 200 HRM-DEC-200 |

---

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | qc |
| **to_role** | pm |
| **entry_criteria** | QA `READY_FOR_QC` + W1 BE/FE/QA evidence on file |
| **exit_criteria** | GWC verdict recorded; conditions owned |
| **evidence_path** | `docs/qa/evidence/hrm-qc-w1-clean-gate-20260524.md` |
| **ack_status** | **PASS_TO_PM** |

**One-line verdict:** **GO WITH CONDITIONS** — Group CEO Command Center HRM UAT embed slice (J-HRM-01..07 + P-CC-03..08 + decisions); not Production, not Phase 1, not full HRM app.
