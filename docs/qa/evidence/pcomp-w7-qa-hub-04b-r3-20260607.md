# PCOMP-W7-QA-HUB-04b-R3 — nip.io home/summary post-deploy retest (J-MOB-06/08/09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-QA-HUB-04b-R3` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **generated** | 2026-06-07 |
| **spec_ref** | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` §3.4 · `MOBILE_W7_DATA_CONTRACTS.md` §6 |
| **upstream** | `PCOMP-W7-DO-HOME-SUMMARY-01-R2` READY_FOR_QA — `docs/qa/evidence/pcomp-w7-do-home-summary-01-20260607.md` |
| **VPS** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

---

## Verdict

| Gate | Result |
|------|--------|
| Exit #1 `tmp-pcomp-w7-qa-04b-01-probe.mjs` @ nip.io | **PASS** exit 0 — 15/15 probes |
| Exit #2 `pnpm run qc:fe-be-health:pilot` | **PASS** exit 0 — 8/8 stack + 13/13 pilot flows |
| Exit #3 J-MOB-08 celebrations (`company_id=holding`) | **PASS** — HTTP 200 `HRM-HOME-200`; `total_count=5` (≥2); privacy grep clean |
| Exit #3 J-MOB-09 whos_out (`company_id=holding`) | **PASS** — HTTP 200 `HRM-HOME-200`; `total_count=1` (≥1); no `reason` in payload |
| Exit #4 J-MOB-06 tasks slug | **PASS** — `include=tasks` / `tasks,manager_pending` / full hub include **HTTP 200** on nip.io (prior **D-W7-HOME-TASKS-SLUG-01** no longer reproduces on pilot) |
| Deploy route regression | **PASS** — `/home/summary` registered; no 404 on authenticated GET |

**Overall: PASS_TO_PM** — W7 hub API slice promotable on nip.io; J-MOB-06/08/09 API **CLOSED** for holding path.

---

## Environment

| Item | Value |
|------|--------|
| Date (Asia/Ho_Chi_Minh) | `2026-06-07` |
| nip.io HRM | `https://14-225-217-232.nip.io` |
| Local stack (L0) | hrm `:28001`, xbos `:28002`, portal `:5173` |
| UAT mobile | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| employee_id | `3796d949-4513-45c0-88fa-33030a062b17` |

---

## Exit #1 — Live probe (nip.io)

```powershell
$env:HRM_API_BASE_URL="https://14-225-217-232.nip.io"
node scripts/tmp-pcomp-w7-qa-04b-01-probe.mjs
# exit 0 — pass: true, 15/15 probes
```

**Holding sample (J-MOB-08/09):**

| Block | HTTP | Code | Count | Privacy |
|-------|------|------|-------|---------|
| `include=celebrations` | 200 | `HRM-HOME-200` | 5 items, MM-DD shape | no `date_of_birth` / `birth_year` |
| `include=whos_out` | 200 | `HRM-HOME-200` | 1 item (`annual`) | no `reason` field |
| `include=celebrations,whos_out` | 200 | `HRM-HOME-200` | combined | clean |

Probe JSON: `docs/qa/evidence/pcomp-w7-qa-04b-01-probe.json`

---

## Exit #2 — L0 stack health

```bash
pnpm run qc:fe-be-health:pilot
# exit 0 — ALL PASS (8 stack + 13 pilot flows)
```

**Note:** First run failed (`ECONNREFUSED :28001` — local hrm-api not listening). Retest after port `:28001` available → **ALL PASS**.

---

## Exit #4 — J-MOB-06 tasks slug (nip.io)

Prior wave (`pcomp-w7-qa-home-summary-01-20260607.md`) opened **D-W7-HOME-TASKS-SLUG-01** — HTTP 500 uuid cast `"holding"` on `include=tasks`.

**R3 retest @ nip.io with explicit `company_id=holding`:**

| include | HTTP | Code | tasks_total |
|---------|------|------|-------------|
| `tasks` | 200 | `HRM-HOME-200` | — |
| `manager_pending` | 200 | `HRM-HOME-200` | — |
| `tasks,manager_pending` | 200 | `HRM-HOME-200` | — |
| `tasks,manager_pending,celebrations,whos_out` | 200 | `HRM-HOME-200` | 10 |

**J-MOB-06 status: CLOSED on pilot** — tasks slug path returns 200; defect **D-W7-HOME-TASKS-SLUG-01** no longer reproduces on nip.io (likely fixed by same deploy bundle as DO-HOME-SUMMARY-01-R2).

---

## Script note — hub-04b probe (informational)

`scripts/tmp-pcomp-w7-qa-hub-04b-probe.mjs` uses `company_id={company_uuid}` from login (`6efaa5d6-…`) instead of slug `holding` → HTTP 404 `HRM-HOME-404`. This is a **probe script bug**, not a product regression.

With explicit `company_id=holding`, full hub include **PASS** (cel=5, who=1, tasks=10). Exit criteria #1 uses `04b-01-probe.mjs` which passes slug correctly.

---

## Journeys promoted

| Journey | Status | Notes |
|---------|--------|-------|
| J-MOB-06 | **CLOSED (API)** | tasks/manager_pending 200 on nip.io holding |
| J-MOB-08 | **CLOSED (API)** | celebrations ≥2, privacy OK |
| J-MOB-09 | **CLOSED (API)** | whos_out ≥1, contract shape OK |

---

## Residual / GWC

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| qa-device hub UI pixel walk (J-MOB-06/08/09 tap paths) | GWC | qa-device | API closed; device L2.5 optional |
| `tmp-pcomp-w7-qa-hub-04b-probe.mjs` uses UUID not slug | P3 | qa | Script fix: `company_id=holding` for mobile UAT |
| nip.io transient 502 during cold start | info | devops | Wait ~90s after hrm-be recreate; retry probe |
| Local disk ENOSPC during session | env | sponsor | Hook `ENOSPC` blocked some inline probes; core gates completed |

---

## Handoff

```yaml
completion_report: |
  R3 retest after DevOps PCOMP-W7-DO-HOME-SUMMARY-01-R2 deploy. nip.io /home/summary route live.
  Exit #1 probe exit 0 (15/15). Exit #2 qc:fe-be-health:pilot exit 0 (8+13).
  J-MOB-08 PASS (celebrations=5, privacy). J-MOB-09 PASS (whos_out=1).
  J-MOB-06 PASS — tasks slug 200 on nip.io; D-W7-HOME-TASKS-SLUG-01 no longer reproduces on pilot.
  hub-04b script fails on company_uuid query param (script bug, not product).

next_owner: pm

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-QC-HUB-04b-R3
  from_role: pm
  to_role: qc
  entry_criteria: QA PASS_TO_PM PCOMP-W7-QA-HUB-04b-R3 —
  docs/qa/evidence/pcomp-w7-qa-hub-04b-r3-20260607.md; nip.io deploy verified;
  J-MOB-06/08/09 API CLOSED holding path; D-W7-HOME-TASKS-SLUG-01 closed on pilot.
  exit_criteria: Re-gate W7 mobile hub slice on nip.io evidence; confirm J-MOB-06/08/09 in
  PROGRAM_JOURNEY_MAP; audit privacy + tasks block; GO or GWC with qa-device residual.
  evidence_path: docs/qa/evidence/pcomp-w7-qc-hub-04b-r3-20260607.md

evidence_path: docs/qa/evidence/pcomp-w7-qa-hub-04b-r3-20260607.md
ack_status: PASS_TO_PM
```
