# P1-RESID-C-PILOT-RESEED — Restore du-lich pending approval on pilot VPS

| Field | Value |
|---|---|
| work_item_id | `P1-RESID-C-PILOT-RESEED` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-30` |
| pilot_host | `14.225.217.232` |
| pilot_api | `http://14.225.217.232:3001` |
| account | `du-lich.ceo@xe.vn` / `xevn-pilot` |
| tenant | `xe-du-lich` · HRM company header `main` |
| upstream | `P1-RESID-C-QA-02` — approve POST consumed SEED-MOB pending row |
| scope | **Re-seed only** — no compose down, no PROD cutover |
| ack_status | **READY_FOR_QA** |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| VPS SSH + audit | **PASS** | `xevn-hrm-be-dev` Up 14h; non-xevn untouched |
| `seed:hrm:mobile-du-lich-qual` | **PASS** | Idempotent ON CONFLICT reset pending → **1** |
| `seed:tourism:mobile-pilot` | **SKIPPED** | CEO + HR employees present; qual seed exit 0 |
| L0 HRM health `:3001` | **PASS** | HTTP **200** |
| API probe (external `:3001`) | **PASS** | leave **1**, payslips **2**, pending **1** |

---

## Root cause / context

QA `P1-RESID-C-QA-02` approved `SEED-MOB-AUR-01` via `POST /attendance/update-requests/{id}/approve` → pending count dropped to **0**. Device J-MOB-05 retest and optional approve UI need a fresh pending row on pilot DB.

Prior seed evidence: `docs/ops/evidence/p1-resid-c-pilot-seed-20260530.md` · QA consume: `docs/qa/evidence/p1-resid-c-qa-02-20260530.md`.

---

## Steps executed

1. SSH audit — `xevn-hrm-be-dev`, `xevn-hrm-fe-dev` Up; tasmos/asms non-xevn healthy.

2. Re-run qual seed inside container (scripts already synced from prior wave):

```bash
docker exec xevn-hrm-be-dev sh -lc 'cd /app && node scripts/seed-hrm-mobile-du-lich-qual.mjs'
```

3. Post-seed probe (workstation — release APK API base):

```powershell
$env:HRM_API_BASE_URL="http://14.225.217.232:3001"
node scripts/tmp-p1-resid-c03-probe.mjs
# exit 0
```

4. L0 smoke: `curl http://127.0.0.1:3001/api/hrm/` on VPS → **200**.

---

## Seed output (qual re-run)

```json
{
  "work_item_id": "P1-RESID-C03",
  "seed_tag": "SEED-MOB",
  "tenant": "xe-du-lich",
  "ceo_email": "du-lich.ceo@xe.vn",
  "ceo_employee_id": "c4d59b81-b7ce-4e75-8c6d-856d5acfd02c",
  "company_uuid": "7b626710-02eb-4a39-89c5-e9a90ecc74ff",
  "ceo_leaves": 1,
  "ceo_payslips": 2,
  "pending_update_requests": 1,
  "hr_reports_to_ceo": 1,
  "ids": {
    "leave": "adc8b5c3-6175-46f3-89d3-db941fd8adc8",
    "payslip": "4dc75c64-a628-439e-8e04-7043706bfd88",
    "update_request": "95b9ace8-3aa1-49f7-88c4-f42f12654951"
  }
}
```

---

## API probe (external pilot)

| API | HTTP | total | pass |
|---|---:|---:|:---:|
| `GET /attendance/leave-requests` | 200 | **1** | yes |
| `GET /payroll/payslips` (`company_id=main`) | 200 | **2** | yes |
| `GET /attendance/update-requests?status=pending&manager_employee_id` | 200 | **1** | yes |

JSON: `docs/ops/evidence/p1-resid-c-pilot-reseed-probe-20260530.json`

Account: `du-lich.ceo@xe.vn` / `xevn-pilot`

---

## Residual

| ID | Item | Owner |
|---|---|---|
| R1 | QA device retest J-MOB-05 pending row + approve UI (adb when available) | qa |
| R2 | Re-seed again if QA re-runs approve POST on same row | devops |
| R3 | VPS `git pull` to land seed scripts in `package.json` (avoid pscp one-off) | devops (next deploy) |

---

## Handoff packet

```yaml
work_item_id: P1-RESID-C-PILOT-RESEED
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
entry_criteria:
  - P1-RESID-C-QA-02 PASS_TO_PM with pending=0 after approve consume
exit_criteria:
  - seed:hrm:mobile-du-lich-qual on pilot VPS exit 0
  - du-lich.ceo probe on :3001 pending>=1 (leave>=1 payslips>=1)
evidence_path: docs/ops/evidence/p1-resid-c-pilot-reseed-20260530.md
journeys:
  - J-MOB-05
no_prod_cutover: true
```

---

## QA dispatch hint

Retest pilot API or release APK as `du-lich.ceo@xe.vn` / `xevn-pilot`:

- **J-MOB-05:** Pending approvals → **≥1 row** → optional approve POST with `x-company-id: 7b626710-02eb-4a39-89c5-e9a90ecc74ff`.
- If device adb available: row tap + approve UI on release APK (`docs/qa/evidence/p1-resid-c-qa-02-20260530.md` GWC).

Prior QA evidence: `docs/qa/evidence/p1-resid-c-qa-02-20260530.md`.
