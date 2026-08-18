# Evidence — PO-HRM-JD-DYNAMIC-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-QA-02` |
| **role** | `qa` |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn` |
| **env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos `:28002` |
| **u65** | browser-only · zero-seed · mutates via FE only (UF) |
| **hdsd_align** | Settings «Cấu hình JD» · Tuyển dụng «Thư viện JD» · `hdsd-jd-*` |
| **Harness** | `node scripts/qa/_tmp-po-hrm-jd-dynamic-qa-02.mjs` |
| **JSON** | `docs/qa/evidence/_tmp-po-hrm-jd-dynamic-qa-02.FINAL.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-02/` (01–16, 15 files) |
| **commit** | `dc930c5` |
| **prior** | `docs/qa/evidence/po-hrm-jd-dynamic-qa-01.md` FAIL (BE 404 + FE testids) |
| **entry** | BE-02 READY · FE-02 READY |
| **ack_status** | **FAIL_TO_PM** |
| **verdict** | **FAIL** |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM+XBOS+portal **200** (process exit noise UV on Windows — services healthy) |
| `qc:fe-be-health` | **ALL PASS** |
| BE-02 | `po-hrm-jd-dynamic-be-02.md` — nest 0 errors · CFG/resolve 200 |
| FE-02 | `po-hrm-jd-dynamic-fe-02.md` — HDSD `hdsd-jd-form-*` / `hdsd-jd-library-*` |

### L0 API smoke (not UF)

| Endpoint | HTTP | Note |
|----------|------|------|
| `GET …/jd-field-defs?company_id=main` | **200** | total≈5 |
| `GET …/jd-group-defs` | **200** | total≈14 |
| `GET …/jd-default-packs` | **200** | total≈3 |
| `GET …/jd-pack-rules` | **200** | total≈7 |
| `POST …/jd-pack-rules/resolve` `{job_family:IT}` | **200** | `pack_code=PACK_IT_OFFICE` |
| `POST …/jd-pack-rules/resolve` `{job_family:DRIVER}` | **200** | `pack_code=PACK_DRIVER_OPS` |

**BE-COMPILE-BLOCK from QA-01: CLOSED** (routes live).

---

## HDSD testids (FE-02 retest)

| Assert | Result |
|--------|--------|
| List `[data-testid="undefined"]` count | **0** 🟢 |
| Dialog `[data-testid="undefined"]` count | **0** 🟢 |
| `hdsd-jd-library-add-btn` | visible 🟢 |
| `hdsd-jd-form-dialog` | visible 🟢 |
| `hdsd-jd-form-position` | visible 🟢 |
| `hdsd-jd-form-submit` | visible 🟢 |

**FE-HDSD-JD-TESTIDS from QA-01: CLOSED.**

---

## Journeys

### J-HRM-JD-01 — Settings field/group/pack/rule → Lưu → F5

| Step | Network / FE | Verdict |
|------|--------------|---------|
| Open Settings → **Cấu hình JD** | Panel `jd-dynamic-settings-panel` · no error alert | 🟢 |
| Thêm field → Lưu | `POST …/jd-field-defs` → **201** · row on list | 🟢 |
| F5 field persist | field rows remain after reload | 🟢 |
| Groups / Packs tabs | groupRows=14 · packRows≥1 | 🟢 surface |
| Rules → Lưu | `PUT …/jd-pack-rules` → **400** `HRM-VAL-001` (extra props: `id`, `company_id`, `created_at`, `pack_label`…) | 🔴 |
| F5 rules | rules editor still shows JSON (GET 200) — **mutate Lưu failed** | 🔴 rules |

Screens: `01`–`06`

**Verdict: 🟡 PARTIAL** — field create+F5 PASS; **rules Lưu FAIL** (FE payload vs DTO).

---

### J-HRM-JD-02 — Thêm JD → pack resolve → DnD → Lưu snapshot v2 → F5

| Step | Network / FE | Verdict |
|------|--------------|---------|
| Thư viện → Thêm JD | dialog + HDSD testids | 🟢 |
| Chọn chức danh | Catalog options (CEO/CHRO/DRIVER_LEAD/POS_*) · no IT-labeled option | 🟡 OBS |
| Pack resolve | `POST …/resolve` → **200** · pack label «Mặc định pháp nhân (PACK_CORP_DEFAULT)» | 🟢 HTTP |
| Canvas always_on | `jd-writer-group-*` **count=0** despite API `always_on_groups.length≥6` | 🔴 |
| Optional DnD | no palette items (groups empty / optional filter) | ⬜ blocked |
| Lưu JD | `POST …/job-templates` → **400** `HRM-JD-LAYOUT-EMPTY` (`layout_snapshot.groups required`) | 🔴 |
| F5 row | QA title **not** present | 🔴 |

**Root cause (contract):** FE `JdTemplateWriterDialog` maps `res.groups`, API resolve returns **`always_on_groups`** (and nested `pack.groups`). Empty canvas → empty snapshot → create 400.

**AC-JD-GRP-10 IT path:** `job_family=IT` API → `PACK_IT_OFFICE` OK; **no catalog position** resolves IT via `position_code` (all → `PACK_CORP_DEFAULT`). Config/catalog gap — **not seeded**.

Screens: `07`–`12`

**Verdict: 🔴 FAIL**

---

### J-HRM-JD-03 — Xem hierarchy §3.6 from snapshot

| Step | Evidence | Verdict |
|------|----------|---------|
| Xem on **existing** library row | `jd-template-view-panel` + `jd-view-group-*` ≥1 | 🟡 OBS mount |
| Snapshot v2 from **this wave** create | **N/A** — J02 create failed | 🔴 not promoted |

Screens: `14`

**Verdict: 🔴 FAIL (not promoted)** — view path OBS only; cannot claim §3.6 for dynamic create.

---

### G4 — đổi chức danh → `jd-writer-pack-confirm` · values kept

| Step | Evidence | Verdict |
|------|----------|---------|
| CEO → CHRO in writer | Positions changed; confirm **not** shown | 🔴 |
| Why | Writer only opens confirm when `snapshot.groups.length > 0`; groups stay empty due to FE map bug → always `replace` path | 🔴 |

Screens: `15`

**Verdict: 🔴 FAIL** (blocked by FE-RESOLVE-GROUPS)

---

### OBS — Driver pack

| Step | Evidence | Verdict |
|------|----------|---------|
| API `job_family=DRIVER` | **200** `PACK_DRIVER_OPS` | 🟢 L1 |
| Settings Preview `position_code=DRIVER` | UI preview miss / empty | 🟡 residual UI |
| Seed | **false** | — |

Screens: `16`

**Verdict: 🟢 API / 🟡 UI preview** — rule exists; UI preview not required for Driver AC if API path documented.

---

## Per-journey rollup

| Journey | Verdict | Network 2xx | FE after 2xx | F5 |
|---------|---------|-------------|--------------|-----|
| L0 CFG+resolve | 🟢 | GET/POST 200 | n/a | n/a |
| HDSD testids | 🟢 | n/a | undefined=0 · getByTestId OK | n/a |
| J-HRM-JD-01 | 🟡 | field 201 · rules **400** | field row yes · rules toast fail | field 🟢 · rules 🔴 |
| J-HRM-JD-02 | 🔴 | resolve 200 · create **400** | pack label yes · canvas empty · no new row | 🔴 |
| J-HRM-JD-03 | 🔴 | GET template 200 (legacy) | hierarchy OBS | n/a wave |
| G4 | 🔴 | resolve 200×2 | no confirm | n/a |
| OBS Driver | 🟢/🟡 | resolve DRIVER 200 | API OK · UI preview soft | n/a |

---

## Forbidden checks (honesty)

| Item | Status |
|------|--------|
| Seed used | **false** |
| Dual-write `job_postings` | **false** |
| `remaster_program_done` claimed | **false** |
| `face_live` claimed | **false** |
| PASS chỉ API | **false** (UF browser executed; FAIL on FE mutate) |
| Diagnostic API create (RC only) | One probe POST with non-empty groups returned 201 to confirm `HRM-JD-LAYOUT-EMPTY` class — **not** UF evidence · **not** promoted |

---

## Residuals (dispatch)

| ID | Owner | Priority | Note |
|----|-------|----------|------|
| **FE-RESOLVE-GROUPS-MAP** | `dev-fe` | **P0** | Map `always_on_groups` (fallback `groups` / `pack.groups`) in `resolveJdPack` consumer / `hrmApi.resolveJdPack` normalize. Unblocks canvas, create snapshot v2, G4 confirm. |
| **FE-RULES-PUT-STRIP** | `dev-fe` | **P1** | Before `putJdPackRules`, strip to DTO: `priority`, `match_type`, `match_value`, `pack_id`/`pack_code`, `condition_json`, `is_active`. Close J01 rules Lưu 400. |
| **OBS-IT-POSITION-CONFIG** | PM / catalog | P2 | No position → `PACK_IT_OFFICE` via `position_code`; only `job_family=IT`. Do **not** seed — configure catalog `job_family` or rule match. |
| OBS-DRIVER-UI-PREVIEW | soft | P3 | Settings preview by `position_code=DRIVER` weak; API job_family OK. |

**Not residual:** BE-COMPILE-BLOCK · FE-HDSD-JD-TESTIDS (both CLOSED this wave).

---

## completion_report

**Closed:** L0 stack + JD CFG/resolve live (IT→`PACK_IT_OFFICE`, DRIVER→`PACK_DRIVER_OPS`); FE-02 HDSD testids verified (`undefined`=0); J01 field create 201 + F5 persist; browser U65 evidence + screens + FINAL JSON; prior BE 404 / FE testid residuals closed.

**Open / residual:** FE resolve `groups` vs `always_on_groups` blocks J02/G4/J03 promote; FE rules PUT whitelist blocks J01 rules Lưu; IT position catalog config OBS.

**ack_status:** `FAIL_TO_PM`

**next_owner:** `dev-fe` (P0+P1) → then `qa` retest `PO-HRM-JD-DYNAMIC-QA-03`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-FE-03
role: dev-fe
entry_criteria:
  - QA FAIL: docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md
  - U65 · no seed · no dual-write job_postings · no remaster/face_live
read_first:
  - docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md §J-HRM-JD-02 root cause + residuals
  - apps/web/hrm/src/integrations/hrmApi.ts resolveJdPack / HrmJdPackResolveResult
  - apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx applyResolve (res.groups)
  - apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx onSaveRules
  - apps/api/hrm-api/src/recruitment/dto/put-jd-pack-rules.dto.ts (allowed fields)
exit_criteria:
  - P0 FE-RESOLVE-GROUPS-MAP: normalize resolve → groups[] from always_on_groups || groups; writer canvas jd-writer-group-* ≥1 after pick position; POST job-templates 2xx with layout_snapshot.groups
  - P1 FE-RULES-PUT-STRIP: Settings Rule Lưu → PUT 2xx (strip id/company_id/created_at/pack_label/…)
  - vitest/unit covering normalize resolve + rules strip
  - must_keep: Settings mount · HDSD testids · no JobPostingsTab JD write
  - evidence: docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
ack_status: READY_FOR_QA
pm_hint_after: PO-HRM-JD-DYNAMIC-QA-03 retest J01 rules + J02 create+F5 + J03 wave snapshot + G4 confirm
```
