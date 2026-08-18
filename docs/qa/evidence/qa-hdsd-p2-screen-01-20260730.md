# QA-HDSD-P2-SCREEN-01 — HDSD P2 screenshot inject spot-check

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-P2-SCREEN-01 |
| **upstream** | HDSD-P2-SCREEN-01 (dev-fe) |
| **program** | HDSD-P2-FULL-01 |
| **date** | 2026-07-30 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **portal** | `http://127.0.0.1:5173` |
| **policy** | U65 zero-seed · route shell spot (not mutate) |

## Entry criteria

| Check | Result |
|-------|--------|
| Dev evidence `hdsd-p2-screenshots-20260730.md` READY_FOR_QA | ✅ |
| PNG assets under `docs/client-delivery/hdsd/assets/` | ✅ 110 usable (≥95) |
| Placeholders inlined across 14 MD files | ✅ 95+ `![caption](../assets/…)` refs |
| L0 portal `:5173` up | ✅ `qc:dev-stack` hrm/xbos/portal HTTP 200 (mid-session restart) |

## L0 stack

```text
pnpm run qc:dev-stack  → hrm-api 200 · xbos-api 200 · web-portal 200
pnpm run hdsd:build    → exit 0 · images=110 · HDSD_XEVN_ECOSYSTEM_v1.html 23.4 MB
```

Command: `node ./scripts/qa/qa-hdsd-p2-screen-01.mjs` (`SKIP_HDSD_BUILD=1` after build)

Runtime JSON: `docs/qa/evidence/qa-hdsd-p2-screen-01-20260730-runtime.json`

## Browser spot — 5 routes (🟢 5/5)

| ID | Route | Verdict | Notes |
|----|-------|---------|-------|
| R-LOGIN | `/login` | 🟢 | Email/Mật khẩu/Đăng nhập — no Access Denied |
| R-CC | `/command-center` | 🟢 | Rail GROUP/NHÂN SỰ/CÀI ĐẶT — correct CC shell |
| R-HRM-EMP | `/command-center/hrm/employees` | 🟢 | HRM embed + iframe; menu Nhân sự |
| R-SETTINGS-ORG | `/command-center?settings=company_member_units` | 🟢 | Cài đặt hệ thống · Đơn vị thành viên |
| R-HRM-PAYROLL | `/command-center/hrm/payroll` | 🟢 | HRM embed payroll tab shell |

Screenshots: `docs/qa/evidence/screens/qa-hdsd-p2-screen-01/r-*.png`

**No Access Denied / wrong-product screen** on any spot route. Empty table data acceptable per dev capture policy.

## MD inline images — 3 chapters (🟢 3/3)

| ID | File | Inline imgs | Asset resolve |
|----|------|-------------|---------------|
| MD-ECO-CH01 | `ecosystem/HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md` | 2 | 🟢 `eco-1.png`, `eco-2.png` |
| MD-XBOS-CH03 | `xbos/HDSD_XEVN_CH03_XBOS_TO_CHUC.md` | 7 | 🟢 `xbos-3-0` … `xbos-3-6` |
| MD-HRM-CH05 | `hrm/HDSD_XEVN_CH05_HRM_NHAN_SU.md` | 4 | 🟢 `hrm-5-1` … `hrm-5-4` |

All `![caption](../assets/…)` paths resolve on disk (>1 KB each).

## HTML build spot (`hdsd:build`)

| Check | Result |
|-------|--------|
| Artifact | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` |
| Build log | `images=110 ok=true` · PDF 8.4 MB |
| Inline figures in HTML | 110 `<figure class="hdsd-figure">` with embedded PNG |

CH01 / CH03 / CH05 figures present in merged HTML (ecosystem + XBOS org + HRM employees sections).

## PNG inventory

| Metric | Count |
|--------|------:|
| Total PNG on disk | 110 |
| Usable (>1 KB) | **110** |
| ecosystem | 2 |
| xbos | 42 |
| hrm | 66 |
| Manifest capturable figures | 97 |
| **Missing figure IDs** | **0** |

### Skipped by design (manifest `skipped`)

`2.2` (transient loading) · `12.1`–`12.8` (mobile — out of web Playwright scope)

## Residual (not blocking HDSD-P2-SCREEN-01)

| Item | Severity | Owner |
|------|----------|-------|
| Transient HRM API `:28001` down mid-session → console 500 on embed data fetch | P2 | devops / dev-be — restart `dist/main.js` or fix nest watch MODULE_NOT_FOUND |
| Duplicate PNGs for same route (payroll tabs 9.x) | P3 | dev-fe optional tab-specific re-capture |
| `qc:fe-be-health` FAIL when hrm-api listener dropped | P2 | devops — not HDSD asset gate |

Console excerpt (employees route): `Error fetching employees page: ApiClientError: Không xử lý được yêu cầu HRM (500)` — **shell/route correct**; static PNG assets unaffected.

## Verdict

**PASS_TO_PM** — exit criteria met: 5/5 route spots 🟢 · 3/3 MD chapters resolve images 🟢 · 110 usable PNGs (≥95) · 0 missing figure IDs · HTML rebuild ready.

## ack_status

**PASS_TO_PM** → triggers **HDSD-P2-HTML-REBUILD-01** (already built this session) + **QC-HDSD-P2-GATE-01-R2**

## pm_dispatch_hint

`HDSD-P2-HTML-REBUILD-01` may skip re-build if artifact SHA unchanged; dispatch **QC-HDSD-P2-GATE-01-R2** with evidence paths above + `HDSD_XEVN_ECOSYSTEM_v1.pdf`.
