# P1-RESID-C-PILOT-SEED — Tourism mobile + du-lich qual seed on pilot VPS

| Field | Value |
|---|---|
| work_item_id | `P1-RESID-C-PILOT-SEED` |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-30` |
| verified_at_utc | `2026-05-30T10:50:00Z` (approx) |
| pilot_host | `14.225.217.232` |
| pilot_api | `http://14.225.217.232:3001` |
| pilot_https | `https://14-225-217-232.nip.io` |
| account | `du-lich.ceo@xe.vn` / `xevn-pilot` |
| tenant | `xe-du-lich` · HRM company header `main` |
| upstream | `P1-RESID-C03` (J-MOB-03 device GWC — release APK uses pilot API) |
| scope | **Seed only** — no PROD cutover, no compose down |
| ack_status | **READY_FOR_QA** |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| VPS SSH + audit | **PASS** | `xevn-hrm-be-dev` Up; non-xevn containers untouched |
| `seed:tourism:mobile-pilot` | **PASS** | CEO `du-lich.ceo@xe.vn` + 10 staff rows idempotent |
| `seed:hrm:mobile-du-lich-qual` | **PASS** | SEED-MOB: 1 leave, 2 payslips, 1 pending update-request |
| L0 HRM health `:3001` | **PASS** | HTTP **200** local + HTTPS nip.io |
| API probe (external `:3001`) | **PASS** | leave **1**, payslips **2**, pending **1** |
| PROD cutover | **NOT RUN** | Per dispatch — seed-only wave |

---

## Root cause / context

QA `P1-RESID-C-QA-01` closed C-QUAL-03 at **local** API layer but release APK targets **pilot** `:3001`. Pilot DB lacked `SEED-MOB-*` rows → device leave/payslip/pending lists empty (J-MOB-03 GWC).

VPS repo at `/opt/xevn-ecosystem` missing package scripts (`seed:tourism:mobile-pilot`, `seed:hrm:mobile-du-lich-qual`) — scripts synced via `pscp` + `docker cp` into `xevn-hrm-be-dev`.

---

## Steps executed

1. SSH audit — `xevn-hrm-be-dev`, `xevn-hrm-fe-dev` Up; tasmos/asms non-xevn healthy.
2. `pscp` synced to `/opt/xevn-ecosystem`:
   - `scripts/seed-tourism-mobile-pilot.mjs`
   - `scripts/seed-hrm-mobile-du-lich-qual.mjs`
   - `scripts/seed-env-loader.mjs`
   - `scripts/lib/stable-uuid.mjs`
   - `scripts/tmp-p1-resid-c03-probe.mjs`
3. `docker cp` above → `xevn-hrm-be-dev:/app/scripts/…` (container has `pg` module).
4. Run seeds inside container (deploy `.env` loaded by scripts via `deploy/xevn-ecosystem/.env`):

```bash
docker exec xevn-hrm-be-dev sh -lc 'cd /app && node scripts/seed-tourism-mobile-pilot.mjs'
docker exec xevn-hrm-be-dev sh -lc 'cd /app && node scripts/seed-hrm-mobile-du-lich-qual.mjs'
```

5. Post-seed probes:

```bash
# Inside container (localhost)
docker exec -e HRM_API_BASE_URL=http://127.0.0.1:3001 xevn-hrm-be-dev \
  sh -lc 'cd /app && node scripts/tmp-p1-resid-c03-probe.mjs'

# From workstation (release APK API base)
HRM_API_BASE_URL=http://14.225.217.232:3001 node scripts/tmp-p1-resid-c03-probe.mjs
```

6. L0 smoke: `curl http://127.0.0.1:3001/api/hrm/` → **200**; HTTPS nip.io → **200**.

---

## Seed output (qual)

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
  "ids": {
    "leave": "adc8b5c3-6175-46f3-89d3-db941fd8adc8",
    "payslip": "4dc75c64-a628-439e-8e04-7043706bfd88",
    "update_request": "95b9ace8-3aa1-49f7-88c4-f42f12654951"
  }
}
```

---

## API probe (external pilot — matches release APK base URL)

| API | HTTP | total | pass |
|---|---:|---:|:---:|
| `GET /attendance/leave-requests` | 200 | **1** | yes |
| `GET /payroll/payslips` (`company_id=main`) | 200 | **2** | yes |
| `GET /attendance/update-requests?status=pending&manager_employee_id` | 200 | **1** | yes |

JSON: `docs/ops/evidence/p1-resid-c-pilot-seed-probe-20260530.json`

Account: `du-lich.ceo@xe.vn` / `xevn-pilot`

---

## Residual

| ID | Item | Owner |
|---|---|---|
| R1 | **QA device retest** — release APK J-MOB-03 leave list/detail shows ≥1 row | qa |
| R2 | J-MOB-04 payslip tap, J-MOB-05 pending approve on device | qa |
| R3 | VPS `git pull` to land seed scripts in `package.json` (avoid pscp one-off) | devops (next deploy) |
| R4 | Approve POST scope header (`x-company-id` UUID vs `main`) — see QA C-QUAL-03 note | dev-fe / qa |

---

## Handoff packet

```yaml
work_item_id: P1-RESID-C-PILOT-SEED
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
entry_criteria:
  - P1-RESID-C-QA-01 PASS_TO_PM with C-QUAL-03 device GWC (pilot DB empty)
exit_criteria:
  - seed:tourism:mobile-pilot + seed:hrm:mobile-du-lich-qual on pilot VPS exit 0
  - du-lich.ceo probe on :3001 leave>=1 payslips>=1 pending>=1
evidence_path: docs/ops/evidence/p1-resid-c-pilot-seed-20260530.md
journeys:
  - J-MOB-03
  - J-MOB-04
  - J-MOB-05
no_prod_cutover: true
```

---

## QA dispatch hint

Retest **release APK** (pilot API `http://14.225.217.232:3001` or configured base) as `du-lich.ceo@xe.vn` / `xevn-pilot`:

- **J-MOB-03:** Leave tab → ≥1 row → tap detail (not empty GWC).
- **J-MOB-04:** Payslip tab → ≥1 row → detail tap.
- **J-MOB-05:** Pending approvals → ≥1 row → approve flow.

Prior local evidence: `docs/qa/evidence/p1-resid-c-qa-01-20260530.md`, `docs/qa/evidence/p1-resid-c03-20260530.md`.
