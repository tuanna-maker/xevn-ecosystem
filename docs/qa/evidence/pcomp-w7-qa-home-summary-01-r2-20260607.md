# PCOMP-W7-QA-HOME-SUMMARY-01-R2 — nip.io holding slug retest (J-MOB-06/08/09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-QA-HOME-SUMMARY-01-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **generated** | 2026-06-07 |
| **upstream** | `PCOMP-W7-DO-TASKS-SLUG-01` READY_FOR_QA — `docs/qa/evidence/pcomp-w7-do-tasks-slug-01-20260607.md` |
| **defect closed** | **D-W7-HOME-TASKS-SLUG-01** (QA confirm on nip.io) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **target** | `https://14-225-217-232.nip.io` |

---

## Verdict

| Gate | Result |
|------|--------|
| #1 `pnpm run qc:fe-be-health:pilot` | **PASS** exit 0 — 8/8 stack + 13/13 pilot flows |
| #2 `tmp-pcomp-w7-qa-home-summary-01-probe.mjs` @ nip.io | **PASS** exit 0 — `company_id=holding`, all includes `HRM-HOME-200` |
| #3 `tmp-pcomp-w7-qa-hub-04b-probe.mjs` @ nip.io | **PASS** exit 0 — full hub cel=5, who=1, privacy OK |
| #4 J-MOB-06 API (tasks holding) | **PASS** — tasks_total=10, manager_total=2 |
| #4 J-MOB-08 API (celebrations) | **PASS** — celebrations_total=5 (≥2), no birth_year |
| #4 J-MOB-09 API (whos_out) | **PASS** — whos_out_count=1 (≥1) |

**Overall: PASS_TO_PM** — W7 home hub API slice **CLOSED** on nip.io after `PCOMP-W7-BE-TASKS-SLUG-01` deploy; **D-W7-HOME-TASKS-SLUG-01** no longer reproduces.

---

## Environment

| Item | Value |
|------|--------|
| Date | 2026-06-07 |
| nip.io HRM | `https://14-225-217-232.nip.io` |
| Local stack (L0) | hrm `:28001`, xbos `:28002`, portal `:5173` |
| employee_id | `3796d949-4513-45c0-88fa-33030a062b17` |
| company_uuid (login) | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Query company_id | **`holding`** (slug) |

---

## Gate #1 — L0 stack health

```bash
pnpm run qc:fe-be-health:pilot
# exit 0 — ALL PASS
```

---

## Gate #2 — home-summary probe (holding slug)

```bash
node scripts/tmp-pcomp-w7-qa-home-summary-01-probe.mjs
# exit 0 — pass: true
```

| include | HTTP | code | tasks | manager | celebrations | whos_out |
|---------|------|------|-------|---------|--------------|----------|
| `tasks,manager_pending` | 200 | HRM-HOME-200 | 10 | 2 | — | — |
| `celebrations` | 200 | HRM-HOME-200 | — | — | 5 | — |
| `whos_out` | 200 | HRM-HOME-200 | — | — | — | 1 |
| `celebrations,whos_out` | 200 | HRM-HOME-200 | — | — | 5 | 1 |
| `tasks,manager_pending,celebrations,whos_out` | 200 | HRM-HOME-200 | 10 | 2 | 5 | 1 |

JSON: `docs/qa/evidence/pcomp-w7-qa-home-summary-01-probe.json`

---

## Gate #3 — hub-04b probe

```bash
node scripts/tmp-pcomp-w7-qa-hub-04b-probe.mjs
# exit 0 — pass: true
```

| Check | Result |
|-------|--------|
| apiOk | true — HTTP 200 `HRM-HOME-200` |
| privacyOk | true — no `birth_year` / `date_of_birth` year leak |
| seedOk | true — celebrations=5, whos_out=1 |
| viewer_is_birthday_today | true |

JSON: `docs/qa/evidence/pcomp-w7-qa-hub-04b-probe.json`

**Script fix (QA infra):** Prior run exit 2 because probe used `company_id={company_uuid}` instead of slug `holding`. One-line fix in `scripts/tmp-pcomp-w7-qa-hub-04b-probe.mjs` — aligns with mobile client contract; not a product change.

---

## Journeys (L2.5 API layer)

| Journey | Status | Evidence |
|---------|--------|----------|
| J-MOB-06 | **CLOSED (API)** | tasks/manager_pending 200; tasks_total=10 |
| J-MOB-08 | **CLOSED (API)** | celebrations=5, MM-DD shape, privacy clean |
| J-MOB-09 | **CLOSED (API)** | whos_out=1, leave_request_id present |

Prior FAIL (R1): `pcomp-w7-qa-home-summary-01-20260607.md` — HTTP 500 uuid cast on tasks include. **Not reproducible** post `PCOMP-W7-DO-TASKS-SLUG-01`.

---

## Residual / GWC

| Item | Severity | Owner | Notes |
|------|----------|-------|-------|
| qa-device hub UI tap walk (J-MOB-06/08/09) | GWC | qa-device | API closed; device L2.5 optional per QC GWC |
| Local `:28001` tasks holding | info | dev-be | R1 noted local 500; nip.io pilot path is SoT for W7 sign-off |

---

## Handoff

```yaml
completion_report: |
  R2 formal retest after DevOps PCOMP-W7-DO-TASKS-SLUG-01. All five exit criteria PASS:
  qc:fe-be-health:pilot exit 0; home-summary probe exit 0 (holding slug, full hub);
  hub-04b probe exit 0 after script slug fix; J-MOB-06/08/09 API PASS on nip.io.
  D-W7-HOME-TASKS-SLUG-01 CLOSED on pilot.

next_owner: pm

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-QC-HOME-SUMMARY-01-R2
  from_role: pm
  to_role: qc
  entry_criteria: QA PASS_TO_PM PCOMP-W7-QA-HOME-SUMMARY-01-R2 —
  docs/qa/evidence/pcomp-w7-qa-home-summary-01-r2-20260607.md; nip.io holding slug full hub
  HRM-HOME-200; J-MOB-06/08/09 API CLOSED; D-W7-HOME-TASKS-SLUG-01 closed on pilot.
  exit_criteria: Re-gate W7 mobile home hub on nip.io evidence; confirm journey map rows;
  GO or GWC with qa-device device-walk residual only.
  evidence_path: docs/qa/evidence/pcomp-w7-qc-home-summary-01-r2-20260607.md

pm_dispatch_hint: QC PCOMP-W7-QC-HOME-SUMMARY-01-R2

evidence_path: docs/qa/evidence/pcomp-w7-qa-home-summary-01-r2-20260607.md
ack_status: PASS_TO_PM
```
