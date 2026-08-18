# D-DO-SYNC-8088-BM-WF04-CALLBACK-01 — DevOps evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-SYNC-8088-BM-WF04-CALLBACK-01` |
| **from_role** | devops |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **executed_at** | 2026-07-22 ~11:43–11:45 ICT |
| **portal** | http://14.225.217.232:8088 |
| **HRM API** | http://14.225.217.232:3001/api/hrm/ · LB `:3101` |
| **source wave** | `BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01` |
| **entry** | `docs/qa/evidence/bm-be-rec-wf-04-step-sync-callback-01-20260722.md` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | No seed · no full rebuild · no Phase1/PROD · non-xevn untouched |

---

## Executive summary

Narrow pscp/tar sync of `recruitment-workflow.bridge.ts` (+ controller) onto VPS bind-mount. Nest-built **hrm-api only**; force-recreated `hrm-be`×3. L0 health **200** on `:3001`/`:3011`/`:3012`/`:3101`. Dist contains bare `screening: 'screening'` alias. Ready for **BM-QA-J-REC-WF-04-STEP-SYNC-R2**.

---

## 1) Pre-sync audit

| Check | Result |
|-------|--------|
| `xevn-hrm-be-dev` / `-2` / `-3` | Up healthy (~51m) |
| Host bridge.ts mtime | Jul 21 23:18 (stale vs BM-BE fix) |
| Bare `intake`/`screening` aliases on VPS | **missing** pre-sync |

---

## 2) Allow-list synced

| Path | Local = VPS MD5 |
|------|-----------------|
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts` | `08340016245b8b682a7e1b2078dd0c09` |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.controller.ts` | (synced companion) |

### Ops

```text
pscp → /tmp/xevn-bm-wf04-callback-01-20260722.tar.gz (~9.8 KB)
tar -xzf … -C /opt/xevn-ecosystem
docker exec xevn-hrm-be-dev → cd /app/apps/api/hrm-api && pnpm run build → BUILD_OK
docker compose up -d --no-deps --force-recreate hrm-be hrm-be-2 hrm-be-3
```

### Dist markers (post)

| Artifact | Marker |
|----------|--------|
| `dist/recruitment/recruitment-workflow.bridge.js` (be×3) | `screening: 'screening'` · `rec_screening: 'screening'` · screening-hits=**3** |
| Host source | `@CODE-MEMORY-CHANGE … BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01` |

**Cấm respected:** no seed · no `docker compose down` · no Phase1/PROD · no full monorepo rebuild · portal/xbos untouched.

---

## 3) Smoke / probe results

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:3001/api/hrm/` | **200** |
| `127.0.0.1:3011/api/hrm/` | **200** |
| `127.0.0.1:3012/api/hrm/` | **200** |
| `127.0.0.1:3101/api/hrm/` (LB) | **200** |

| Container | Health |
|-----------|--------|
| `xevn-hrm-be-dev` / `-2` / `-3` | Up (healthy) after recreate |

---

## Residual

| Item | Owner |
|------|-------|
| Browser J-REC-WF-04 step sync R2 (U65 FE) | **qa** `BM-QA-J-REC-WF-04-STEP-SYNC-R2` |
| git HEAD parity (pscp drift) | defer — not blocking QA |

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` → dispatch **qa** `BM-QA-J-REC-WF-04-STEP-SYNC-R2`
- **evidence_path:** `docs/qa/evidence/d-do-sync-8088-bm-wf04-callback-01-20260722.md`
- **completion_report:** Closed narrow VPS sync of BM-BE-REC-WF-04 bare step_key→stage map; hrm nest dist rebuilt; hrm-be×3 healthy 200. Residual = QA browser R2 only.
- **next_dispatch_prompt:** |

```text
work_item_id: BM-QA-J-REC-WF-04-STEP-SYNC-R2
from_role: pm
to_role: qa
lane: execution
priority: P0
entry: docs/qa/evidence/d-do-sync-8088-bm-wf04-callback-01-20260722.md · docs/qa/evidence/bm-be-rec-wf-04-step-sync-callback-01-20260722.md
URL: http://14.225.217.232:8088 · persona ceo@xe.vn
AC (U65 browser-only): start-pipeline → Inbox complete screening step → GET candidates-pool stage=screening + wf_callback_fingerprint set · F5
cấm: seed · Phase1/PROD
evidence_path: docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md
exit: PASS_TO_PM with UF click path + Network 2xx
```
