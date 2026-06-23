# P1-WEB-ACCEPTANCE-CLOSE-01 — Web UF nghiệm thu :8088

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-CLOSE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-06-20 |
| **environment** | **Authoritative:** [http://14.225.217.232:8088/](http://14.225.217.232:8088/) |
| **account** | `ceo@xe.vn` / `Xevn@2026` · member `du-lich.ceo@xe.vn` · HRBP `du-lich.hr@xe.vn` |
| **matrix** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` |
| **ack_status** | **FAIL_TO_PM** |

## Executive summary

Nghiệm thu web **FAIL** trên Dev `:8088`. L0 `qc:dev-stack` **PASS** (portal + HRM + XBOS). Trong **8 UF ⬜** mới: **2/8 🟢** (`UF-XBOS-13`, `UF-HRM-13`). Retest **15 UF đã 🟢 local**: **14/15 🟢** trên `:8088` — **regression `UF-XBOS-05`** (holding cổ đông UI path **404**). **Không đủ** điều kiện sponsor show khách.

| Bucket | 🟢 | 🔴/⬜ |
|--------|-----|------|
| UNTESTED wave (12–15, HRM 10–13) | 2 | 6 |
| Prior 🟢 retest §3–§4 | 14 | 1 (`UF-XBOS-05`) |
| **Web in-scope total** | **16** | **7** |

## Commands

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | portal `:8088` 200 |
| 2 | `PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-web-acceptance-close-20260620.mjs` | **1** | 2/8 UNTESTED PASS — `p1-web-acceptance-close-20260620-probe.json` |
| 3 | `PORTAL_DEV_URL=… node scripts/tmp-user-flow-e2e-audit-01.mjs` | **1** | 14/16 — `UF-XBOS-05` 🔴 |
| 4 | `PORTAL_DEV_URL=… node scripts/tmp-user-flow-web-qa-l0-supplement.mjs` | **0** | UF-XBOS-01..11, HRM-02..06,09 🟢 |
| 5 | `node scripts/tmp-p1-p0-qa-xbos-8088-full-probe.mjs` | **1** | 16/17 — `GET org-units` list 404 (no list route; tree used in UF-12) |
| 6 | Browser MCP — `:8088/login` | manual | Login form renders — screenshot `page-2026-06-19T18-36-01-115Z.png` |

---

## UNTESTED rows — Dev8088 results

### UF-XBOS-12 — Phòng ban org-units 🔴

| Step | Result |
|------|--------|
| POST `/api/xbos/org-foundation/org-units` | **201** `XBOS-ORG-201` `id=fbffb6bb-…` |
| PUT same unit | **200** |
| F5 surrogate `GET …/org-units/tree` | **200** `tree=[]` — **unit not hydrated** |

**Business:** User thêm phòng ban → Lưu toast/API OK → F5 mất dòng (J-XBOS-07 class).  
**Defect:** `D-UF-WEB-XBOS-12-01` **P0** → **dev-be** (holding/member tree parity) + **dev-fe** (hydrate after save).

### UF-XBOS-13 — Ma trận phân quyền 🟢

| Step | Result |
|------|--------|
| GET `position-rbac/matrix?roleId=raci_hdqt` | **200** |
| PUT toggle `delete` on `pm-hr-1` | **200** `XBOS-POS-201` |
| re-GET matrix | **200** — value sticky |

**Business:** Settings → Hệ thống phân quyền — checkbox Xóa persist sau F5 surrogate.  
**Dev8088:** 🟢

### UF-XBOS-14 — Catalog CC autosave 🔴

| Step | Result |
|------|--------|
| PUT `…/command_center_catalogs/items/regulations` `{rows:[{code:'QA-UF14-…'}]}` | **200** `XBOS-MASTER-201` |
| GET `…/command_center_catalogs/items` | **200** — `regulations` partition **5 rows**, new code **absent** |

**Business:** Master catalog CC — thêm dòng văn bản → F5 không thấy.  
**Defect:** `D-UF-WEB-XBOS-14-01` **P0** → **dev-be** (upsert persist) / **dev-fe** (partition wire).

### UF-XBOS-15 — Extension item HRM DM 🔴

| Step | Result |
|------|--------|
| POST `/api/hrm/settings-catalogs/positions/extension-items` | **201** `HRM-SET-209` |
| GET `/api/hrm/settings-catalogs?company_id=main` | positions `extension_items` **not listing** new code |

**Defect:** `D-UF-WEB-XBOS-15-01` **P1** → **dev-be** (extension read path).

### UF-HRM-10 — Settings catalogs sync 🔴

| Step | Result |
|------|--------|
| POST `sync-from-xbos` | **502** `HRM-SYNC-001` |
| POST `settings-catalogs/items` | **400** `HRM-VAL-001` (blocked by sync fail) |

**Defect:** `D-UF-WEB-HRM-10-01` **P0** → **dev-be** + **devops** (XBOS↔HRM sync on VPS).

### UF-HRM-11 — Metadata queue 🔴

| Step | Result |
|------|--------|
| POST `employee-metadata/change-requests` | **400** `HRM-VAL-001` — `company_id` must be UUID; list employee exposes slug `finance` only |

**Defect:** `D-UF-WEB-HRM-11-01` **P0** → **dev-be** (expose `company_uuid` on employee list / metadata DTO).

### UF-HRM-12 — Tuyển dụng requisition mutate 🔴

| Step | Result |
|------|--------|
| POST `recruitment/requisitions` | **201** `HRM-REC-201` |
| PATCH `…/requisitions/{id}?company_id=main` | **404** `Cannot PATCH …` — **route not on deployed hrm-api** |
| GET by id | **404** |

**Defect:** `D-UF-WEB-HRM-12-01` **P0** → **devops** redeploy hrm-api + **dev-fe** UI save path.

### UF-HRM-13 — Member CEO mutate 🟢

| Persona | Result |
|---------|--------|
| `du-lich.ceo@xe.vn` | PATCH employee `MEMEMP440961` **200** `HRM-EMP-202` → GET persist **PASS** |

**Dev8088:** 🟢

---

## Prior 🟢 rows — Dev8088 retest

| UF-ID | Dev8088 | Network highlight |
|-------|---------|-------------------|
| UF-XBOS-01 | 🟢 | Login **201** JWT |
| UF-XBOS-02 | 🟢 | member units **200** count=4 |
| UF-XBOS-03 | 🟢 | PUT legal entity + re-GET name |
| UF-XBOS-04 | 🟢 | POST shareholder **201** list+1 |
| **UF-XBOS-05** | **🔴** | POST holding UI id **404** — regression vs local fix |
| UF-XBOS-06 | 🟢 | doc POST+GET |
| UF-XBOS-07 | 🟢 | RACI GET **200** |
| UF-XBOS-08 | 🟢 | WF inbox read |
| UF-XBOS-09 | 🟢 | cat-gov inbox **200** |
| UF-XBOS-10 | 🟢 | KPI rollup **200** |
| UF-XBOS-11 | 🟢 | member rollup **409** expected |
| UF-HRM-01 | 🟢 | list→detail **200** |
| UF-HRM-02 | 🟢 | contract POST+GET notes |
| UF-HRM-03 | 🟢 | PATCH full_name |
| UF-HRM-04 | 🟢 | insurance list **200** |
| UF-HRM-05 | 🟢 | attendance **200** |
| UF-HRM-06 | 🟢 | payroll **200** |
| UF-HRM-09 | 🟢 | HRBP PATCH **200** |
| UF-HRM-07/08 | ⚪ | mobile — ngoài scope web |

---

## Defect register (dispatch)

| ID | UF | Sev | Owner | pm_dispatch_hint |
|----|-----|-----|-------|------------------|
| D-UF-WEB-XBOS-05-R1 | UF-XBOS-05 | **P0** | dev-fe | Redeploy holding `resolveLegalProfileScope` fix to `:8088` — POST shareholder holding **404** |
| D-UF-WEB-XBOS-12-01 | UF-XBOS-12 | **P0** | dev-be | org-unit POST 201 but `org-units/tree` empty F5 — J-XBOS-07 |
| D-UF-WEB-XBOS-14-01 | UF-XBOS-14 | **P0** | dev-be | `command_center_catalogs` PUT 200 row missing on GET |
| D-UF-WEB-XBOS-15-01 | UF-XBOS-15 | P1 | dev-be | extension-items POST 201 not visible in settings-catalogs GET |
| D-UF-WEB-HRM-10-01 | UF-HRM-10 | **P0** | dev-be/devops | `sync-from-xbos` **502** on `:8088` |
| D-UF-WEB-HRM-11-01 | UF-HRM-11 | **P0** | dev-be | metadata change-request needs `company_uuid` on employee |
| D-UF-WEB-HRM-12-01 | UF-HRM-12 | **P0** | devops | PATCH `recruitment/requisitions` **404** — deploy gap |

---

## Screenshots / UI

| Asset | Path |
|-------|------|
| Login `:8088` | `page-2026-06-19T18-36-01-115Z.png` (MCP capture) |

API F5-surrogate used where browser session blocked; **L2 UI mutate** still required for defect closure on 🔴 rows.

---

## Residual

| Item | Status |
|------|--------|
| All web UF 🟢 on `:8088` | **OPEN** — 7 blockers above |
| Sponsor nghiệm thu | **BLOCKED** until defects closed + QA R2 |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Executed UNTESTED 8 UF + retest 17 prior web UF on `:8088`. **2** new PASS (13, HRM-13). **7** FAIL block nghiệm thu including **UF-XBOS-05 regression**. L0 PASS. Evidence + probe JSON + matrix updated. |
| **next_owner** | **pm** → dispatch **dev-be** / **dev-fe** / **devops** per defect table |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/p1-web-acceptance-close-20260620.md` |
| **ack_status** | **FAIL_TO_PM** |

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-WEB-ACCEPTANCE-FIX-WAVE-01
priority: P0
from_role: pm
to_role: dev-be (primary) + dev-fe + devops parallel

entry_criteria: QA FAIL_TO_PM docs/qa/evidence/p1-web-acceptance-close-20260620.md — 7 defects blocking sponsor nghiệm thu on :8088

tasks:
1) dev-fe P1-XBOS-05-8088-R1 — UF-XBOS-05 holding shareholder UI POST on :8088 (404 holding root id)
2) dev-be P1-XBOS-ORG-TREE-12 — UF-XBOS-12 org-unit save→tree hydrate (J-XBOS-07)
3) dev-be P1-XBOS-CC-CAT-14 — UF-XBOS-14 command_center_catalogs PUT persist on GET
4) dev-be P1-HRM-SYNC-10 — UF-HRM-10 sync-from-xbos 502 on VPS
5) dev-be P1-HRM-META-11 — UF-HRM-11 company_uuid for metadata change-requests
6) devops P1-HRM-REC-PATCH-DEPLOY — UF-HRM-12 PATCH route on :8088 hrm-api
7) dev-be P1-HRM-EXT-15 — UF-XBOS-15 extension-items read-back

exit: READY_FOR_QA → qa P1-WEB-ACCEPTANCE-CLOSE-01-R2 all web UF 🟢 Dev8088
```
