# D-MOB-UX-10d-API-QC — Attendance UUID scope API gate + program slice close @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-UX-10d-API-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **D-MOB-UX-10d program slice API + device CLOSED** @ nip.io |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — D-MOB-UX-10d API + device consolidation)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-UX-10d** attendance list API (`company_uuid` + ESS 14d window) → `total=12` with present/pending/absent mix | Phase 1 DONE / `verify:product:completion` program exit |
| **J-HRM-06** attendance get-by-id scope parity (list ↔ detail, same `company_uuid`) | PROD cutover / store release |
| **J-MOB-35** device pills — prior QC CLOSED, cited not re-run | **J-MOB-32** MOB-UX-10a QC gate (QA PASS, QC pending) |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io | Full adb device rerun this API wave |
| BE merge `normalizePayrollListCompanyId` on attendance list/get-by-id | Row tap → day detail (R-UX-10d-02 Phase 2) |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-BE merge | [`d-mob-ux-10d-be-merge-20260609.md`](d-mob-ux-10d-be-merge-20260609.md) | READY_FOR_QA — jest **50/50**; scope parity list↔get-by-id |
| DevOps seed | [`d-mob-ux-10d-seed-20260609.md`](d-mob-ux-10d-seed-20260609.md) | PASS — `total=12` mix @ nip.io |
| QA API retest | [`d-mob-ux-10d-qa-20260609.md`](d-mob-ux-10d-qa-20260609.md) | PASS_TO_PM — L1 + scope parity |
| Device J-MOB-35 (prior) | [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md) | GO GWC — **J-MOB-35 device CLOSED** same session |
| Probe script | `scripts/tmp-d-mob-ux-10d-attendance-probe.mjs` | exit **0** — total=12, mix PASS |

**Environment:** `https://14-225-217-232.nip.io` (local `:28001`/`:28002`/`:5173` down — L0 pilot fallback per QA)

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-mob-ux-10d-qa-20260609.md
# exit 1 — 3/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id, portal_url, crud_or_matrix
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile/API slice class as [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md):

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` | **Format** — table uses `**work_item_id**` not `work_item_id:` colon form |
| `portal_url` | **N/A mobile API** — `api_base` `https://14-225-217-232.nip.io` documented; no portal UI in wave |
| `crud_or_matrix` | **N/A read-only slice** — attendance list + get-by-id R probes; no C/U/D in wave |

Material pack present: L0/L1 tables, J-* journey section, get-by-id scope parity table (3 seed rows), command exit codes, `## Residual`, valid handoff — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Local stack ECONNREFUSED `:28001`/`:28002`/`:5173` | ENV | **PASS** — nip.io pilot fallback documented |
| nip.io HRM `/api/hrm/` + portal `/` **200** | ENV | **PASS** |
| Mobile login `HRM-AUTH-200` + token issued | ENV / L1 | **PASS** |
| List ESS query `total=12` present/pending/absent mix | PRODUCT / L1 | **PASS** — matches mobile `AttendanceHistoryScreen.tsx` contract |
| Get-by-id present/pending/absent seed IDs → **200** `HRM-ATT-200` | PRODUCT / scope parity | **PASS** — no 404 |
| Literal dispatch query without `employee_id` → company rollup | PRODUCT / contract | **INFO** — **R3** mobile always sends `employee_id` + 14d window |
| **J-MOB-35** device pills | PRODUCT / L2.5 | **PASS** — prior QC CLOSED; API `total=12` corroborates data source |
| BE merge + seed uncommitted on `main` | Process / merge | **CARRY** — **R1**; nip.io probes PASS post hotfix |
| VPS image may lag repo | Process / deploy | **CARRY** — **R2** monitor next devops rebuild |

**Product NO-GO avoided:** API slice materially verified; device slice independently CLOSED same day.

---

## L1 + L2.5 — Journey audit

### Primary — D-MOB-UX-10d API wave

| Journey | Requirement | QA | QC cross-check | QC verdict |
|---------|-------------|-----|----------------|------------|
| **J-MOB-UX-10d** | Mobile attendance list with `company_uuid` → mix pills data | PASS L1 | Probe exit 0; total=12; statuses `present/pending/absent` | **PASS — API CLOSED** |
| **J-HRM-06** | Get-by-id scope parity same `company_uuid` | PASS L1 | 3 seed rows 200 not 404 | **PASS — scope parity CLOSED** |

### Device — cited (not re-run)

| Journey | Prior QC | This wave | QC verdict |
|---------|----------|-----------|------------|
| **J-MOB-35** | [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md) GO GWC | API corroboration only; APK SHA on disk | **PASS — device CLOSED (cited)** |

### Deferred (program)

| Journey | State | QC ruling |
|---------|-------|-----------|
| **J-MOB-32** | MOB-UX-10a QA PASS; QC pending | **DEFERRED** — separate MOB-UX-10a-QC dispatch |

---

## Defect / condition adjudication

| ID | Severity | Class | QA state | QC ruling |
|----|----------|-------|----------|-----------|
| **R1** | P1 | Merge | QA residual | **CARRY** — BE scope fix + seed script uncommitted; not blocking tested nip.io slice |
| **R2** | INFO | Deploy | QA residual | **CARRY** — devops rebuild optional; nip.io PASS post hotfix |
| **R3** | INFO | Doc | QA residual | **ACCEPTED** — literal query without `employee_id` not mobile contract |
| **R1** (device) | INFO | Process | Prior QC | **CARRY** — automation scroll-before-assert from MOB-UX-10d-QC |
| **R-UX-10d-02** | P2 | Scope | Dev defer | **ACCEPTED** — row tap day detail Phase 2 |

No P0/P1 product blockers for D-MOB-UX-10d program slice closure.

---

## Journey map sync (confirmed)

`PROGRAM_JOURNEY_MAP.md` row **J-MOB-31..35**:

- **J-MOB-35** — **✅ device CLOSED** MOB-UX-10d — [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md)
- **J-MOB-UX-10d / J-HRM-06 API** — **✅ API CLOSED** — this QC file
- **J-MOB-32** — MOB-UX-10a QA PASS; **QC pending**

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **D-MOB-UX-10d program slice promotable** nip.io (API + device) |
| **GO (scoped)** | **J-MOB-UX-10d** attendance API **CLOSED** |
| | **J-HRM-06** get-by-id scope parity **CLOSED** |
| | **J-MOB-35** device pills **CLOSED** (prior QC + API corroboration) |
| **CARRY** | **R1** merge to `main` · **R2** devops rebuild monitor · **R3** doc contract note · **J-MOB-32** MOB-UX-10a QC |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside D-MOB-UX-10d closure)

| ID | Owner | Trigger |
|----|-------|---------|
| **R1** | dev-be / pm | Merge `normalizePayrollListCompanyId` attendance path + `seed-hrm-uat-mob-attendance-pills` when sponsor requests commit |
| **R2** | devops | Rebuild nip.io image on next deploy wave |
| **MOB-UX-10a-QC** | pm → qc | J-MOB-32 carousel QC gate |
| **C-W8QC-PACK-02** | qa | Normalize mobile/API pack format (`work_item_id:` colon, `portal_url`/`api_base`) |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Promise snackbar/font — expiry 2026-06-14 |

---

## Handoff

**completion_report:** D-MOB-UX-10d-API-QC **GO WITH CONDITIONS (reduced)**. Audited BE merge + seed + QA API retest chain. Pack verify **3/8** process-only (mobile API slice N/A fields). QA L1 PASS: mobile login OK; ESS attendance list `total=12` with present/pending/absent mix; get-by-id scope parity **200** for present/pending/absent seed rows (no 404). Device **J-MOB-35** independently CLOSED via [`qc-mob-ux-10d-20260609.md`](qc-mob-ux-10d-20260609.md); API wave corroborates pill data source. **D-MOB-UX-10d program slice API + device CLOSED.** Carry R1 uncommitted merge, R2 deploy monitor. No P0/P1 product blockers.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake D-MOB-UX-10d-API-QC PASS_TO_PM (GO WITH CONDITIONS reduced).

Closed: D-MOB-UX-10d program slice — J-MOB-UX-10d API + J-HRM-06 scope parity + J-MOB-35 device (cited) @ nip.io.
Evidence: docs/qa/evidence/qc-d-mob-ux-10d-api-20260609.md

Actions:
1) Mark D-MOB-UX-10d [x] in PHASE1_PRODUCT_COMPLETION_TODO / sprint backlog / journey map API cite.
2) Dispatch qc MOB-UX-10a-QC — J-MOB-32 action carousel (QA PASS docs/qa/evidence/mob-ux-10a-qa-device-20260609.md) if next P0 from pm:scan:backlog.
3) Schedule dev-be merge track R1 when sponsor requests commit (d-mob-ux-10d-be-merge-20260609.md).

Carry: R1 merge, R2 devops rebuild, C-W8QC-PACK-02, D-W8-ESS-PROMISE-01, J-MOB-32 QC pending. NOT Phase 1 DONE / NOT PROD.
```

**evidence_path:** `docs/qa/evidence/qc-d-mob-ux-10d-api-20260609.md`

**ack_status:** `PASS_TO_PM`
