# VPS-DEPLOY-SCOPE-01 — Retry evidence (2026-05-22)

| Step | Result | Notes |
|------|--------|-------|
| `deploy/.vps-ssh.env` | **PASS** | File present; `VPS_SSH_PASSWORD` set (value not logged) |
| `Test-NetConnection 14.225.217.232:22` | **FAIL** | `SSH22=False` from Cursor agent shell |
| `pnpm run deploy:dev-server -- -SkipCommit -SkipPush` | **BLOCKED-NETWORK** | plink: `FATAL ERROR: Network error: Connection timed out` |
| VPS git pull / compose / smoke | **NOT RUN** | Requires SSH from host with VPS egress |
| External HTTP smoke (agent) | **NOT RUN** | Same network block as SSH |

## Classification

**BLOCKED-NETWORK** — credentials ready (path A); Cursor/agent runner cannot reach `14.225.217.232:22`. Deploy and VPS smoke must run from **operator PowerShell** (or VPS console) on a network path that already works with PuTTY.

## Commands attempted (no secrets)

```powershell
# Repo root (Windows)
Test-Path deploy\.vps-ssh.env                    # True
# VPS_SSH_PASSWORD loaded by script — not echoed

Test-NetConnection -ComputerName 14.225.217.232 -Port 22
# TcpTestSucceeded = False

pnpm run deploy:dev-server -- -SkipCommit -SkipPush
# [deploy] Deploying on VPS (root@14.225.217.232)...
# plink.exe : FATAL ERROR: Network error: Connection timed out
# exit 1
```

## Operator command — full deploy (external PowerShell)

Run from repo root on a machine where PuTTY/SSH to the VPS works (same network as prior successful PuTTY sessions):

```powershell
cd "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem"
# Ensure deploy\.vps-ssh.env has real VPS_SSH_PASSWORD (gitignored — do not commit)
pnpm run deploy:dev-server -- -SkipCommit -SkipPush
```

**PASS criteria after script completes:** log lines `[deploy] smoke :3001/` and `:8088/` with HTTP 200 (or 302 for 8080 SPA); `[deploy] HEAD=<short-sha>`; no plink timeout.

## Operator command — scope-minimal (hrm-be + xbos-be only)

Per `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md` §2–4. Option A: SSH to VPS and paste bash. Option B: plink one-liner (password from env file loaded by your session — do not paste password in chat):

```powershell
$plink = "C:\Program Files\PuTTY\plink.exe"
$hostkey = "SHA256:WT2TUkDiv8fHzO2KyIyTlbRkQ3/0wlceizrudjT9Clo"
# Load password from deploy\.vps-ssh.env into $env:VPS_SSH_PASSWORD locally first
$b64 = "c2V0IC1ldW8gcGlwZWZhaWwKUkVQTz0vb3B0L3hldm4tZWNvc3lzdGVtCmNkICIkUkVQTyIKZ2l0IHN0YXNoIC11IDI+L2Rldi9udWxsIHx8IHRydWUKZ2l0IHB1bGwgb3JpZ2luIG1haW4KZ2l0IHN0YXNoIHBvcCAyPi9kZXYvbnVsbCB8fCB0cnVlCm5vZGUgc2NyaXB0cy9tZXJnZS12cHMtcG9ydC1lbnYubWpzIC0tYXBwbHktY2Fub25pY2FsCmdyZXAgLUUgJ19QT1JUPScgZGVwbG95L3hldm4tZWNvc3lzdGVtLy5lbnYgfHwgdHJ1ZQpjZCBkZXBsb3kveGV2bi1lY29zeXN0ZW0KZG9ja2VyIGNvbXBvc2UgLS1lbnYtZmlsZSAuZW52IHVwIC1kIC0tYnVpbGQgLS1yZW1vdmUtb3JwaGFucyBocm0tYmUgeGJvcy1iZQpzbGVlcCAzNQpmb3IgZXAgaW4gIjMwMDEvYXBpL2hybS8iICIzMDAxL2FwaS9ocm0vbWV0cmljcz9mb3JtYXQ9cHJvbWV0aGV1cyIgIjI4MDAyL2FwaS94Ym9zLyIgIjI4MDAyL2FwaS94Ym9zL21ldHJpY3M/Zm9ybWF0PXByb21ldGhldXMiOyBkbwogIENPREU9JChjdXJsIC1zbyAvZGV2L251bGwgLXcgIiV7aHR0cF9jb2RlfSIgImh0dHA6Ly8xMjcuMC4wLjE6JHtlcH0iIDI+L2Rldi9udWxsIHx8IGVjaG8gMDAwKQogIGVjaG8gIjoke2VwfSAtPiAkQ09ERSIKZG9uZQpkb2NrZXIgcHMgLS1mb3JtYXQgInRhYmxlIHt7Lk5hbWVzfX1cdHt7LlN0YXR1c319XHR7ey5Qb3J0c319IiB8IGdyZXAgLUUgJ3hldm58TkFNRVMnIHx8IHRydWUKZWNobyAiSEVBRD0kKGdpdCAtQyAkUkVQTyByZXYtcGFyc2UgLS1zaG9ydCBIRUFEKSI="
& $plink -ssh root@14.225.217.232 -pw $env:VPS_SSH_PASSWORD -hostkey $hostkey -batch "echo $b64 | base64 -d | bash"
```

**PASS:** all four smoke lines `-> 200`; `HEAD=` printed; `docker ps` shows xevn hrm/xbos Up.

## QA smoke (after operator deploy)

From any host with HTTP access to the VPS public IP:

| Endpoint | Expected |
|----------|----------|
| `http://14.225.217.232:3001/api/hrm/metrics?format=prometheus` | HTTP 200, body contains `http_requests_total` |
| `http://14.225.217.232:28002/api/xbos/metrics?format=prometheus` | HTTP 200 |
| `http://14.225.217.232:8088/` | HTTP 200 (portal) |

Record HTTP codes and `git rev-parse --short HEAD` on VPS in QA evidence — no secrets.

## Blockers (agent runner only)

| # | Item | Owner | Unblock |
|---|------|-------|---------|
| 1 | Egress SSH:22 from Cursor agent to `14.225.217.232` | Infra / PM | Whitelist agent IP or run deploy externally (path A) |
| 2 | VPS deploy execution | Operator | Run commands above; then QA public smoke |

Credential blocker **cleared** on retry (`deploy/.vps-ssh.env` present with password set).

## References

- `docs/ops/VPS_POST_SCOPE_DEPLOY_NOTE.md`
- `docs/ops/DEPLOY_GUIDE.md`
- Prior: `docs/ops/evidence/vps-deploy-scope-20260522.md`

## Handoff

- **work_item_id:** `VPS-DEPLOY-SCOPE-01`
- **ack_status:** `READY_FOR_QA` (operator deploy + public URL smoke; agent network blocked)
- **next_owner:** QA — after user runs external deploy; PM tracks operator completion
