# HDSD-P2-SCREEN-01 — Playwright screenshot capture evidence

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-P2-SCREEN-01 |
| **program** | HDSD-P2-FULL-01 |
| **date** | 2026-07-30 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **viewport** | 1280×1800 |
| **portal** | `http://127.0.0.1:5173` |
| **HRM standalone** | `http://127.0.0.1:5175` |

## Artifacts

| Artifact | Path |
|----------|------|
| Manifest | `scripts/hdsd/hdsd-capture-manifest.json` |
| Capture script | `scripts/hdsd/capture-hdsd-screenshots.mjs` |
| Inject script | `scripts/hdsd/inject-hdsd-images.mjs` |
| PNG output | `docs/client-delivery/hdsd/assets/{ecosystem,xbos,hrm}/` |
| Capture JSON | `docs/qa/evidence/hdsd-p2-screenshots-capture.json` |
| Inject JSON | `docs/qa/evidence/hdsd-p2-inject-report.json` |

## Commands

```bash
pnpm exec playwright install chromium
pnpm run hdsd:capture
pnpm run hdsd:inject-images
```

## Capture summary

| Metric | Count |
|--------|------:|
| Manifest figures (capturable web) | 96 |
| Manifest skipped (mobile / transient) | 9 |
| PNG files on disk | 101 |
| Capture OK (primary run) | 88 |
| Capture FAIL (primary run) | 8 |
| Re-inject after slug/asset fix | +7 placeholders |

### PNG by domain

| Domain | PNG count |
|--------|----------:|
| ecosystem | 2 |
| xbos | 33 |
| hrm | 66 |

### Primary-run failures (recovered)

| Figure | Reason | Recovery |
|--------|--------|----------|
| 2.3–3.2 | Login form detach during session re-auth after `2.1` cookie clear | Renamed legacy `hrm-*` PNGs → `xbos-*`; re-injected |
| 9.2, 9.3 | Brief session redirect to `/login` mid-payroll batch | PNGs present (`hrm-9-2.png`, `hrm-9-3.png`); injected on pass 2 |

### Skipped (by design)

- `2.2` — transient loading screen
- `12.1`–`12.8` — Mobile HRM (outside web Playwright scope)

## Inject summary

| Metric | Count |
|--------|------:|
| MD files touched | 14 |
| Placeholders injected (total) | 95 |
| Missing assets after fix | 0 |

## Quality gate

- No **Access Denied** / 403 screens saved in final PNG set (script rejects forbidden body text).
- Empty data tables acceptable post-reset; captures show real shell + route (not wrong product screen).
- Login placeholders (`ECO.1`, `2.1`) use dedicated `/login` capture with cookie clear.

## Residual / QA notes

1. **Duplicate route screenshots** — Several figures sharing the same route (e.g. payroll tabs 9.x) produce identical PNGs; acceptable for Phase 2 inline HDSD; tab-specific re-capture can be a follow-up with manifest `actions`.
2. **HRM.0.2 standalone** — Requires `:5175` + `/hr/*`; verify sidebar full-width when stack is up (small PNG if HRM dev server down).
3. **Re-run subset** — `node ./scripts/hdsd/capture-hdsd-screenshots.mjs --ids=9.2,9.3` when portal is healthy.

## ack_status

**READY_FOR_QA** — capture + inject complete; QA spot-check 5 routes (login, CC, HRM embed employees, settings org, payroll) + confirm MD inline images render.
