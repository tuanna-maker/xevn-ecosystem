# P1-WEB-ACCEPTANCE-QA-BE-PARTIAL-8088 — QA evidence (BE slice)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-QA-BE-PARTIAL-8088` |
| **from_role** | qa |
| **to_role** | pm |
| **portal** | http://14.225.217.232:8088 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **executed_at** | 2026-06-20T18:47:20Z |
| **ack_status** | **PASS_TO_PM** (BE slice only) |
| **devops baseline** | `docs/ops/evidence/p1-deploy-8088-be-probe-20260620.json` |
| **be fix ref** | `docs/qa/evidence/p1-web-acceptance-be-fix-20260620.md` |

## Scope

Partial retest after devops hot-sync BE (`hrm-be` + `xbos-be`) on VPS `:8088`. **Does not claim full web nghiệm thu** — 4 blockers remain open (UF-XBOS-05, UF-XBOS-14, UF-HRM-10, UF-HRM-11).

## L0 smoke

| Check | Result |
|-------|--------|
| Portal `GET /` | **200** |
| Login `POST /api/xbos/auth/login` | **200** + JWT |
| Probe script exit | **0** — 3/3 PASS |

## Retest results (mutate + F5 surrogate)

F5 surrogate = POST/PUT/PATCH mutate → immediate GET re-read (same session, no cache bypass needed on API).

### UF-XBOS-12 — Phòng ban org-units 🟢 Dev8088

| Step | Method | Path | HTTP | Code |
|------|--------|------|------|------|
| Create | POST | `/api/xbos/org-foundation/org-units` | **201** | `XBOS-ORG-201` |
| Update | PUT | `/api/xbos/org-foundation/org-units/{id}` | **200** | — |
| F5 surrogate | GET | `/api/xbos/org-foundation/org-units/tree?legal_entity_id=11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` | **200** | `found=true`, **14 nodes**, new `code` present |

**Note:** Group-mode flat `tree[]` without `legal_entity_id` returns 0 nodes — probe uses member entity filter per dev-be handoff (J-XBOS-07 scope).

**Defect:** `D-UF-WEB-XBOS-12-01` → **CLOSED** on Dev8088.

### UF-XBOS-15 — Catalog extension item 🟢 Dev8088

| Step | Method | Path | HTTP | Code |
|------|--------|------|------|------|
| Create | POST | `/api/hrm/settings-catalogs/positions/extension-items` | **201** | `HRM-SET-209` |
| F5 surrogate | GET | `/api/hrm/settings-catalogs?company_id=main` | **200** | `extension_items` contains new `code` |

**Defect:** `D-UF-WEB-XBOS-15-01` → **CLOSED** on Dev8088.

### UF-HRM-12 — Tuyển dụng requisition mutate 🟢 Dev8088

| Step | Method | Path | HTTP | Code |
|------|--------|------|------|------|
| Create | POST | `/api/hrm/recruitment/requisitions` | **201** | `HRM-REC-201` |
| Mutate | PATCH | `/api/hrm/recruitment/requisitions/{id}?company_id=main` body `{ status: 'on_hold' }` | **200** | `HRM-REC-200` |
| F5 surrogate | GET | `/api/hrm/recruitment/requisitions/{id}?company_id=main` | **200** | `status=on_hold` |

**Note:** PATCH succeeded (no PUT fallback needed). Extra fields in PATCH body trigger `HRM-VAL-001`.

**Defect:** `D-UF-WEB-HRM-12-01` → **CLOSED** on Dev8088.

## Summary

| UF-ID | Dev8088 | Verdict |
|-------|---------|---------|
| UF-XBOS-12 | 🟢 | **PASS** |
| UF-XBOS-15 | 🟢 | **PASS** |
| UF-HRM-12 | 🟢 | **PASS** |

**BE slice:** 3/3 PASS · probe JSON refreshed at `docs/ops/evidence/p1-deploy-8088-be-probe-20260620.json`.

## Open blockers (NOT in this slice — sponsor nghiệm thu still blocked)

| UF-ID | Defect | Owner | Status |
|-------|--------|-------|--------|
| UF-XBOS-05 | `D-UF-WEB-XBOS-05-R1` | dev-fe | 🔴 holding shareholder POST **404** |
| UF-XBOS-14 | `D-UF-WEB-XBOS-14-01` | dev-be | 🔴 CC catalog PUT 200 row missing GET |
| UF-HRM-10 | `D-UF-WEB-HRM-10-01` | dev-be/devops | 🔴 sync-from-xbos **502** |
| UF-HRM-11 | `D-UF-WEB-HRM-11-01` | dev-be | 🔴 metadata change-request UUID |

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| L2 UI browser mutate for UF-XBOS-12/15/UF-HRM-12 | qa (W4) | API F5 PASS; portal UI click-path not re-run this slice |
| Full Dev8088 column (19/23 → 23/23) | dev-fe + dev-be + qa | Blocked on 4 defects above |
| Sponsor nghiệm thu | pm | **NOT READY** until all web UF 🟢 |

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Retested UF-XBOS-12 (`tree?legal_entity_id=11d2bb7b…`), UF-XBOS-15, UF-HRM-12 on `:8088` — mutate+F5 surrogate **3/3 PASS**. Matrix Dev8088 updated for these 3 UF. Closed defects D-UF-WEB-XBOS-12-01, D-UF-WEB-XBOS-15-01, D-UF-WEB-HRM-12-01. **Does not claim full nghiệm thu** — 4 blockers remain (05, 14, 10, 11). |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/p1-web-acceptance-be-qa-8088-20260620.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-WEB-ACCEPTANCE-FE-BLOCKERS-8088
from_role: pm
to_role: dev-fe
priority: P0

entry_criteria: QA P1-WEB-ACCEPTANCE-QA-BE-PARTIAL-8088 PASS_TO_PM — BE slice 3/3 🟢 (UF-XBOS-12/15, UF-HRM-12); evidence docs/qa/evidence/p1-web-acceptance-be-qa-8088-20260620.md

tasks:
1) dev-fe: deploy UF-XBOS-05 holding shareholder scope fix to :8088 (D-UF-WEB-XBOS-05-R1)
2) dev-be: UF-XBOS-14 CC catalog row merge + UF-HRM-10 sync URL + UF-HRM-11 company_uuid (if not already merged — hot-sync :8088)
3) qa: retest remaining 4 blockers on :8088 after READY_FOR_QA

exit: Do NOT claim sponsor nghiệm thu until 23/23 web UF Dev8088 🟢
evidence: docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md
ack_status: READY_FOR_QA or FAIL_TO_PM
```
