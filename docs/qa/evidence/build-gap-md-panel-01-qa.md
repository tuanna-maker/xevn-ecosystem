# BUILD-GAP-MD-PANEL-01-QA — UF-HRM-10 master-data tab

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-MD-PANEL-01-QA |
| from_role | qa |
| dev_handoff | BUILD-GAP-MD-PANEL-01 · `docs/qa/evidence/build-gap-md-panel-01.md` |
| date | 2026-08-03 |
| ack_status | **PASS_TO_PM** |
| u65_zero_seed | true |
| u76_hdsd | Settings → tab «Danh mục nghiệp vụ» (SCR-TAB-MASTER) |
| spec_ref | UF-HRM-10 · `HRM-SETTINGS.md` §4.4 · `mdBucketRegistry` |

## L0 / L1 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | HRM :28001 · XBOS :28002 · portal :5173 **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** (login + proxy settings path class) |

## UF-HRM-10 — Tab Danh mục nghiệp vụ (BUILD_GAP closure)

- **Persona / URL:** `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main`
- **Click path:** portal auth (API login + storage inject, U65) → **Cài đặt** shell → tab **Danh mục nghiệp vụ** (`master-data`)
- **Trước mutate:** N/A (read-only mount wave; cấm seed)
- **Action:** open tab only — no catalog mutate · no Leave reopen
- **Network:** `GET /api/hrm/settings-catalogs` → **200** (1 call; no 5xx storm)
- **FE sau load (SRS):** Panel mounts — heading «Danh mục nghiệp vụ (master data)», bucket tabs (Chức danh, Phòng ban, Loại nghỉ, …), **Đồng bộ XBOS** CTA; **no** Vite overlay / no `Failed to resolve import MasterDataSettingsPanel`
- **Console:** 0 `pageerror`; 0 console `error` captured
- **F5:** not required for this BUILD_GAP scope (mount-only)
- **Verdict:** 🟢 **PASS**
- **spec_gap:** none for mount; full TC-SET-MD-* mutate matrix remains PLANNED in `HRM-SETTINGS.md` (not this wave)

## L2.5 note

Scope = **BUILD_GAP file restore** only. Cross-nav J-HRM settings catalog mutate journeys not re-run; no list→detail parity check beyond panel bucket UI.

## Screenshots

| File | Note |
|------|------|
| `docs/qa/evidence/screens/build-gap-md-panel-01-qa/01-settings-shell.png` | Settings shell loaded |
| `docs/qa/evidence/screens/build-gap-md-panel-01-qa/02-master-data-tab.png` | Master-data panel + bucket tabs |

## Machine trace

- Runtime JSON: `docs/qa/evidence/_tmp-build-gap-md-panel-01-qa-runtime.json`
- Script: `scripts/qa/_tmp-build-gap-md-panel-01-qa-browser.mjs` (exit 0)

## Residual

| Item | Owner | Note |
|------|-------|------|
| HRM full `vite build` — `performanceFormSchema` missing | dev-fe (separate) | Pre-existing; not hit on this route |
| TC-SET-MD HP mutate + F5 persist | future PO-ECO-TC-EXEC | Out of scope BUILD-GAP-MD-PANEL-01 |

## Handoff

```
completion_report: BUILD_GAP MasterDataSettingsPanel restore verified U65 browser — tab mounts, bucket UI, GET settings-catalogs 200, no Vite 500.
next_owner: pm
next_dispatch_prompt: PM — Close BUILD-GAP-MD-PANEL-01 on bus; optional QC spot on UF-HRM-10 matrix row; do not claim Phase1/UAT DONE; Leave/Approve must_keep unchanged.
evidence_path: docs/qa/evidence/build-gap-md-panel-01-qa.md
ack_status: PASS_TO_PM
```
