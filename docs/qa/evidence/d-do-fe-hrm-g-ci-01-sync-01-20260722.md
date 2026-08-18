# D-DO-FE-HRM-G-CI-01-SYNC-01 — DevOps evidence (Dev8088 FE)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-FE-HRM-G-CI-01-SYNC-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~20:38–20:41 ICT |
| **portal** | http://14.225.217.232:8088 |
| **hrm embed** | http://14.225.217.232:8088/hr/ |
| **UF page** | http://14.225.217.232:8088/hr/contracts |
| **entry** | FE `docs/qa/evidence/fe-hrm-g-ci-01-20260722.md` (vitest 21/21) · BE live `docs/qa/evidence/d-do-hrm-g-ci-01-sync-01-20260722.md` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | No seed · no Phase1/PROD · no reopen G-AT10 / G-RC / JWT / G-DEC · non-xevn untouched |

---

## Executive summary

Synced FE G-CI-01 open-ended contract policy (`contractEndDatePolicy` + EmployeeContracts gate + useContracts / useEmployeeContracts omit `end_date` + hrmApi optional) onto VPS bind-mount `/opt/xevn-ecosystem`. Restarted **`xevn-hrm-fe-dev` only** (Vite ready ~408 ms). Public `:8088/hr/contracts` **200**; Vite serves policy + hooks with **FE-HRM-G-CI-01** / omit-`end_date` markers. Hard refresh advised for browser UF. Ready for **QA-HRM-G-CI-01-R2**.

---

## 1) Pre-sync audit

| Check | Result |
|-------|--------|
| `xevn-portal-fe-dev` | Up · `0.0.0.0:8088->5173` (~20h) |
| `xevn-hrm-fe-dev` | Up · `0.0.0.0:8080->8080` (~10h before restart) |
| `xevn-hrm-be-*` | healthy (:3001/:3011/:3012) — **not restarted** (BE G-CI-01 already live) |
| `contractEndDatePolicy.ts` on VPS | **MISSING** |
| `EmployeeContracts.tsx` | stale `Jul 20` (no policy import) |

Serving model (unchanged): host `:8088` portal Vite → `VITE_DEV_PROXY_HRM_WEB=http://hrm-fe:8080` → bind-mount `/opt/xevn-ecosystem/apps/web/hrm`.

---

## 2) Allow-list synced + restart

```text
tar.gz (8 FE paths under apps/web/hrm/src/…)
pscp → /tmp/xevn-fe-g-ci-01-sync-20260722.tar.gz (~34.9 KB)
tar -xzf … -C /opt/xevn-ecosystem
cd deploy/xevn-ecosystem && docker compose --env-file .env restart hrm-fe
# Vite ready ~408 ms — no image rebuild · portal-fe untouched · hrm-be untouched
```

### Files synced (local MD5 = VPS MD5)

| Path | MD5 |
|------|-----|
| `apps/web/hrm/src/lib/contractEndDatePolicy.ts` | `aa9c45b0e2dd220a554506a374e55793` |
| `apps/web/hrm/src/lib/contractEndDatePolicy.test.ts` | `0f96c72aa0fc57a0d2c3dfd2cdf7bde0` |
| `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | `7df898f91d53e1381378ec666f594ef2` |
| `apps/web/hrm/src/hooks/useContracts.ts` | `6add127ecaae6c49173f092f718d5ce7` |
| `apps/web/hrm/src/hooks/useContracts.test.ts` | `dc977760171edb451fc486b57f3abbb4` |
| `apps/web/hrm/src/hooks/useEmployeeContracts.ts` | `93c503386a803da25895d3027225e80d` |
| `apps/web/hrm/src/hooks/useEmployeeContracts.test.ts` | `d62b3ecd5d04b384fbfa2578e957f207` |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `4fe4393e130deb91c0f7c7fafa559a57` |

**Disk markers:** `isOpenEndedContractType` (policy) · `contractEndDatePolicy` (EmployeeContracts) · `FE-HRM-G-CI-01` + conditional `end_date` omit (useContracts / useEmployeeContracts).

**Cấm respected:** no `pnpm seed:*` · no `docker compose down` · no Phase1/PROD · no G-AT10/G-RC/JWT/G-DEC reopen · non-xevn untouched · no full monorepo / portal-fe rebuild.

---

## 3) Smoke

### VPS localhost

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `127.0.0.1:8088/` | **200** | portal |
| `127.0.0.1:8088/hr/` | **200** | embed |
| `127.0.0.1:8080/hr/` | **200** | hrm-fe direct |
| `127.0.0.1:8088/hr/contracts` | **200** | UF page shell |
| `…/hr/src/lib/contractEndDatePolicy.ts` | **200** | `isOpenEndedContractType` |
| `…/hr/src/hooks/useContracts.ts` | **200** | `FE-HRM-G-CI-01` · omit `end_date` |
| `…/hr/src/hooks/useEmployeeContracts.ts` | **200** | open-ended omit |

### Public (sponsor URL)

| Endpoint | HTTP | Marker |
|----------|------|--------|
| `http://14.225.217.232:8088/` | **200** | HTML shell |
| `http://14.225.217.232:8088/hr/` | **200** | HTML shell |
| `…/hr/contracts` | **200** | page load |
| `…/hr/src/lib/contractEndDatePolicy.ts` | **200** | **MARKER_OK** (`isOpenEndedContractType`) |
| `…/hr/src/components/employee/EmployeeContracts.tsx` | **200** | **MARKER_OK** (`contractEndDatePolicy`) |
| `…/hr/src/hooks/useContracts.ts` | **200** | **MARKER_OK** (`FE-HRM-G-CI-01` ×4 · omit `end_date`) |
| `…/hr/src/hooks/useEmployeeContracts.ts` | **200** | **MARKER_OK** (G-CI omit path) |

**Browser note:** hard refresh (Ctrl+F5) on `/hr/contracts` so Vite modules pick up bind-mount sync.

### Non-xevn

Sample still Up (no compose down). `head` sample truncated by filter only — containers not touched.

---

## 4) Gate table

| Gate | Result |
|------|--------|
| Narrow FE G-CI-01 allow-list sync only | **PASS** |
| Restart `hrm-fe` only (no full rebuild) | **PASS** |
| Portal `:8088` + `/hr/contracts` 200 | **PASS** |
| Vite source markers via `:8088/hr/src/…` | **PASS** |
| BE G-CI-01 left intact (no hrm-be restart) | **PASS** |
| No seed / no closed-gap reopen / no Phase1-PROD | **PASS** |

---

## completion_report

**Closed:** FE G-CI-01 (`contractEndDatePolicy` + create/update omit empty `end_date`) live on Dev8088 bind-mount; `hrm-fe` restarted; `/hr/contracts` **200** with policy/hook markers.

**Residual:**
1. Browser UF AC (open-ended omit → POST 201; fixed-term empty → FE toast 0 POST; start>end → 400 `HRM-CON-001`) — **QA-HRM-G-CI-01-R2**.
2. VPS git HEAD may remain behind pscp drift — promote via git when PM allows.

**Not claimed:** Phase1 DONE · PROD · UF 🟢.

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/d-do-fe-hrm-g-ci-01-sync-01-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-CI-01-R2
role: qa
entry_criteria:
  - DevOps FE sync PASS: docs/qa/evidence/d-do-fe-hrm-g-ci-01-sync-01-20260722.md
  - BE already live: docs/qa/evidence/d-do-hrm-g-ci-01-sync-01-20260722.md
  - FE local: docs/qa/evidence/fe-hrm-g-ci-01-20260722.md (vitest 21/21)
  - URL: http://14.225.217.232:8088 — hard refresh /hr/contracts
  - U65 zero-seed · browser-only · cấm reopen G-AT10/G-RC/JWT/G-DEC
exit_criteria:
  - AC1: type Hợp đồng không thời hạn · hiệu lực set · hết hạn trống → Lưu → POST without end_date → 201 · F5 end_date null
  - AC2: type Hợp đồng 1 năm · hết hạn trống → FE toast «Vui lòng nhập ngày hiệu lực và ngày hết hạn» · 0 POST
  - AC3: start > end → still 400 HRM-CON-001
  - Evidence docs/qa/evidence/qa-hrm-g-ci-01-r2-20260722.md · FE sau 2xx + F5 · ack_status PASS_TO_PM
cấm: pnpm seed:* · API inbox seed · DB fake · PASS chỉ probe
```
