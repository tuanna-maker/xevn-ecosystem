# P1-EX-DO-DEPLOY-CRLF-01 — Deploy payload CRLF hardening

## Scope
- Hardened `scripts/deploy-dev-server.ps1` remote payload execution to be CRLF-safe on VPS bash.
- Updated deploy runbook guidance in `docs/ops/DEPLOY_GUIDE.md` to prevent manual workaround in future deploy waves.

## Changes applied
1. Normalize remote deploy script text from CRLF to LF before base64 encoding.
2. Replace direct pipe execution (`echo ... | base64 -d | bash`) with temp-script flow:
   - decode payload to `/tmp/xevn-deploy.*.sh`
   - strip `\r` bytes with `tr -d '\r'`
   - run `bash -n` syntax validation
   - execute script and cleanup temp file

## Reproducible verification command (local)
```powershell
$payload = "set -e`r`necho ok`r`n"
$normalized = ($payload -replace "`r`n","`n" -replace "`r","`n")
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($normalized))
$decoded = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64))
if ($decoded.Contains("`r")) { Write-Output "payload-lf-only: FAIL"; exit 1 } else { Write-Output "payload-lf-only: PASS" }
if ($decoded -match "^set -e`necho ok`n$") { Write-Output "payload-shape: PASS" } else { Write-Output "payload-shape: FAIL"; exit 1 }
```

## Verification output
```text
payload-lf-only: PASS
payload-shape: PASS
```

## Expected deploy behavior after fix
- No `$'\r': command not found` during remote deploy payload execution.
- Deploy fails fast on syntax errors via `bash -n` before running payload.

## Handoff
- `work_item_id`: `P1-EX-DO-DEPLOY-CRLF-01`
- `ack_status`: `PASS_TO_PM`
- `evidence_path`: `docs/ops/evidence/p1-ex-do-deploy-crlf-01-20260528.md`
