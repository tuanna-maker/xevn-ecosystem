# PM Resume — sau khi sponsor reboot (2026-07-31)

**Trạng thái:** ACTIVE — sponsor resumed 2026-07-31 · hook **STOP** (billing-safe)

## P0 làm ngay sau reboot

1. **Stack L0** — `pnpm run qc:dev-stack` (thường hrm :28001 + xbos :28002 down sau reboot)
   - `pnpm run dev:hrm-api` · `pnpm run dev:xbos-api` · portal `:5173`
2. **Poll / re-dispatch** các WI bị interrupt (Task Cursor không survive reboot):

| WI | Owner | Mục tiêu |
|----|-------|----------|
| `QA-HDSD-MOB-CH12-01-R4` | qa-device | J-MOB-03/04/05 + 8× `hrm-12-*.png` (C-R2-02) |
| `QA-HDSD-MUTATE-RET-03-SHR` | qa | UF-XBOS-05 F5 persist (SHR-F5 READY) |
| `QA-HDSD-W4-INT-03-R4` | qa | leave → CC inbox TC-ECO-INT-03 |
| `D-HDSD-MUTATE-DO-01` | devops | build:clean + `dist/main.js` :28001 (bỏ dist-uat-w6) |
| `D-OPS-HRM-DIST-MAIN-SWITCH-01` | devops | merge w/ MUTATE-DO |
| `D-OPS-HRM-API-SCOPE-PARITY-DEPLOY-01` | devops | W2a scope alias trên binary mới |
| `QA-HRM-BUILD-01-RET` | qa | sau dist switch |
| `QA-HRM-EMBED-NETWORK-AUDIT-01-R2-CONT` | qa | 19 menus embed |

## Đã đóng (không dispatch lại trừ regression)

- `D-HDSD-MOB-UAT-AUTH-01` + `D-OPS-MOB-AUTH-PILOT-DEPLOY-01` — uat.nv 201 local+pilot
- `D-HDSD-MUTATE-SHR-F5-01` — READY_FOR_QA vitest 7/7
- `D-HDSD-WF-INBOX-FE-01` — READY_FOR_QA inbox route
- `QC-HDSD-P2-GATE-01-R3` — GWC web; mobile chờ C-R2-02 PNG

## Residual governance

- Auth slice + shareholder FE **chưa commit/push `main`** — deploy pilot = SCP one-off
- **HOLD_DEPLOY** · **U65** zero-seed · portal UAT `:5173`

## Lệnh sponsor khi quay lại

Gửi: **`điều phối team đi`** hoặc **`tiếp tục`**

PM: bật `PM_ORCHESTRATION_MODE=RUN` (nếu muốn auto-hook) → `pnpm run pm:idle:check` → poll WI trên → dispatch theo bus tail `docs/program/AGENT_MESSAGE_BUS.md`

SoT live: `docs/program/TEAM_WORKING_NOW.md`
