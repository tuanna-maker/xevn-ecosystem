# P1-G3-G6-ECOSYSTEM-R2 — Phase 1 gates G3 + G6 ecosystem regression

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-G3-G6-ECOSYSTEM-R2` |
| **from_role** | `pm` |
| **to_role** | `qa` → `pm` |
| **date** | 2026-06-09 |
| **primary_env** | `https://14-225-217-232.nip.io` |
| **local_env** | `127.0.0.1:28001/28002`, portal `:5173` (stack up during L0–L2 window) |
| **portal account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **mobile personas** | `uat.nv0001@xe.vn`, `uat.nv0002@xe.vn` / `xevn-uat-2026` |
| **ack_status** | **FAIL_TO_PM** |

---

## Executive verdict

| Gate | Scope | Pilot (nip.io) | Local | Gate status |
|------|-------|----------------|-------|-------------|
| **L0** | `qc:dev-stack` | HRM/XBOS 200 (via parity probes) | **exit 0** | **PASS** |
| **L1** | `test:system:uat` | N/A (local runner) | **37/0 exit 0** | **PASS** — G2 closed |
| **G3 L2** | P-CC-01..09 @ ceo | **23/23** | **13/13** `test:pilot:flows` + **8/8** `qc:fe-be-health` | **PASS** |
| **G3 L2.5** | J-HRM-01..07 | **7/7** | **4/7** (`tmp-p1-w6-qa-memcc-probe`) | **PASS pilot** · **GWC local** |
| **G6** | MOB-PARITY-01-R2 (20 routes) | **25/32 probes** · P0 slug **CLOSED** | same probe @ nip.io | **GWC** — 0 P0 · 5 field/label · 1 probe defect |

**Overall: FAIL_TO_PM** — G3 promotable on nip.io (L2 + J-HRM closed); G6 P0 slug class closed post `D-MOB-PARITY-LEAVE-SLUG-01` deploy; residual GWC field contracts + probe MP-19 param + local J-HRM-05..07 block full G3/G6 strict closure.

---

## 1. L0 — `pnpm run qc:dev-stack`

**Exit:** `0`

```
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173
```

**nip.io:** `GET /api/hrm/` → 200 `HRM-HEALTH-200` (MOB-PARITY probe env block).

---

## 2. L1 — `pnpm run test:system:uat`

**Exit:** `0` · **Verdict: PASS** · **37 PASS / 0 FAIL / 0 SKIP**

Report: `docs/qa/evidence/system-integration-uat-report.json` (`started_at: 2026-06-09T07:46:20Z`).

---

## 3. G3 L2 — P-CC-* @ `ceo@xe.vn`

### Local (`test:pilot:flows` + `qc:fe-be-health`)

| Command | Result |
|---------|--------|
| `qc:fe-be-health` | **8/8 PASS** — direct + proxy HRM employees/catalog-sync |
| `test:pilot:flows` | **13/13 PASS** — P-CC-01..09 (P-CC-09b skipped empty inbox) |

### Pilot nip.io (`tmp-p1-ex-qa-https-01-probe.mjs`)

**Exit:** `0` · **23/23 L2 PASS**

| ID | Verdict |
|----|---------|
| P-CC-01..09 | **PASS** — login, tenant, employees, catalogs, contracts, KPI rollup, insurance, recruitment, attendance, payroll, catalog-governance inbox |
| J-CC-03 | **PASS** — KPI rollup `companyId=holding` + `x-company-id: main` |
| member negative | **PASS** — `du-lich.ceo@xe.vn` → 409 scope (expected) |

---

## 4. G3 L2.5 — J-HRM-01..07

### Pilot nip.io — **7/7 PASS**

| J-ID | Surrogate | HTTP | Verdict |
|------|-----------|------|---------|
| J-HRM-01 | contracts → employee | 200 | **PASS** |
| J-HRM-02 | employees list → detail | 200 | **PASS** |
| J-HRM-03 | contract detail | 200 | **PASS** |
| J-HRM-04 | insurance → employee | 200 | **PASS** |
| J-HRM-05 | recruitment requisition | 200 | **PASS** |
| J-HRM-06 | attendance → employee | 200 | **PASS** |
| J-HRM-07 | payroll → employee | 200 | **PASS** |

### Local (`tmp-p1-w6-qa-memcc-probe.mjs` @ `:5173`) — **4/7 PASS**

| J-ID | Result | Note |
|------|--------|------|
| J-HRM-01..04 | **PASS** | scope parity list→detail 200 |
| J-HRM-05 | **FAIL** | `recruitment/candidates` **500** (requisitions 200) |
| J-HRM-06 | **FAIL** | attendance row → `GET /employees/:id` **500** |
| J-HRM-07 | **FAIL** | payroll row → `GET /employees/:id` **500** |

**Tag:** `scope_parity` local seed/FK — **not reproduced on nip.io pilot**.

---

## 5. G6 — MOB-PARITY-01-R2 (20-route matrix)

**Script:** `scripts/tmp-mob-parity-01-probe.mjs` @ nip.io  
**Exit:** `1` · **25/32 probes PASS** · **7 gaps**

### P0 regression — slug UUID class (**CLOSED** post BE deploy)

Dedicated probe `tmp-d-mob-parity-leave-slug-01-probe.mjs` @ nip.io: **4/4 PASS**

| Probe | Status | Code |
|-------|--------|------|
| leave-requests `company_id=holding` | 200 | HRM-LEAVE-200 |
| leave-requests `company_id=<uuid>` | 200 | HRM-LEAVE-200 |
| notifications/inbox `company_id=holding` + `limit=5` | 200 | HRM-NOTIF-200 |
| notifications/inbox `company_id=<uuid>` | 200 | HRM-NOTIF-200 |

**MP-08** leave-requests: **PASS** both personas (was P0 500 pre-deploy).

### Remaining gaps (reclassified)

| ID | Probe gap | Class | QA assessment |
|----|-----------|-------|---------------|
| MP-01 | `job_title` missing; API has `job_title_key` | **GWC** | Field contract drift — mobile directory mapping |
| MP-11 | performance cycles 400 @ ceo | **GWC** | Web-only CEO surface; mobile stub |
| MP-14 | `request_type` missing (API uses `type`) | **GWC** | Documented ESS relabel |
| MP-16 | catalog_key label Quy trình≠Hành trình | **GWC** | Documented `labelGap` |
| MP-17 | home/summary 400 @ ceo w/o `employee_id` | **GWC** | Mobile ESS only |
| MP-19 | inbox 400 with `page_size=5` | **PROBE DEFECT** | API requires `limit` — **200** with `limit=5` (product OK) |

**Diagnostic:**

```
page_size=5 → notifications/inbox → 400 HRM-VAL-001
limit=5     → notifications/inbox → 200 HRM-NOTIF-200
```

### Matrix score (effective)

| Class | Count |
|-------|-------|
| **PASS** | 17 routes functional |
| **GWC** | 5 (MP-01, 11, 14, 16, 17) |
| **P0** | **0** (MP-08 closed; MP-19 false negative) |
| **Probe fix** | 1 (MP-19 param) |

Artifact: `docs/qa/evidence/mob-parity-01-20260609-probe.json` (`generatedAt: 2026-06-09T07:46:52Z`).

---

## 6. Gate closure assessment

| Gate | Prior | This wave | Decision |
|------|-------|-----------|----------|
| **G3** | Partial GWC | L2 **PASS** both envs; J-HRM **7/7 nip.io**; local J-HRM **4/7** | **CLOSED pilot** · GWC local J-HRM-05..07 |
| **G6** | OPEN | P0 slug **CLOSED**; 5 GWC field/label | **GWC** — not strict CLOSED until field contracts + probe fix |

---

## 7. Residual / PM dispatch

| Priority | work_item_id | Owner | Issue |
|----------|--------------|-------|-------|
| P1 | `P1-G6-FIELD-01` | dev-be | MP-01 directory: expose `job_title` alias or document `job_title_key` for mobile |
| P1 | `P1-G6-PROBE-01` | qa | `tmp-mob-parity-01-probe.mjs` MP-19: `page_size` → `limit` |
| P2 | `P1-G3-LOCAL-JHRM-01` | dev-be | Local `recruitment/candidates` 500 + employee GET 500 from att/payroll FK rows |
| P2 | `P1-G6-FIELD-02` | dev-be | MP-14 service-requests: `request_type` alias or mobile consume `type` |

---

## completion_report

**Closed:** L0 local · L1 37/37 · G3 L2 P-CC 13/13 local + 23/23 nip.io · G3 L2.5 J-HRM 7/7 nip.io · G6 P0 slug UUID (MP-08 leave + notifications with correct params).

**Open:** G6 GWC field contracts (MP-01, 14, 16, 11, 17) · MOB-PARITY probe MP-19 param defect · local J-HRM-05..07 (candidates 500, employee detail 500).

## next_owner

`pm` → dispatch `dev-be` (`P1-G6-FIELD-01`) + `qa` (`P1-G6-PROBE-01`); optional `dev-be` `P1-G3-LOCAL-JHRM-01` if local parity required before QC.

## next_dispatch_prompt

```
work_item_id: P1-G6-FIELD-01
from_role: pm
to_role: dev-be
entry_criteria: MOB-PARITY-01-R2 FAIL — MP-01 directory probe expects job_title; API returns job_title_key only. MP-14 service-requests missing request_type (API field type). Evidence: docs/qa/evidence/p1-g3-g6-ecosystem-r2-20260609.md §5.
exit_criteria: nip.io GET /employees?view=directory returns job_title or job_title_key documented in OpenAPI; GET /operations/service-requests row includes request_type alias OR mobile mapping updated; READY_FOR_QA MOB-PARITY-01-R3.
evidence_path: docs/qa/evidence/p1-g3-g6-ecosystem-r2-20260609.md
ack_status: READY_FOR_QA
```

## pm_dispatch_hint

`P1-G6-FIELD-01` dev-be MP-01/MP-14 field aliases · `P1-G6-PROBE-01` qa fix MP-19 limit param · G3 pilot **CLOSED** on nip.io — do not block on local J-HRM-05..07 unless sponsor requires localhost parity.

## evidence_path

`docs/qa/evidence/p1-g3-g6-ecosystem-r2-20260609.md`
