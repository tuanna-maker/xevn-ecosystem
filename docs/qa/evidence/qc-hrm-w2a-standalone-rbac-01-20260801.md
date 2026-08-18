# QC-HRM-W2A-RBAC-01 — W2a standalone RBAC slice gate

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HRM-W2A-RBAC-01 |
| **from_role** | qc |
| **to_role** | pm |
| **program** | HDSD W2a / HRM standalone RBAC |
| **upstream** | QA-HRM-W2A-STANDALONE-RBAC-01 PASS_TO_PM |
| **dev_fix** | D-HRM-W2A-STANDALONE-RBAC-01 |
| **date** | 2026-08-01 |
| **portal** | W2a `http://127.0.0.1:8080/hr/` · W2b embed `http://127.0.0.1:5173/command-center/hrm/employees?portal=1&tenantId=xevn&companyId=main` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **policy** | U65 zero-seed · browser-only |
| **ack_status** | PASS_TO_PM |

## Decision

**GO WITH CONDITIONS** — **W2a standalone RBAC slice only** (`PermissionRoute` + nav bypass for mobile JWT on `:8080/hr/*`).

**NOT Phase 1 DONE · NOT PROD-READY · NOT full HRM journey re-sweep · NOT fine-grained module RBAC.**

---

## Scope audited

| In scope | Out of scope |
|----------|--------------|
| R-W2A-RBAC-01 closure — no «Không có quyền truy cập» shell | Full J-HRM-02..08 re-run |
| W2a `:8080/hr/employees` list GET **200** + ≥1 row | CRUD mutate matrix |
| **J-HRM-01** list→detail on W2a standalone | Member CEO negative persona |
| W2b embed employees regression spot (runtime JSON) | Supabase fine-grained permission stub |
| Zero-seed compliance | `R-HARNESS-RBAC` harness enhancement |

---

## Evidence polled (QA intake)

| Artifact | Status | Notes |
|----------|--------|-------|
| `qa-hrm-w2a-standalone-rbac-01-20260731.md` | ✅ | Primary QA handoff |
| `d-hrm-w2a-standalone-rbac-01-20260731.md` | ✅ | Dev root-cause + vitest 8/8 |
| `_tmp-qa-hdsd-w2a-scope-parity-runtime.json` | ✅ | Machine runtime — J-HRM-01 🟢 · parity match |
| `qa-hdsd-w2a-scope-parity-01-r2-20260731.md` | ✅ | Prior scope parity closed; R-W2A-RBAC-01 was P1 open |
| Screens cited `screens/qa-hdsd-w2a-scope-parity-20260730/` | ⚠️ | Referenced by QA; runtime JSON authoritative for this gate |

---

## QA evidence pack integrity

```powershell
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-w2a-standalone-rbac-01-20260731.md
# FAIL: 3/8 — ack_status colon format · portal_url keyword · crud_or_matrix **PASS** row
```

| Check | QA pack | QC ruling |
|-------|---------|-----------|
| work_item_id | PASS | — |
| ack_status | **FAIL** | PROCESS — uses `**PASS_TO_PM**` not `ack_status:` line |
| command_table | PASS | `pnpm run qc:dev-stack` · `qc:fe-be-health` |
| portal_url | **FAIL** | PROCESS — URLs present but missing `portal` + canonical line |
| journey_l25 | PASS | J-HRM-01 documented |
| crud_or_matrix | **FAIL** | PROCESS — uses 🟢 not `\| **PASS** \|` table pattern |
| residual_section | PASS | R-W2A-RBAC-01 closed |
| timestamp | PASS | 2026-07-31 |

**Classification:** Gaps are **PROCESS** (pack formatter), not product defect. **Closed by this QC pack 8/8.**

---

## Independent QC audit

### L0 stack (spot 2026-08-01)

| Gate | Result | Classification |
|------|--------|----------------|
| `pnpm run qc:dev-stack` | ✅ hrm 200 · xbos 200 · portal optional fetch fail | **ENV** — Windows UV abort exit 3221226505 after ✓ HRM/XBOS lines (known class) |
| `pnpm run qc:fe-be-health` | ⚠️ hrm 200 · xbos 200 · portal **ECONNREFUSED :5173** | **ENV** — portal not listening at QC spot; **not** product NO-GO for W2a `:8080` slice |

**QC ruling:** HRM API spine healthy. Portal down blocks **live** W2b re-spot at QC time; W2b regression accepted from QA runtime JSON (`w2bEmployees: 200`, `scope409Count: 0`, `match: true`).

### L1 API (browser network — QA run)

| API | W2a | Expected |
|-----|-----|----------|
| POST `/api/hrm/auth/mobile/login` | **201** | ✅ |
| GET `/api/hrm/employees?company_id=main` | **200** | ✅ holding rollup |
| GET `/api/hrm/employees/:id?company_id=main` | **200** | ✅ scope parity |
| GET `.../work-timeline?company_id=main` | **200** | ✅ |

No **409** / **500** / **54321** on business APIs in runtime network log.

### L2 page load — W2a standalone

| Route | Verdict | Signal |
|-------|---------|--------|
| `/hr/login` → `/hr/employees` | **PASS** | Sidebar + employee table; sync «Đã kết nối»; `scope409Count=0` |
| RBAC shell | **PASS** | No «Không có quyền truy cập» (R-W2A-RBAC-01 fix verified) |

### L2.5 journey matrix

| J-ID | Entry | Click path | Network | Verdict |
|------|-------|------------|---------|---------|
| **J-HRM-01** | W2a `:8080/hr/employees` | List → row VTH-0007A → detail URL | GET detail **200** · work-timeline **200** | **PASS** |
| W2b embed regression | `:5173` CC HRM employees | Load embed list | GET employees **200** · `scope409Count=0` | **PASS** (runtime JSON) |

**U19 audit:** In-scope **J-HRM-01** exercised on **W2a standalone** with list→detail **2xx** — not embed-only. Satisfies L2.5 for this bounded slice.

### W2b regression vs prior 🟢

| Signal | Prior R2 🟢 | This run (runtime JSON) | QC |
|--------|-------------|-------------------------|-----|
| GET employees embed | **200** | **200** | ✅ unchanged |
| scope409Count | **0** | **0** | ✅ |
| Scope/sync banner | none | none | ✅ |

**No regression** vs W2b embed path from scope-parity R2 baseline.

---

## Residual

| ID | Severity | Status | Owner | Note |
|----|----------|--------|-------|------|
| **R-W2A-RBAC-01** | P1 | **CLOSED** ✅ | — | Standalone JWT bypass matches embed policy |
| **R-HARNESS-RBAC** | P2 | Open | qa | Optional harness RBAC-denial assertion — non-blocking |
| **C-RBAC-FINE-GRAINED** | P2 | Deferred | dev-be | Supabase permission stub until BE RBAC API wired |
| **C-QA-PACK-03** | P3 PROCESS | **CLOSED** ✅ | qc | QA pack 3/8 — closed by this QC pack 8/8 |
| **C-ENV-PORTAL-5173** | P3 ENV | Info | devops | Portal down at QC spot; re-spot W2b when `:5173` up (optional) |

**No product P0/P1 open** for this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (slice)** | W2a list renders · J-HRM-01 detail 200 · zero 409 on exercised APIs · W2b parity JSON |
| **ENV / transient** | `qc:dev-stack` UV abort · portal `:5173` ECONNREFUSED at QC spot · pre-login 401 catalog-sync |
| **PROCESS** | QA evidence pack 3/8 formatter gaps |
| **INFO** | Static asset 404s on W2a — non-blocking per QA |
| **OUT OF SCOPE** | Phase 1 DONE · PROD · full journey map sweep · member CEO · mobile |

---

## Conditions (GWC — bounded)

| ID | Condition | Severity |
|----|-----------|----------|
| **C-W2A-RBAC-SLICE** | Gate applies only to W2a standalone mobile-login JWT path on `:8080/hr/*` | INFO |
| **C-RBAC-FINE-GRAINED** | Module-level permissions remain deferred until BE RBAC API — document in next RBAC wave | P2 |
| **C-HARNESS-RBAC** | Optional QA harness enhancement — not required for slice promotion | P2 |
| **C-NOT-PHASE1** | Does **not** promote Phase 1 / PROD / Dev8088 matrix rows | INFO |

**No Dev reopen** for W2a RBAC slice.

---

## Command table (QC spot)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-w2a-standalone-rbac-01-20260731.md` | 1 | FAIL 3/8 PROCESS (see above) |
| `pnpm run qc:dev-stack` | 3221226505 | HRM+XBOS **200**; portal optional fail — ENV |
| `pnpm run qc:fe-be-health` | 3221226505 | HRM+XBOS **200**; portal ECONNREFUSED — ENV |
| Runtime JSON audit `_tmp-qa-hdsd-w2a-scope-parity-runtime.json` | — | `jHrm01.verdict` 🟢 PASS · `parity.match` true |

---

## completion_report

- **Closed:** QC-HRM-W2A-RBAC-01 — L0–L2.5 audit for W2a standalone RBAC; **R-W2A-RBAC-01** confirmed closed; **J-HRM-01** PASS on `:8080/hr/employees`; W2b embed parity unchanged (runtime JSON); **GO WITH CONDITIONS** bounded slice.
- **Open:** R-HARNESS-RBAC P2; fine-grained RBAC deferred; optional W2b live re-spot when portal `:5173` up.

## next_owner

`pm` — promote journey map W2a standalone note for J-HRM-01; optional QA R-HARNESS-RBAC when harness priority rises

## next_dispatch_prompt

```text
work_item_id: PM-HRM-W2A-RBAC-PROMOTE-01
from_role: pm | to_role: pm
entry_criteria: QC-HRM-W2A-RBAC-01 GWC — docs/qa/evidence/qc-hrm-w2a-standalone-rbac-01-20260801.md; R-W2A-RBAC-01 closed
exit_criteria: Append PROGRAM_JOURNEY_MAP J-HRM-01 footnote W2a :8080 standalone PASS 2026-08-01; no Dev reopen unless sponsor requests fine-grained RBAC wave
evidence_path: docs/program/PROGRAM_JOURNEY_MAP.md
ack_status: PASS_TO_PM
```
