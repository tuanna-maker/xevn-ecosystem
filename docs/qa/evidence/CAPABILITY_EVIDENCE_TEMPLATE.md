# Capability E2E evidence template

`capability_code`:  
`tested_by`:  
`tested_at` (ISO):  

## Environment

- xbos-api: port / commit
- hrm-api: port / commit
- `pnpm seed:stack:p0` + `pnpm seed:workflow:inbox` (if inbox)

## Happy path

1. UI steps (click → network 2xx)
2. DB read-back (SQL or GET list)

## Empty / API down

- Empty seed: message shown, no mock row when `VITE_ALLOW_MOCK_FALLBACK=false`
- API stopped: actionable banner

## Verdict

- [ ] PASS — QC may set `e2e_pass=true` in `xevn_ecosystem_capabilities`
- [ ] FAIL — defect link

`evidence_path`: docs/qa/evidence/<capability_code>.md
