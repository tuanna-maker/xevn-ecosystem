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

## World-standard test log (U78 / OS 31) — bắt buộc mọi wave

Mọi wave capability / QA cũng cần cặp **OS 31 test-log md+json** (không thay bằng narrative này):

- `docs/qa/evidence/<WI-or-capability>-test-log.md`
- `docs/qa/evidence/<WI-or-capability>-test-log.json` — schema `xevn-test-log/v1`
- SoT: `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` · project pointer: `docs/qa/WORLD_STANDARD_TEST_LOG.md`
- PM dispatch: `test_log_required: true`

## Verdict

- [ ] PASS — QC may set `e2e_pass=true` in `xevn_ecosystem_capabilities`
- [ ] FAIL — defect link
- [ ] Test-log md+json attached (U78)

`evidence_path`: docs/qa/evidence/<capability_code>.md
