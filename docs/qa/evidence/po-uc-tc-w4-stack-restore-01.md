# Evidence — PO-UC-TC-W4-DEVOPS-STACK-RESTORE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-DEVOPS-STACK-RESTORE-01` |
| **from_role** | pm → devops |
| **to_role** | qa |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true — no seed · no invent Leave L2 PASS · no prod deploy |
| **supersedes / merge** | `PO-UC-TC-W4-DEVOPS-XBOS-DIST-01` (dist/main already present; login proxy green) |
| **snapshot** | `docs/qa/evidence/_tmp-po-uc-tc-w4-stack-restore-01-snapshot.txt` |
| **qc stdout** | `docs/qa/evidence/_tmp-po-uc-tc-w4-stack-restore-01-qc.out` |
| **prior E2 block** | `docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-rollup.md` |

---

## Mission

Restore local **L0** so W4 QA can retest:

1. E2-R1 — HRM-AT-07 + HRM-AT-12 **L1 only** (Leave L2 remains SPEC_GAP)
2. E4-R3 — HRM-CI-01 mutate if still open after stack up

---

## Root cause (E2 late BLOCKED)

QA late retest saw **Docker Desktop down** + assumed local **Postgres `:5432`** down → hrm-api cannot boot.

**SoT on this workstation:** `deploy/xevn-ecosystem/.env` uses **remote** `DB_HOST` + **`DB_PORT=6432`** (not local `:5432`). Local L0 APIs are host processes (`node dist/main.js` / nest), not compose postgres.

| Component | Before | After restore |
|-----------|--------|----------------|
| Docker Desktop / engine | DOWN (npipe missing) | **READY** (`docker info` OK) |
| Local `127.0.0.1:5432` | not listening | still not listening — **not required** by SoT env |
| Remote DB `:6432` | (was blocking when engine/network path bad) | **TCP reachable** |
| hrm-api `:28001` | intermittent / cannot boot when DB path fails | **LISTEN + health 200** |
| xbos-api `:28002` | dist/main risk (E4) | **`dist/main.js` present** + health **200** |
| portal `:5173` | up | **200**; `:5175` not required for this L0 |

---

## Actions executed

1. Started Docker Desktop (`C:\Program Files\Docker\Docker\Docker Desktop.exe`); polled until `docker info` OK (~14s).
2. Confirmed no need for local Postgres container — remote DB port **6432** reachable; zero seed.
3. Verified APIs already bound (PIDs listening): `:28001` hrm · `:28002` xbos · `:5173` portal.
4. Confirmed `apps/api/xbos-api/dist/main.js` + `apps/api/hrm-api/dist/main.js` **exist** (merge XBOS-DIST WI — no rebuild required this turn).
5. Smoke: health + portal login proxy + `qc:dev-stack` print PASS.
6. **Cấm honored:** no `pnpm seed:*` · no invent Leave L2 · no VPS/prod deploy.

---

## Gate table

| Check | Result |
|-------|--------|
| Docker engine | **PASS** READY |
| Remote Postgres TCP (`DB_PORT=6432`) | **PASS** |
| Local `:5432` | N/A for SoT env (False — documented) |
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| `GET :5173/` | **200** |
| `GET :5173/api/xbos` (proxy) | **200** |
| `POST :5173/api/xbos/auth/login` (`ceo@xe.vn`) | **201** — **not 500** |
| `POST :28002/api/xbos/auth/login` | **201** |
| `xbos-api/dist/main.js` | **True** |
| `pnpm run qc:dev-stack` | Prints ✓ hrm + ✓ xbos + ✓ portal. Windows Node may abort after PASS print (`qc-dev-stack-windows-uv-exit-noise`, exit `-1073740791`) — treat printed ✓ as **L0 PASS** (same as XBOS-DIST-01 / W1B-STACK). |
| `pnpm run qc:fe-be-health` | **4 FAIL / 401** `HRM-AUTH-001` on employees/catalog with script token path — **not** ECONNREFUSED/500 stack-down. Browser FE login+membership remains QA path (U65). Residual note only. |

---

## Residual

| ID | Severity | Note |
|----|----------|------|
| `R-W4-STACK-FEBE-401` | P2 | `qc:fe-be-health` HRM routes 401 with xbos login token — investigate auth/membership header if L1 API probes needed; **does not block** browser E2/E4 retest when login proxy 201. |
| Leave L2 | SPEC_GAP | **Do not invent PASS** (DOMAIN §4.2). |
| `:5175` | info | Not listening; use **`:5173`** for local portal UAT. |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **env for QA:** portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · persona `ceo@xe.vn` / `Xevn@2026`
- **Do not** start a second `pnpm run dev:xbos-api` while `node dist/main.js` already owns `:28002` (nest `deleteOutDir` race).

### next_dispatch_prompt (copy-ready — E2-R1 first)

```text
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R1
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true

entry_criteria:
  - PO-UC-TC-W4-DEVOPS-STACK-RESTORE-01 READY_FOR_QA
  - evidence: docs/qa/evidence/po-uc-tc-w4-stack-restore-01.md
  - L0: portal :5173 + hrm :28001 + xbos :28002 health 200; login proxy POST /api/xbos/auth/login 201 (not 500)
  - prior seat: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-rollup.md (AT-07 FAIL this seat; AT-12 L1 not evidenced; Leave L2 SPEC_GAP)

scope (L1 only):
  - HRM-AT-07 — Eye→Duyệt attendance update-request; capture POST approve 2xx + x-company-id; FE after 2xx + F5
  - HRM-AT-12 — Leave approve L1 only (POST 2xx); DO NOT invent Leave L2 PASS (SPEC_GAP)

cấm: seed · invent Leave L2 PASS · claim AT-12 L2 · prod deploy

exit_criteria:
  - Browser U65 evidence for AT-07 + AT-12 L1 with Network 2xx + FE after 2xx + F5
  - evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r1.md
  - ack_status PASS_TO_PM; next_dispatch_prompt for PO-UC-TC-W4-QA-E4-CI01-R3 if CI-01 still open
```

### Follow-up after E2-R1 (if CI-01 still open)

```text
work_item_id: PO-UC-TC-W4-QA-E4-CI01-R3
from_role: pm
to_role: qa
entry_criteria: L0 green per po-uc-tc-w4-stack-restore-01.md; xbos dist/main present; login proxy 201
scope: HRM-CI-01 MAIN mutate only — Thêm hợp đồng → Lưu → POST 2xx → F5 (U65); Open+FD already 🟢
cấm: seed
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r3.md
```
