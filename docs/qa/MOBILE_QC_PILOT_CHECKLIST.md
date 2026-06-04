# QC pilot Go/No-Go — MOB-QC-01

## P0.5 gate

- [ ] MOB-103 login (no internal key on release build)
- [ ] MOB-101 leave list for employee scope
- [ ] MOB-104 update request detail
- [ ] MOB-105 error messages Vietnamese for known codes

## P1 gate

- [ ] MOB-102 manager menu hidden for employee role
- [ ] MOB-201 inbox mark read
- [ ] MOB-202 payslip drill-down
- [ ] MOB-301 manager sees only direct reports (seed NV001 → manager NV002)

## Evidence

- `node scripts/mobile-hrm-smoke.mjs`
- `docs/qa/MOBILE_TRACEABILITY.md`
- Screenshots under `docs/qa/evidence/mobile/` (optional)

**Residual risk:** geofence uses pilot work site seed; production sites require MOB-BE-06 data entry.
