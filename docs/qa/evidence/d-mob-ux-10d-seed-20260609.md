# D-MOB-UX-10d-01 — Attendance pill seed + API verify @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-UX-10d-01` |
| **from_role** | `devops` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |

---

## Executive verdict

**READY_FOR_QA** — Pilot HRM DB seeded with present / late-proxy (pending+check_in) / absent rows for `uat.nv0001@xe.vn` within 14-day window. `GET /api/hrm/attendance/records` @ `https://14-225-217-232.nip.io` with mobile `company_uuid` returns **total=12** (≥3). Pill mix confirmed: `present`, `pending` (maps Đi muộn), `absent`.

---

## Root cause (pre-seed)

MOB-UX-10d-QA GWC: mobile history query uses `company_uuid` on `company_id` param; `listRecords` scope resolved UUID as employee `company_id` slug → workforce filter matched 0 employees → **total=0** despite DB rows. Fixed via `normalizePayrollListCompanyId` in `attendance.service.ts` (same pattern as payroll). Deployed to VPS `hrm-be`.

---

## Seed script

| Item | Value |
|------|-------|
| Script | `scripts/seed-hrm-uat-mob-attendance-pills.mjs` |
| pnpm | `pnpm run seed:hrm:uat-mob-attendance-pills` |
| seed_tag | `SEED-MOB-UX-10d-ATT` |
| Idempotent | stable UUID per employee+date+status |

### Rows inserted (MOB-UX-10d pill mix)

| Date | status | Mobile pill |
|------|--------|-------------|
| 2026-06-05 | `present` | Đúng giờ |
| 2026-06-01 | `pending` + check_in | Đi muộn |
| 2026-05-29 | `absent` | Vắng mặt |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run seed:hrm:uat-mob-attendance-pills` | **0** | `attendance_total_14d=6` pre-probe; 3 MOB-UX-10d rows upserted |
| VPS pscp `attendance.service.ts` + `docker compose up -d --build hrm-be` | **0** | `hrm_metrics=200` |
| `node scripts/tmp-d-mob-ux-10d-attendance-probe.mjs` @ nip.io | **0** | `total=12`, `probe=PASS` |

---

## API verify (mobile path)

```json
{
  "email": "uat.nv0001@xe.vn",
  "employee_id": "3796d949-4513-45c0-88fa-33030a062b17",
  "company_uuid": "6efaa5d6-a4a8-4bfd-805a-3c4f003e4013",
  "http_status": 200,
  "code": "HRM-ATT-200",
  "total": 12,
  "statuses_in_window": ["present", "pending", "absent", "…"]
}
```

---

## QA retest scope (qa-device)

- **J-MOB-35 only** — Chấm công → Lịch sử → verify colored pills match API rows
- Account: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io
- APK SHA: `DD5606E5DFFE928125AB2E95F77184C22E521C3CB0545DC27464895451477D26`
- Expect: `attendance-timeline-badge` visible; labels Đúng giờ / Đi muộn / Vắng mặt

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | BE scope fix + seed script uncommitted on `main` — VPS hot-sync only | `dev-be` / PM merge |
| R2 | `pnpm --filter hrm-api test` attendance.service.spec.ts PASS locally; full regression on merge | `qa` |

---

## Handoff

**completion_report:** D-MOB-UX-10d-01 closed — new idempotent seed `seed-hrm-uat-mob-attendance-pills`; pilot DB has present/pending/absent mix for UAT0001; nip.io API `total=12` on mobile UUID query after `normalizePayrollListCompanyId` hotfix deployed to `hrm-be`.

**next_owner:** `qa-device`

**next_dispatch_prompt:** Operate as qa-device per `.cursor/agents/qa-device.md`. work_item_id `MOB-UX-10d-QA-R2` (pill visual only). entry: seed evidence `docs/qa/evidence/d-mob-ux-10d-seed-20260609.md`; API probe PASS `total>=3`; APK `hrm-mobile-qa-device.apk` SHA `DD5606E5…477D26`. exit: J-MOB-35 — Tab Chấm công → Lịch sử → verify colored pills (Đúng giờ/Đi muộn/Vắng mặt) + `attendance-timeline-badge` for `uat.nv0001@xe.vn` @ nip.io; adb pm clear before install. ack_status PASS_TO_PM or FAIL with screenshot.

**evidence_path:** `docs/qa/evidence/d-mob-ux-10d-seed-20260609.md`

**ack_status:** `READY_FOR_QA`
