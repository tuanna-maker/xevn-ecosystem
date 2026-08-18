# Evidence — PO-HRM-JD-DYNAMIC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-QA-01` |
| **role** | `qa` |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn` |
| **env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos `:28002` |
| **u65** | browser-only · zero-seed · mutates attempted via FE only |
| **hdsd_align** | Settings «Cấu hình JD» · Tuyển dụng «Thư viện JD» · Thêm JD / Xem |
| **Harness** | `node scripts/qa/_tmp-po-hrm-jd-dynamic-qa-01.mjs` |
| **JSON** | `docs/qa/evidence/_tmp-po-hrm-jd-dynamic-qa-01.FINAL.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-01/` (01–16) |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL_TO_PM** |
| **verdict** | **FAIL** |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM+XBOS+portal **200** (hrm-api process up) |
| `qc:fe-be-health` | **ALL PASS** (employees/catalog — not JD routes) |
| BE READY stamp | `docs/qa/evidence/po-hrm-jd-dynamic-be-01.md` |
| FE READY stamp | `docs/qa/evidence/po-hrm-jd-dynamic-fe-01.md` |

### API probe (blocker)

| Endpoint | HTTP |
|----------|------|
| `GET …/jd-field-defs?company_id=main` | **404** `HRM-DATA-404` |
| `GET …/jd-group-defs` | **404** |
| `GET …/jd-default-packs` | **404** |
| `GET …/jd-pack-rules` | **404** |
| `POST …/jd-pack-rules/resolve` `{job_family:IT}` | **404** |

**Root cause (runtime):** `hrm-api` nest `--watch` stuck with **4 TypeScript errors** in `jd-dynamic.service.ts` (observed terminal `823585` @ 11:20:38 — «Found 4 errors. Watching for file changes.»). Process still serves **pre-JD** dist → routes not registered. Jest evidence on BE stamp ≠ live Nest compile.

TS hotspots (from watch log):

1. `existing.company_id` on group update (~L922)
2. `group.usage` after `getGroupDefById` (~L1042)
3. `resolved.pack` cast missing `id`/`label` (~L1309)
4. `detail.id` after `getDefaultPackByCode` (~L1695)

---

## Journeys

### J-HRM-JD-01 — Settings field/group/pack/rule → Lưu → F5

| Step | Evidence | Verdict |
|------|----------|---------|
| Open `/hr/settings` → tab **Cấu hình JD** | Panel `jd-dynamic-settings-panel` visible · tabs Trường/Nhóm/Pack/Rule/L1 | 🟢 surface |
| Load catalog | Alert «Không tìm thấy dữ liệu yêu cầu» · empty fields (bootstrap never runs — GET 404) | 🔴 |
| FE Thêm field | `POST /api/hrm/recruitment/jd-field-defs` → **404** | 🔴 |
| FE Lưu rules | `PUT …/jd-pack-rules` → **404** | 🔴 |
| F5 | fieldRows=0 · panel still mounts | 🔴 persist |

Screens: `01`–`06`

**Verdict: FAIL**

### J-HRM-JD-02 — Thêm JD → pack resolve (IT) → DnD → Lưu snapshot v2 → F5

| Step | Evidence | Verdict |
|------|----------|---------|
| Thư viện JD → **Thêm JD** | Writer dialog opens (title-first) | 🟢 surface |
| Select chức danh | Picked catalog option (OBS: first IT-ish miss → `CEO`) · `POST resolve` **404** | 🔴 |
| Pack label / canvas always_on | No pack label · canvas fallback / no optional palette (CFG 404) | 🔴 |
| Optional DnD | BLOCKED — no optional groups from API | ⬜ blocked |
| Lưu JD | Submit gated / no `POST job-templates` with snapshot v2 | 🔴 |
| F5 row | New QA row **not** present | 🔴 |

Screens: `07`–`12`

**Verdict: FAIL**

### J-HRM-JD-03 — Xem hierarchy §3.6 from snapshot

| Step | Evidence | Verdict |
|------|----------|---------|
| Xem on **existing** library row | `jd-template-view-panel` + `jd-view-group-*` count≥1 · no TopCV purple | 🟡 OBS only |
| Snapshot v2 from this wave create | **N/A** — J02 create failed | 🔴 not promoted |

Honesty: UI view path mounts, but **cannot** claim §3.6 pack-snapshot hierarchy for dynamic wave without J02 PASS.

Screens: `14`

**Verdict: FAIL (not promoted)** — OBS mount only

### G4 — đổi chức danh → confirm apply pack · values kept

| Step | Evidence | Verdict |
|------|----------|---------|
| Change position in writer | Confirm `jd-writer-pack-confirm` **not** shown (resolve 404 / same first option) | 🔴 |

Screens: `15`

**Verdict: FAIL**

### OBS — Driver pack path

| Step | Evidence | Verdict |
|------|----------|---------|
| Settings Preview `position_code=DRIVER` | Empty / API 404 resolve | 🟡 **BLOCKED** config+API |
| Note | Bootstrap rules match `job_family` DRIVER/FLEET — position_code alone may not hit; blocked until resolve live | BLOCKED |

Screens: `16`

---

## Forbidden checks (honesty)

| Item | Status |
|------|--------|
| Seed used | **false** |
| Dual-write `job_postings` | **false** (not exercised) |
| `remaster_program_done` claimed | **false** |
| `face_live` claimed | **false** |

---

## Residuals (dispatch)

| ID | Owner | Note |
|----|-------|------|
| **BE-COMPILE-BLOCK** | `dev-be` | Fix 4 TS errors in `jd-dynamic.service.ts`; confirm nest watch «Found 0 errors» + routes 200; then READY_FOR_QA |
| **FE-HDSD-JD-TESTIDS** | `dev-fe` | `HDSD_MUTATE_TEST_IDS.jdForm*` / `jdLibrary*` referenced but **absent** from `hdsdMutateTestIds.ts` → `data-testid={undefined}` — add stable ids |
| OBS-DRIVER-CONFIG | qa (after BE) | Re-probe Driver via `job_family=DRIVER` once resolve live |

---

## completion_report

**Closed:** U65 browser execution of J-HRM-JD-01..03 + G4 + OBS Driver on live stack; L0 PASS; API probe + FE network proof all JD CFG/resolve **404**; screenshots 01–16 + FINAL JSON; FE surface mount OBS (Settings panel + writer dialog); honesty denials recorded.

**Open / residual:** BE compile blocks all mutates; FE HDSD testids missing; J-* business PASS **not** achieved; J03 view mount not promoted.

**ack_status:** `FAIL_TO_PM`

**next_owner:** `dev-be` (P0) → then `dev-fe` (testids) → `qa` retest `PO-HRM-JD-DYNAMIC-QA-01-R2`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-BE-02
role: dev-be
entry_criteria:
  - QA FAIL: docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md
  - Live hrm-api nest watch: 4 TS errors in jd-dynamic.service.ts → JD routes 404
  - U65 · no seed · no dual-write job_postings
read_first:
  - apps/api/hrm-api/src/recruitment/jd-dynamic.service.ts (~L922 company_id, ~L1042 usage, ~L1309 pack cast, ~L1695 detail.id)
  - docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md §API probe
  - docs/qa/evidence/po-hrm-jd-dynamic-be-01.md
exit_criteria:
  - nest start --watch: Found 0 errors; process reload
  - GET jd-field-defs / jd-group-defs / jd-default-packs / jd-pack-rules?company_id=main → 200
  - POST jd-pack-rules/resolve {company_id, job_family:IT} → 200 PACK_IT_OFFICE (or CORP fallback)
  - jest jd-dynamic.scope-parity still 8/8
  - evidence: docs/qa/evidence/po-hrm-jd-dynamic-be-02.md
ack_status: READY_FOR_QA
pm_hint_parallel: PO-HRM-JD-DYNAMIC-FE-02 — add jdForm*/jdLibrary* to hdsdMutateTestIds.ts
```
